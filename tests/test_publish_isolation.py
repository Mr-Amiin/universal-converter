"""Proves rate publication can only touch the `data` branch (local bare repository as the remote).

Run:  python3 -m unittest tests.test_publish_isolation -v
"""
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLISH = ROOT / "scripts" / "publish_rates.sh"
GUARD = ROOT / "scripts" / "rates_publish_guard.py"
GIT_ID = ["-c", "user.name=t", "-c", "user.email=t@example.com"]


def sh(*cmd, cwd=None, inp=None, check=True, env=None):
    return subprocess.run(list(cmd), cwd=cwd, input=inp, capture_output=True, text=True, check=check, env=env)


def guard(mode, text="", *extra):
    return subprocess.run([sys.executable, str(GUARD), mode, *extra], input=text, capture_output=True, text=True)


def bash_executable():
    if os.name == "nt":
        candidates = [
            os.environ.get("GIT_BASH"),
            r"C:\Program Files\Git\bin\bash.exe",
            r"C:\Program Files (x86)\Git\bin\bash.exe",
        ]
        for candidate in candidates:
            if candidate and Path(candidate).is_file():
                return candidate
        raise FileNotFoundError("Git Bash was not found; install Git for Windows or set GIT_BASH")
    return "bash"


def bash_path(path):
    value = str(path)
    if os.name == "nt":
        drive, tail = os.path.splitdrive(value)
        if drive:
            return "/" + drive[0].lower() + tail.replace(chr(92), "/")
    return value


class GuardTests(unittest.TestCase):
    def test_pages_source_rules(self):
        self.assertEqual(guard("pages", json.dumps({"build_type": "legacy", "source": {"branch": "main", "path": "/"}})).returncode, 0)
        self.assertEqual(guard("pages", json.dumps({"build_type": "workflow"})).returncode, 0)
        self.assertEqual(guard("pages", json.dumps({"build_type": "legacy", "source": {"branch": "data"}})).returncode, 1)
        self.assertEqual(guard("pages", "not json").returncode, 1)
        self.assertEqual(guard("pages", "", "--unreadable").returncode, 1)
        self.assertEqual(guard("pages", json.dumps({"message": "Not Found"})).returncode, 1)

    def test_only_rates_json_may_be_staged(self):
        self.assertEqual(guard("staged", "rates.json\n").returncode, 0)
        self.assertEqual(guard("staged", "").returncode, 0)  # nothing staged -> nothing to publish
        self.assertEqual(guard("staged", "rates.json\napp.js\n").returncode, 1)
        self.assertEqual(guard("staged", "index.html\n").returncode, 1)

    def test_push_output_must_only_touch_data(self):
        ok = "To /x\n*\tHEAD:refs/heads/data\t[new branch]\nDone\n"
        bad = "To /x\n \tHEAD:refs/heads/main\t1..2\nDone\n"
        both = "*\tHEAD:refs/heads/data\t[new branch]\n \tHEAD:refs/heads/main\t1..2\n"
        self.assertEqual(guard("push", ok).returncode, 0)
        self.assertEqual(guard("push", bad).returncode, 1)
        self.assertEqual(guard("push", both).returncode, 1)
        self.assertEqual(guard("push", "nothing").returncode, 1)


class PublishTests(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        t = Path(self._tmp.name)
        self.origin = t / "origin.git"
        sh("git", "init", "-q", "--bare", "-b", "main", str(self.origin))
        seed = t / "seed"
        sh("git", "clone", "-q", str(self.origin), str(seed))
        (seed / "index.html").write_text("website")
        sh("git", *GIT_ID, "-C", str(seed), "checkout", "-q", "-b", "main")
        sh("git", "-C", str(seed), "add", ".")
        sh("git", *GIT_ID, "-C", str(seed), "commit", "-q", "-m", "site")
        sh("git", "-C", str(seed), "push", "-q", "origin", "main")
        self.main_sha = sh("git", "-C", str(self.origin), "rev-parse", "main").stdout.strip()
        self.data = t / "_data"
        sh("git", "init", "-q", "-b", "data", str(self.data))
        sh("git", "-C", str(self.data), "remote", "add", "origin", str(self.origin))

    def tearDown(self):
        self._tmp.cleanup()

    def publish(self, payload="{}"):
        (self.data / "rates.json").write_text(payload)
        env = os.environ.copy()
        if os.name == "nt":
            # Git Bash uses POSIX paths and can execute the installed Windows Python via /c/... .
            drive, tail = os.path.splitdrive(sys.executable)
            env["PYTHON_BIN"] = "/" + drive[0].lower() + tail.replace(chr(92), "/")
        else:
            env["PYTHON_BIN"] = sys.executable
        return sh(bash_executable(), bash_path(PUBLISH), bash_path(self.data), "2026-10-29", check=False, env=env)

    def remote_ref(self, name):
        r = sh("git", "-C", str(self.origin), "rev-parse", "--verify", "-q", name, check=False)
        return r.stdout.strip() or None

    def test_publishes_to_data_only_and_never_touches_main(self):
        proc = self.publish('{"a": 1}')
        self.assertEqual(proc.returncode, 0, proc.stderr + proc.stdout)
        self.assertEqual(self.remote_ref("main"), self.main_sha, "main must be untouched")
        self.assertIsNotNone(self.remote_ref("data"))
        files = sh("git", "-C", str(self.origin), "ls-tree", "-r", "--name-only", "data").stdout.split()
        self.assertEqual(files, ["rates.json"], "the data branch contains only rates.json")
        branches = sh("git", "-C", str(self.origin), "for-each-ref", "--format=%(refname)").stdout.split()
        self.assertEqual(sorted(branches), ["refs/heads/data", "refs/heads/main"])
        # second, changed publication adds a commit to data and still leaves main alone
        proc = self.publish('{"a": 2}')
        self.assertEqual(proc.returncode, 0, proc.stderr)
        self.assertEqual(sh("git", "-C", str(self.origin), "rev-list", "--count", "data").stdout.strip(), "2")
        self.assertEqual(self.remote_ref("main"), self.main_sha)

    def test_unchanged_file_publishes_nothing(self):
        self.publish('{"a": 1}')
        before = self.remote_ref("data")
        proc = self.publish('{"a": 1}')
        self.assertEqual(proc.returncode, 0)
        self.assertIn("nothing to publish", proc.stdout)
        self.assertEqual(self.remote_ref("data"), before)

    def test_extra_staged_file_is_refused(self):
        (self.data / "app.js").write_text("// oops")
        sh("git", "-C", str(self.data), "add", "app.js")
        proc = self.publish('{"a": 1}')
        self.assertNotEqual(proc.returncode, 0)
        self.assertIsNone(self.remote_ref("data"), "nothing may be pushed")
        self.assertEqual(self.remote_ref("main"), self.main_sha)

    def test_wrong_branch_is_refused(self):
        sh("git", "-C", str(self.data), "checkout", "-q", "-b", "main")
        proc = self.publish('{"a": 1}')
        self.assertNotEqual(proc.returncode, 0)
        self.assertIn("not on the data branch", proc.stderr)
        self.assertEqual(self.remote_ref("main"), self.main_sha)


if __name__ == "__main__":
    unittest.main()

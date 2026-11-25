from __future__ import annotations

import importlib.util
import tempfile
import unittest
import subprocess
from pathlib import Path
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parents[2] / "scripts" / "indexnow-submit.py"
SPEC = importlib.util.spec_from_file_location("indexnow_submit", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class QueueHelperTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.state = MODULE.default_state()

    def tearDown(self):
        self.temp.cleanup()

    def test_enqueue_chunks_at_1000_and_deduplicates_pending(self):
        urls = [f"https://www.theuniversalconverter.com/page-{i}.html" for i in range(2205)]
        count = MODULE.enqueue_urls(self.root, self.state, urls, 1000)
        self.assertEqual(count, 2205)
        files = MODULE.pending_files(self.root)
        self.assertEqual([len(MODULE.read_pending_file(p)) for p in files], [1000, 1000, 205])
        self.assertEqual(MODULE.enqueue_urls(self.root, self.state, urls[:10], 1000), 0)
        self.assertEqual(MODULE.pending_url_count(self.root), 2205)

    def test_deleted_urls_are_removed_from_pending_only(self):
        urls = [f"https://www.theuniversalconverter.com/page-{i}.html" for i in range(12)]
        MODULE.enqueue_urls(self.root, self.state, urls, 1000)
        removed = MODULE.remove_deleted_from_queue(self.root, {urls[1], urls[5], "https://x.invalid/not-present"})
        self.assertEqual(removed, 2)
        remaining = [u for p in MODULE.pending_files(self.root) for u in MODULE.read_pending_file(p)]
        self.assertEqual(len(remaining), 10)
        self.assertNotIn(urls[1], remaining)
        self.assertNotIn(urls[5], remaining)

    def test_take_next_batch_does_not_exceed_limit(self):
        urls = [f"https://www.theuniversalconverter.com/page-{i}.html" for i in range(1001)]
        MODULE.enqueue_urls(self.root, self.state, urls, 1000)
        first = MODULE.take_next_batch(self.root, 1000)
        self.assertIsNotNone(first)
        self.assertEqual(len(first[1]), 1000)

    def test_public_html_url_handles_index_and_exclusions(self):
        (self.root / "tools").mkdir()
        (self.root / "tools" / "index.html").write_text("ok", encoding="utf-8")
        (self.root / "space page.html").write_text("ok", encoding="utf-8")
        old_cwd = Path.cwd()
        try:
            import os
            os.chdir(self.root)
            self.assertEqual(
                MODULE.public_html_url("tools/index.html", require_file=True),
                "https://www.theuniversalconverter.com/tools/",
            )
            self.assertEqual(
                MODULE.public_html_url("space page.html", require_file=True),
                "https://www.theuniversalconverter.com/space%20page.html",
            )
            self.assertIsNone(MODULE.public_html_url("scripts/indexnow-submit.py.html", require_file=False))
            self.assertIsNone(MODULE.public_html_url(".hidden/page.html", require_file=False))
        finally:
            os.chdir(old_cwd)


    def test_scan_diff_queues_added_and_modified_html_only(self):
        import os
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            repo = root / "repo"
            state_root = root / "state"
            state_root.mkdir()
            repo.mkdir()
            subprocess.run(["git", "init", "-b", "main", str(repo)], check=True, capture_output=True)
            subprocess.run(["git", "config", "user.name", "Test"], cwd=repo, check=True)
            subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=repo, check=True)
            (repo / "index.html").write_text("old", encoding="utf-8")
            (repo / "removed.html").write_text("remove me", encoding="utf-8")
            (repo / "site.css").write_text("a{}", encoding="utf-8")
            subprocess.run(["git", "add", "."], cwd=repo, check=True)
            subprocess.run(["git", "commit", "-m", "baseline"], cwd=repo, check=True, capture_output=True)
            base_sha = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=repo, text=True).strip()

            (repo / "index.html").write_text("updated", encoding="utf-8")
            (repo / "new").mkdir()
            (repo / "new" / "index.html").write_text("new page", encoding="utf-8")
            (repo / "removed.html").unlink()
            (repo / "site.css").write_text("b{}", encoding="utf-8")
            subprocess.run(["git", "add", "-A"], cwd=repo, check=True)
            subprocess.run(["git", "commit", "-m", "site update"], cwd=repo, check=True, capture_output=True)
            target_sha = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=repo, text=True).strip()

            state = {
                "last_scanned_deployment": {"id": 1, "sha": base_sha, "created_at": "2026-01-01T00:00:00Z"},
                "next_batch_number": 1,
            }
            deployment = {"id": 2, "sha": target_sha, "created_at": "2026-01-02T00:00:00Z"}
            original_cwd = Path.cwd()
            try:
                os.chdir(repo)
                queued, deleted_removed, deleted_urls = MODULE.scan_and_enqueue(
                    repo, state_root, state, deployment, 1000
                )
            finally:
                os.chdir(original_cwd)

            self.assertEqual(queued, 2)
            self.assertEqual(deleted_removed, 0)
            self.assertEqual(deleted_urls, ["https://www.theuniversalconverter.com/removed.html"])
            all_pending = [u for p in MODULE.pending_files(state_root) for u in MODULE.read_pending_file(p)]
            self.assertEqual(set(all_pending), {
                "https://www.theuniversalconverter.com/",
                "https://www.theuniversalconverter.com/new/",
            })
            self.assertEqual(state["last_scanned_deployment"]["sha"], target_sha)

    def test_orphan_queue_branch_can_be_created_pushed_and_updated(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            repo = root / "repo"
            remote = root / "remote.git"
            repo.mkdir()
            subprocess.run(["git", "init", "--bare", str(remote)], check=True, capture_output=True)
            subprocess.run(["git", "init", "-b", "main", str(repo)], check=True, capture_output=True)
            subprocess.run(["git", "config", "user.name", "Test"], cwd=repo, check=True)
            subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=repo, check=True)
            (repo / "index.html").write_text("test", encoding="utf-8")
            subprocess.run(["git", "add", "."], cwd=repo, check=True)
            subprocess.run(["git", "commit", "-m", "initial"], cwd=repo, check=True, capture_output=True)
            subprocess.run(["git", "remote", "add", "origin", str(remote)], cwd=repo, check=True)
            subprocess.run(["git", "push", "-u", "origin", "main"], cwd=repo, check=True, capture_output=True)

            recorded_git_commands = []
            real_git = MODULE.git

            def recording_git(args, cwd=None, *, capture=True):
                recorded_git_commands.append(list(args))
                return real_git(args, cwd=cwd, capture=capture)

            with patch.object(MODULE, "git", side_effect=recording_git):
                worktree, is_new = MODULE.create_queue_worktree(repo, "indexnow-queue")
            try:
                self.assertTrue(is_new)

                # First-time queue creation must use Git's native orphan-worktree
                # mode instead of checking out the full main/site tree and then
                # switching to an orphan branch.
                add_commands = [
                    command for command in recorded_git_commands
                    if command[:2] == ["worktree", "add"]
                ]
                self.assertEqual(len(add_commands), 1)
                self.assertEqual(
                    add_commands[0][2:5],
                    ["--orphan", "-b", "indexnow-queue"],
                )
                self.assertNotIn("--detach", add_commands[0])

                # The new worktree starts with an empty tree and an unborn branch.
                self.assertEqual(
                    sorted(item.name for item in worktree.iterdir() if item.name != ".git"),
                    [],
                )
                self.assertEqual(
                    subprocess.check_output(
                        ["git", "symbolic-ref", "--short", "HEAD"],
                        cwd=worktree,
                        text=True,
                    ).strip(),
                    "indexnow-queue",
                )
                head_check = subprocess.run(
                    ["git", "rev-parse", "--verify", "HEAD"],
                    cwd=worktree,
                    capture_output=True,
                    text=True,
                )
                self.assertNotEqual(head_check.returncode, 0)

                state = MODULE.default_state()
                MODULE.save_state(worktree, state)
                self.assertTrue(MODULE.commit_and_push_state(worktree, "indexnow-queue", "seed queue"))
                tree_files = subprocess.check_output(
                    ["git", "--git-dir", str(remote), "ls-tree", "-r", "--name-only", "refs/heads/indexnow-queue"],
                    text=True,
                ).splitlines()
                self.assertEqual(tree_files, ["queue-state.json"])

                # The first queue commit must be a root commit with no parent.
                root_commit = subprocess.check_output(
                    ["git", "--git-dir", str(remote), "rev-list", "--parents", "-n", "1", "refs/heads/indexnow-queue"],
                    text=True,
                ).strip().split()
                self.assertEqual(len(root_commit), 1)
            finally:
                MODULE.git(["worktree", "remove", "--force", str(worktree)], cwd=repo)

            worktree, is_new = MODULE.create_queue_worktree(repo, "indexnow-queue")
            try:
                self.assertFalse(is_new)
                state = MODULE.load_state(worktree)
                state["accepted_url_count"] = 7
                MODULE.save_state(worktree, state)
                self.assertTrue(MODULE.commit_and_push_state(worktree, "indexnow-queue", "update queue"))
            finally:
                MODULE.git(["worktree", "remove", "--force", str(worktree)], cwd=repo)

    def test_historical_success_still_counts_after_inactive_status(self):
        statuses = [
            {"state": "inactive", "created_at": "2026-11-25T02:31:02Z", "id": 30},
            {"state": "success", "created_at": "2026-11-24T21:57:11Z", "id": 20},
            {"state": "in_progress", "created_at": "2026-11-24T21:56:53Z", "id": 10},
        ]
        with patch.object(MODULE, "deployment_status_history", return_value=statuses):
            self.assertTrue(MODULE.deployment_ever_succeeded("owner/repo", {"id": 123}))

    def test_http_200_and_202_both_acknowledge_submission(self):
        self.assertTrue(MODULE.is_submission_confirmed(200))
        self.assertTrue(MODULE.is_submission_confirmed(202))
        self.assertFalse(MODULE.is_submission_confirmed(400))
        self.assertFalse(MODULE.is_submission_confirmed(403))
        self.assertFalse(MODULE.is_submission_confirmed(429))

    def test_initial_baseline_matches_verified_first_activation(self):
        self.assertEqual(
            MODULE.default_state()["last_scanned_deployment"]["sha"],
            "30dadfdccdef",
        )


if __name__ == "__main__":
    unittest.main()

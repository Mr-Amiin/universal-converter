#!/usr/bin/env python3
"""
update_sitemaps.py - regenerate and validate the sitemaps in one command.

This is the step to run before committing when pages were added, removed or
had their canonical tag changed. It takes a few minutes (it reads the head of
every HTML page), NOT the ~50 minutes of build.py, and it only touches
sitemap.xml and sitemap-NNNN.xml.

    python3 update_sitemaps.py            # regenerate, then validate
    python3 update_sitemaps.py --check    # change nothing; fail if the committed
                                          # sitemaps are out of date or invalid

Both modes work on the repository root, which is the folder GitHub Pages
publishes when it serves the repository root. Exit code 0 only if everything passed.
Extra arguments after "--" are passed to the generator, e.g.  -- --max-dropped-pct 0
"""
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent


def run(label, argv):
    print(f"\n=== {label}\n$ {' '.join(argv)}", flush=True)
    code = subprocess.run(argv, cwd=HERE).returncode
    if code != 0:
        print(f"\nFAILED: {label} (exit code {code})", file=sys.stderr)
    return code


def main(argv):
    extra = []
    if "--" in argv:
        i = argv.index("--")
        argv, extra = argv[:i], argv[i + 1:]
    check = "--check" in argv
    unknown = [a for a in argv if a != "--check"]
    if unknown:
        print(f"unknown argument(s): {unknown}", file=sys.stderr)
        return 2
    py = sys.executable
    gen = [py, str(HERE / "generate_sitemaps.py"), "--site-dir", str(HERE), "--out-dir", str(HERE)]
    if check:
        gen.append("--check")
    if run("generate sitemaps" if not check else "check sitemaps are current", gen + extra):
        return 1
    if run("validate sitemaps", [py, str(HERE / "validate_sitemaps.py"), "--site-dir", str(HERE), "--require-canonical"]):
        return 1
    print("\nOK: sitemap.xml and every sitemap-NNNN.xml " + ("are current and valid." if check else "were regenerated and validated. Commit them together."))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

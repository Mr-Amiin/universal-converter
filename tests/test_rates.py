"""Tests for fetch_rates.py (offline: uses a synthetic fixture, never the network).

Run:  python3 -m unittest tests.test_rates -v
"""
import copy
import hashlib
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FIXTURE = ROOT / "tests" / "fixtures" / "frankfurter_usd.json"
SCRIPT = ROOT / "fetch_rates.py"
NOW = "2026-10-30T12:00:00Z"
CURRENCIES = list(json.loads((ROOT / "currency-data.json").read_text(encoding="utf-8")).keys())


def run_script(tmp, rows=None, previous=None, extra=(), config_override=None, now=NOW):
    tmp = Path(tmp)
    fixture = tmp / "rows.json"
    fixture.write_text(json.dumps(rows if rows is not None else json.loads(FIXTURE.read_text())), encoding="utf-8")
    out = tmp / "out" / "rates.json"
    cmd = [sys.executable, str(SCRIPT), "--input-fixture", str(fixture), "--output", str(out), "--now", now]
    if previous is not None:
        prev = tmp / "prev.json"
        prev.write_text(json.dumps(previous), encoding="utf-8")
        cmd += ["--previous", str(prev)]
    if config_override:
        cfg = json.loads((ROOT / "rates-config.json").read_text())
        cfg.update(config_override)
        cfg_path = tmp / "cfg.json"
        cfg_path.write_text(json.dumps(cfg))
        cmd += ["--config", str(cfg_path)]
    proc = subprocess.run(cmd + list(extra), capture_output=True, text=True)
    return proc, out


def convert(ds, amount, a, b):
    """Exactly the website formula: amount * rate[from] / rate[to] (rates are USD per unit)."""
    return amount * ds["rates"][a] / ds["rates"][b]


class DatasetTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        proc, out = run_script(cls.tmp.name)
        assert proc.returncode == 0, proc.stderr + proc.stdout
        cls.ds = json.loads(out.read_text())

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def test_covers_all_156_currencies_exactly(self):
        self.assertEqual(len(CURRENCIES), 156)
        self.assertEqual(list(self.ds["rates"]), CURRENCIES)
        self.assertTrue(all(isinstance(v, float) and v > 0 for v in self.ds["rates"].values()))
        self.assertEqual(self.ds["rates"]["USD"], 1.0)

    def test_direction_usd_eur_known_value(self):
        # Provider: 1 USD = 0.8739 EUR  ->  site: 1 EUR = 1.1443 USD
        self.assertAlmostEqual(self.ds["rates"]["EUR"], 1 / 0.8739, places=9)
        self.assertAlmostEqual(convert(self.ds, 1, "USD", "EUR"), 0.8739, places=9)
        self.assertAlmostEqual(convert(self.ds, 1, "EUR", "USD"), 1 / 0.8739, places=9)

    def test_direction_usd_inr_kes_sos_both_ways(self):
        for code, per_usd in (("INR", 88.25), ("KES", 129.2), ("SOS", 571.0)):
            with self.subTest(code=code):
                self.assertAlmostEqual(convert(self.ds, 1, "USD", code), per_usd, places=6)
                self.assertAlmostEqual(convert(self.ds, per_usd, code, "USD"), 1.0, places=9)
                self.assertAlmostEqual(convert(self.ds, 1, code, "USD"), 1 / per_usd, places=12)

    def test_cross_pairs_consistent_and_reciprocal(self):
        # EUR -> INR must equal (INR per USD) / (EUR per USD); round trips must return to 1.
        self.assertAlmostEqual(convert(self.ds, 1, "EUR", "INR"), 88.25 / 0.8739, places=6)
        for a, b in (("USD", "KES"), ("EUR", "SOS"), ("INR", "KES"), ("GBP", "JPY"), ("SOS", "INR")):
            with self.subTest(pair=(a, b)):
                self.assertAlmostEqual(convert(self.ds, 1, a, b) * convert(self.ds, 1, b, a), 1.0, places=9)
        triangle = convert(self.ds, 1, "EUR", "KES") * convert(self.ds, 1, "KES", "INR") * convert(self.ds, 1, "INR", "EUR")
        self.assertAlmostEqual(triangle, 1.0, places=9)

    def test_bgn_hrk_fixed_conversion_factors(self):
        self.assertAlmostEqual(convert(self.ds, 1, "EUR", "BGN"), 1.95583, places=9)
        self.assertAlmostEqual(convert(self.ds, 1, "EUR", "HRK"), 7.53450, places=9)
        self.assertAlmostEqual(convert(self.ds, 1.95583, "BGN", "EUR"), 1.0, places=9)
        self.assertAlmostEqual(self.ds["rates"]["BGN"], (1 / 0.8739) / 1.95583, places=9)
        self.assertAlmostEqual(self.ds["rates"]["HRK"], (1 / 0.8739) / 7.53450, places=9)
        for code, fixed in (("BGN", "1.95583"), ("HRK", "7.53450")):
            m = self.ds["meta"][code]
            self.assertEqual(m["status"], "legacy_fixed_conversion")
            self.assertEqual(m["fixed_units_per_eur"], fixed)
            self.assertEqual(m["date"], self.ds["meta"]["EUR"]["date"])

    def test_metadata_flags_and_dates(self):
        self.assertEqual(self.ds["meta"]["USD"]["status"], "base")
        self.assertEqual(self.ds["meta"]["EUR"]["status"], "reference")
        self.assertIn("managed_or_pegged", self.ds["meta"]["AED"]["flags"])
        self.assertIn("official_rate_may_differ_from_market", self.ds["meta"]["SOS"]["flags"])
        self.assertEqual(self.ds["observation_date"], "2026-10-29")
        self.assertEqual(self.ds["retrieved_at"], "2026-10-30T12:00:00Z")
        self.assertEqual(self.ds["schema_version"], 2)

    def test_no_secrets_or_html_in_output(self):
        text = json.dumps(self.ds).lower()
        self.assertNotIn("<html", text)
        self.assertNotIn("api_key", text)


class FailureTests(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.tmp = self._tmp.name
        proc, out = run_script(self.tmp)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        self.good = json.loads(out.read_text())

    def tearDown(self):
        self._tmp.cleanup()

    def rows(self):
        return json.loads(FIXTURE.read_text())

    def assert_rejected(self, proc, out, code=3):
        self.assertEqual(proc.returncode, code, proc.stdout + proc.stderr)
        self.assertFalse(out.exists(), "a rejected dataset must not be written")

    def test_empty_response_rejected(self):
        proc, out = run_script(self.tmp + "/a", rows=[]) if os.makedirs(self.tmp + "/a", exist_ok=True) is None else (None, None)
        self.assert_rejected(proc, out)

    def test_malformed_responses_rejected(self):
        cases = {
            "dict_not_list": {"rates": {}},
            "string": "oops",
            "negative_rate": [dict(r, rate=-1) if r["quote"] == "EUR" else r for r in self.rows()],
            "zero_rate": [dict(r, rate=0) if r["quote"] == "KES" else r for r in self.rows()],
            "string_rate": [dict(r, rate="0.87") if r["quote"] == "EUR" else r for r in self.rows()],
            "bad_date": [dict(r, date="yesterday") if r["quote"] == "EUR" else r for r in self.rows()],
            "wrong_base": [dict(r, base="EUR") for r in self.rows()],
        }
        for name, rows in cases.items():
            with self.subTest(case=name):
                d = Path(self.tmp) / name
                d.mkdir()
                proc, out = run_script(d, rows=rows)
                self.assert_rejected(proc, out)

    def test_incomplete_currency_coverage_rejected(self):
        rows = [r for r in self.rows() if r["quote"] not in ("KES", "SOS")]
        proc, out = run_script(self.tmp + "/inc", rows=rows) if os.makedirs(self.tmp + "/inc") is None else (None, None)
        self.assert_rejected(proc, out)
        self.assertIn("KES", proc.stderr)

    def test_wrong_direction_data_rejected_by_sentinels(self):
        inverted = [dict(r, rate=1 / r["rate"]) for r in self.rows()]
        os.makedirs(self.tmp + "/inv")
        proc, out = run_script(self.tmp + "/inv", rows=inverted)
        self.assert_rejected(proc, out)
        self.assertIn("sentinel", proc.stderr)

    def test_stale_provider_data_rejected(self):
        os.makedirs(self.tmp + "/stale")
        proc, out = run_script(self.tmp + "/stale", now="2026-11-20T12:00:00Z")
        self.assert_rejected(proc, out)
        self.assertIn("stale", proc.stderr)

    def test_older_dataset_never_replaces_newer(self):
        newer = copy.deepcopy(self.good)
        newer["observation_date"] = "2026-10-30"
        os.makedirs(self.tmp + "/old")
        proc, out = run_script(self.tmp + "/old", previous=newer)
        self.assert_rejected(proc, out)
        self.assertIn("older", proc.stderr)

    def test_implausible_jump_rejected_unless_operator_allows(self):
        prev = copy.deepcopy(self.good)
        prev["rates"]["KES"] *= 3  # published value was 3x -> candidate is a 66% drop
        os.makedirs(self.tmp + "/jump")
        proc, out = run_script(self.tmp + "/jump", previous=prev)
        self.assert_rejected(proc, out)
        self.assertIn("jumps", proc.stderr)
        os.makedirs(self.tmp + "/jump2")
        proc, out = run_script(self.tmp + "/jump2", previous=prev, extra=["--allow-large-moves"])
        self.assertEqual(proc.returncode, 0, proc.stderr)

    def test_network_failure_exits_2_and_keeps_last_known_good(self):
        good_path = Path(self.tmp) / "published" / "rates.json"
        good_path.parent.mkdir()
        good_path.write_text(json.dumps(self.good), encoding="utf-8")
        before = hashlib.sha256(good_path.read_bytes()).hexdigest()
        cfg = json.loads((ROOT / "rates-config.json").read_text())
        cfg.update(api_url="http://127.0.0.1:9/v2/rates?base=USD", retries=1, timeout_seconds=2)
        cfg_path = Path(self.tmp) / "cfg_net.json"
        cfg_path.write_text(json.dumps(cfg))
        proc = subprocess.run(
            [sys.executable, str(SCRIPT), "--config", str(cfg_path), "--previous", str(good_path), "--output", str(good_path), "--now", NOW],
            capture_output=True, text=True,
        )
        self.assertEqual(proc.returncode, 2, proc.stderr)
        self.assertEqual(hashlib.sha256(good_path.read_bytes()).hexdigest(), before)
        self.assertEqual([p.name for p in good_path.parent.iterdir()], ["rates.json"], "no temp files left behind")

    def test_validation_failure_keeps_last_known_good_file_byte_identical(self):
        good_path = Path(self.tmp) / "published" / "rates.json"
        good_path.parent.mkdir()
        good_path.write_text(json.dumps(self.good), encoding="utf-8")
        before = hashlib.sha256(good_path.read_bytes()).hexdigest()
        bad_rows = Path(self.tmp) / "bad.json"
        bad_rows.write_text(json.dumps([r for r in self.rows() if r["quote"] != "INR"]))
        proc = subprocess.run(
            [sys.executable, str(SCRIPT), "--input-fixture", str(bad_rows), "--previous", str(good_path), "--output", str(good_path), "--now", NOW],
            capture_output=True, text=True,
        )
        self.assertEqual(proc.returncode, 3, proc.stderr)
        self.assertEqual(hashlib.sha256(good_path.read_bytes()).hexdigest(), before)

    def test_unchanged_provider_data_keeps_data_changed_at(self):
        os.makedirs(self.tmp + "/same")
        proc, out = run_script(self.tmp + "/same", previous=self.good, now="2026-10-30T18:00:00Z")
        self.assertEqual(proc.returncode, 0, proc.stderr)
        ds = json.loads(out.read_text())
        self.assertEqual(ds["retrieved_at"], "2026-10-30T18:00:00Z")
        self.assertEqual(ds["data_changed_at"], self.good["data_changed_at"])
        self.assertIn("content_changed=False", proc.stdout)

    def test_older_per_currency_value_does_not_replace_newer(self):
        # Published data has KES observed on 10-30; the new response still carries KES dated 10-29
        # while another currency (EUR) is already on 10-30. KES must keep the newer published value.
        prev = copy.deepcopy(self.good)
        prev["meta"]["KES"]["date"] = "2026-10-30"
        prev["observation_date"] = "2026-10-30"
        prev["rates"]["KES"] = self.good["rates"]["KES"] * 1.01
        rows = [dict(r, date="2026-10-30") if r["quote"] == "EUR" else r for r in self.rows()]
        os.makedirs(self.tmp + "/reg")
        proc, out = run_script(self.tmp + "/reg", rows=rows, previous=prev)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        ds = json.loads(out.read_text())
        self.assertEqual(ds["rates"]["KES"], prev["rates"]["KES"])
        self.assertEqual(ds["meta"]["KES"]["date"], "2026-10-30")
        self.assertIn("kept newer published values", proc.stdout)


class ProviderAttributionTests(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.tmp = Path(self._tmp.name)

    def tearDown(self):
        self._tmp.cleanup()

    def rows(self):
        return json.loads(FIXTURE.read_text())

    def run_rows(self, rows, name="r"):
        d = self.tmp / name
        d.mkdir()
        return run_script(d, rows=rows)

    def test_uses_default_blended_endpoint_with_expand_providers(self):
        cfg = json.loads((ROOT / "rates-config.json").read_text())
        self.assertEqual(cfg["api_url"], "https://api.frankfurter.dev/v2/rates?base=USD&expand=providers")
        self.assertNotIn("/providers/", cfg["api_url"], "individual-provider endpoints must not be used")
        self.assertNotIn("providers=", cfg["api_url"].replace("expand=providers", ""))

    def test_provider_attribution_preserved_per_currency(self):
        proc, out = self.run_rows(self.rows())
        ds = json.loads(out.read_text())
        self.assertEqual(ds["meta"]["INR"]["providers"], ["ECB", "RBI"])
        self.assertEqual(ds["meta"]["INR"]["basis"], "blended")
        self.assertEqual(ds["meta"]["KES"]["providers"], ["CBK", "ECB"])

    def test_pegged_rows_without_providers_are_handled_not_invented(self):
        proc, out = self.run_rows(self.rows())
        ds = json.loads(out.read_text())
        aed = ds["meta"]["AED"]
        self.assertNotIn("providers", aed)
        self.assertEqual(aed["basis"], "no_provider_attribution")
        self.assertEqual(aed["status"], "reference")
        self.assertIn("managed_or_pegged", aed["flags"])

    def test_object_form_providers_and_excluded_outliers(self):
        rows = [dict(r, providers=[{"key": "ECB", "rate": 0.87}, {"key": "XYZ", "excluded": True}]) if r["quote"] == "EUR" else r for r in self.rows()]
        proc, out = self.run_rows(rows)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        self.assertEqual(json.loads(out.read_text())["meta"]["EUR"]["providers"], ["ECB"])

    def test_malformed_providers_rejected(self):
        rows = [dict(r, providers="ECB") if r["quote"] == "EUR" else r for r in self.rows()]
        proc, out = self.run_rows(rows, "bad")
        self.assertEqual(proc.returncode, 3)
        self.assertFalse(out.exists())

    def test_coverage_report_lists_everything_required(self):
        proc, out = self.run_rows(self.rows(), "rep")
        text = proc.stdout
        for needle in (
            "provider-supplied currencies present: 153/153", "missing from provider response: none",
            "all 156 website currency codes present", "USD is the base currency",
            "BGN derived fixed conversion (1 EUR = 1.95583 BGN)", "HRK derived fixed conversion (1 EUR = 7.53450 HRK)",
            "seed rates used: 0", "USD/EUR present", "USD/INR present", "USD/KES present", "USD/SOS present",
            "EUR 2026-10-29", "KES 2026-10-29", "SOS 2026-10-29", "attributed to providers: 119",
        ):
            self.assertIn(needle, text)
        import re
        self.assertEqual(sum(1 for line in text.splitlines() if re.match(r"^[A-Z]{3} 2026-10-29 ", line)), 155)  # 153 provider + BGN + HRK

    def test_missing_expected_currencies_stop_and_are_reported(self):
        rows = [r for r in self.rows() if r["quote"] not in ("KES", "SOS", "AED")]
        proc, out = self.run_rows(rows, "miss")
        self.assertEqual(proc.returncode, 3)
        self.assertFalse(out.exists())
        self.assertIn("provider-supplied currencies present: 150/153", proc.stdout)
        self.assertIn("STOP", proc.stderr)
        for code in ("KES", "SOS", "AED"):
            self.assertIn(code, proc.stderr)

    def test_old_seed_file_is_never_used_as_a_source(self):
        seed = json.loads((ROOT / "rates.json").read_text())
        d = self.tmp / "seed"
        d.mkdir()
        proc, out = run_script(d, rows=[r for r in self.rows() if r["quote"] != "KES"], previous=seed)
        self.assertEqual(proc.returncode, 3)
        self.assertFalse(out.exists(), "a missing currency must not be filled from the old seed")

    def test_step_summary_written_when_github_provides_one(self):
        summary = self.tmp / "summary.md"
        fixture = self.tmp / "rows.json"
        fixture.write_text(json.dumps(self.rows()))
        env = dict(os.environ, GITHUB_STEP_SUMMARY=str(summary))
        proc = subprocess.run([sys.executable, str(SCRIPT), "--input-fixture", str(fixture), "--dry-run", "--now", NOW], capture_output=True, text=True, env=env)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        md = summary.read_text()
        self.assertIn("| KES | 2026-10-29 | 129.2 |", md)
        self.assertIn("| BGN | 2026-10-29 | (derived) |", md)


if __name__ == "__main__":
    unittest.main()

"""Observation-date and provider-response safety tests for fetch_rates.py (offline: synthetic fixtures,
never the network). Also pins the 2026-11-07 AAVE failure (see UnsupportedProviderQuotes below).

Run:  python3 -m unittest tests.test_rates_dates -v

Covers the 2026-11-07 incident: a Friday-evening run published rows dated Saturday (one day ahead of
the run date); every later run saw the provider's real newest date (Friday), looked "older than the
published dataset", and failed validation (exit 3) until new business-day data arrived.

Rules under test
  * No published observation date is ever later than the run date (UTC).
  * A row dated up to `max_forward_dated_days` (default 1) ahead is capped at the run date, keeping the
    provider's original date in meta[code].provider_date plus the flag "forward_dated_clamped".
    A row further ahead is rejected.
  * Genuinely older data is still rejected; genuinely newer data is still accepted.
  * Invalid candidates never alter the previously published file (byte-identical).

RATES_ROOT (env) may point at another checkout, so the same tests can be run against an older
fetch_rates.py for before/after comparison.
"""
import copy
import hashlib
import importlib.util
import json
import math
import os
import random
import subprocess
import sys
import tempfile
import unittest
from datetime import date
from pathlib import Path

ROOT = Path(os.environ.get("RATES_ROOT") or Path(__file__).resolve().parent.parent)
FIXTURE = ROOT / "tests" / "fixtures" / "frankfurter_usd.json"
SCRIPT = ROOT / "fetch_rates.py"
CURRENCIES = list(json.loads((ROOT / "currency-data.json").read_text(encoding="utf-8")).keys())
LEGACY = ["BGN", "HRK"]  # derived from EUR, not provider-supplied

THU, FRI, SAT, SUN, MON = "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08", "2026-11-09"
T_FRI_1928 = "2026-11-06T19:28:00Z"   # run #14: the last successful scheduled run
T_SAT_0604 = "2026-11-07T06:04:00Z"   # run #15: the first failure
T_SUN_0608 = "2026-11-08T06:08:00Z"
T_MON_0610 = "2026-11-09T06:10:00Z"

# The kind of currency that carried the Saturday date in the real Nov-6 publish: 34 provider rows plus the 2
# legacy currencies (BGN, HRK) derived from EUR = the 36 currencies dated 2026-11-07 on the data branch.
_REAL = ["EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "NZD", "CNY", "HKD", "SGD", "KRW", "INR", "IDR", "MYR",
         "THB", "VND", "NPR", "TWD", "MNT", "KZT", "RUB", "UAH", "PLN", "CZK", "HUF"]


def fixture_rows():
    return json.loads(FIXTURE.read_text(encoding="utf-8"))


def _quotes():
    return [r["quote"] for r in fixture_rows()]


SAT_SET = [q for q in _REAL if q in _quotes()]
SAT_SET += [q for q in _quotes() if q not in SAT_SET][: 34 - len(SAT_SET)]


def rows_on(day, overrides=None, scale=None):
    """Provider rows all dated `day`; `overrides` {quote: date}; `scale` multiplies units-per-USD."""
    out = []
    for r in fixture_rows():
        r = dict(r, date=(overrides or {}).get(r["quote"], day))
        if scale:
            r["rate"] = r["rate"] * scale
        out.append(r)
    return out


def aave_row(day=FRI, **overrides):
    """A provider row for a crypto asset, shaped like Frankfurter v2 `expand=providers` output. This is the row
    that made production fail with: VALIDATION FAILED: bad quote code 'AAVE'."""
    row = {"date": day, "base": "USD", "quote": "AAVE", "rate": 0.0052,
           "providers": [{"key": "CRYPTO", "date": day, "rate": 0.0052}]}
    row.update(overrides)
    return row


class Pipeline:
    """Mimics the workflow: --previous X --output X on one file, so 'preserved' means byte-identical."""

    def __init__(self, tmp):
        self.dir = Path(tmp)
        self.pub = self.dir / "published" / "rates.json"
        self.n = 0

    def run(self, rows, now, extra=(), config=None, raw_fixture=None):
        self.n += 1
        fx = self.dir / f"rows{self.n}.json"
        fx.write_text(raw_fixture if raw_fixture is not None else json.dumps(rows), encoding="utf-8")
        cmd = [sys.executable, str(SCRIPT), "--input-fixture", str(fx), "--output", str(self.pub), "--now", now]
        if self.pub.exists():
            cmd += ["--previous", str(self.pub)]
        if config:
            cfg = json.loads((ROOT / "rates-config.json").read_text(encoding="utf-8"))
            cfg.update(config)
            cp = self.dir / "cfg.json"
            cp.write_text(json.dumps(cfg), encoding="utf-8")
            cmd += ["--config", str(cp)]
        return subprocess.run(cmd + list(extra), capture_output=True, text=True)

    def digest(self):
        return hashlib.sha256(self.pub.read_bytes()).hexdigest()

    def load(self):
        return json.loads(self.pub.read_text(encoding="utf-8"))

    def seed(self, rows=None, now="2026-11-05T18:00:00Z", day=THU):
        proc = self.run(rows if rows is not None else rows_on(day), now)
        assert proc.returncode == 0, proc.stderr + proc.stdout
        return self.load()


def legacy_like_run14(ds):
    """Rewrite a dataset the way the OLD code published it at 2026-11-06 19:28Z (what is live today):
    Saturday dates on the forward currencies, no provider_date / flag / normalization block."""
    ds = copy.deepcopy(ds)
    for code in SAT_SET + LEGACY:  # BGN/HRK take EUR's date in the old code
        ds["meta"][code]["date"] = SAT
        ds["meta"][code].pop("provider_date", None)
        ds["meta"][code]["flags"] = [f for f in ds["meta"][code].get("flags", []) if f != "forward_dated_clamped"] or None
        if ds["meta"][code]["flags"] is None:
            del ds["meta"][code]["flags"]
    ds.pop("normalization", None)
    ds["observation_date"], ds["observation_date_oldest"] = SAT, FRI
    ds["retrieved_at"] = ds["generated_at"] = ds["data_changed_at"] = "2026-11-06T19:28:03Z"
    return ds


def assert_no_future_dates(tc, ds, run_day):
    tc.assertLessEqual(ds["observation_date"], run_day)
    for code, m in ds["meta"].items():
        if "date" in m:
            tc.assertLessEqual(m["date"], run_day, f"{code} dated after the run date")


class _Base(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.p = Pipeline(self._tmp.name)

    def tearDown(self):
        self._tmp.cleanup()

    def assert_rejected_and_preserved(self, proc, before, contains=None):
        self.assertEqual(proc.returncode, 3, proc.stderr + proc.stdout)
        self.assertEqual(self.p.digest(), before, "published dataset changed after a rejected run")
        if contains:
            self.assertIn(contains, proc.stderr)
        self.assertEqual(sorted(x.name for x in self.p.pub.parent.iterdir()), ["rates.json"], "temp files left behind")


class ForwardDatedObservations(_Base):
    def test_saturday_dated_rows_received_on_friday_are_capped_and_documented(self):
        rows = rows_on(FRI, overrides={q: SAT for q in SAT_SET})
        proc = self.p.run(rows, T_FRI_1928)
        self.assertEqual(proc.returncode, 0, proc.stderr + proc.stdout)
        ds = self.p.load()
        assert_no_future_dates(self, ds, FRI)
        self.assertEqual(ds["observation_date"], FRI)
        prov = {r["quote"]: r for r in rows}
        for code in SAT_SET:
            m = ds["meta"][code]
            self.assertEqual(m["date"], FRI, code)
            self.assertEqual(m["provider_date"], SAT, f"{code}: provider's original date must be preserved")
            self.assertIn("forward_dated_clamped", m["flags"], code)
            # the VALUE is exactly the provider's value (inverted) - only the label is capped
            self.assertAlmostEqual(ds["rates"][code] * prov[code]["rate"], 1.0, places=9)
        for code in set(_quotes()) - set(SAT_SET):
            self.assertNotIn("provider_date", ds["meta"][code])
        norm = ds["normalization"]
        self.assertEqual(norm["run_date"], FRI)
        self.assertEqual(sorted(norm["forward_dated_currencies"]), sorted(SAT_SET))
        self.assertIn("EUR", SAT_SET)
        self.assertEqual(ds["meta"]["BGN"]["date"], FRI, "legacy currency derived from a forward-dated EUR must be capped too")
        self.assertEqual(ds["meta"]["BGN"]["provider_date"], SAT)
        self.assertIn("capped", proc.stdout)

    def test_exact_november_7_incident_does_not_freeze_updates(self):
        """Run #14 (Fri 19:28Z) publishes; runs #15.. (Sat/Sun, provider no longer shows Saturday rows) must succeed."""
        self.assertEqual(self.p.run(rows_on(FRI, overrides={q: SAT for q in SAT_SET}), T_FRI_1928).returncode, 0)
        for now in (T_SAT_0604, T_SUN_0608):
            proc = self.p.run(rows_on(FRI), now)
            self.assertEqual(proc.returncode, 0, f"{now}: {proc.stderr}")
            assert_no_future_dates(self, self.p.load(), now[:10])
        proc = self.p.run(rows_on(MON, scale=1.002), T_MON_0610)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        self.assertEqual(self.p.load()["observation_date"], MON)

    def test_dataset_published_by_the_old_code_with_saturday_dates_self_heals(self):
        """The live data branch TODAY holds Saturday dates retrieved on Friday. The next run must not be rejected."""
        good = self.p.seed(rows_on(FRI, overrides={q: SAT for q in SAT_SET}), T_FRI_1928)
        legacy = legacy_like_run14(good)
        self.p.pub.write_text(json.dumps(legacy), encoding="utf-8")
        self.assertEqual(legacy["observation_date"], SAT)
        proc = self.p.run(rows_on(FRI), T_SUN_0608)
        self.assertEqual(proc.returncode, 0, proc.stderr + proc.stdout)
        ds = self.p.load()
        assert_no_future_dates(self, ds, SUN)
        self.assertEqual(ds["observation_date"], FRI, "the published Saturday dates are corrected to the real newest date")
        self.assertIn("content_changed=True", proc.stdout, "the corrected dates must be republished, not skipped")
        self.assertEqual(ds["normalization"]["previous_dataset_dates_capped"], len(SAT_SET) + len(LEGACY))
        self.assertIn("in the published dataset were later than its retrieval date", proc.stdout)

    def test_future_dated_row_mixed_with_valid_friday_rows_only_that_row_is_capped(self):
        rows = rows_on(FRI, overrides={"KES": SAT})
        self.assertEqual(self.p.run(rows, T_FRI_1928).returncode, 0)
        ds = self.p.load()
        self.assertEqual(ds["meta"]["KES"]["date"], FRI)
        self.assertEqual(ds["meta"]["KES"]["provider_date"], SAT)
        self.assertEqual(ds["meta"]["EUR"]["date"], FRI)
        self.assertNotIn("provider_date", ds["meta"]["EUR"])
        self.assertEqual(ds["normalization"]["forward_dated_currencies"], ["KES"])

    def test_row_more_than_one_day_ahead_is_rejected_and_previous_preserved(self):
        self.p.seed()
        before = self.p.digest()
        for label, day in (("Monday seen on Friday", MON), ("far future", "2027-06-01")):
            with self.subTest(label):
                proc = self.p.run(rows_on(FRI, overrides={"EUR": day}), T_FRI_1928)
                self.assert_rejected_and_preserved(proc, before, "after the run date")

    def test_forward_tolerance_is_configurable_and_zero_means_strict(self):
        proc = self.p.run(rows_on(FRI, overrides={"EUR": SAT}), T_FRI_1928, config={"max_forward_dated_days": 0})
        self.assertEqual(proc.returncode, 3, proc.stderr)
        self.assertFalse(self.p.pub.exists(), "nothing may be written when validation fails")

    def test_unused_currency_with_garbage_date_does_not_block_publishing(self):
        rows = rows_on(FRI) + [{"date": "2099-01-01", "base": "USD", "quote": "ZZZ", "rate": 2.0, "providers": ["X"]}]
        self.assertEqual(self.p.run(rows, T_FRI_1928).returncode, 0)


class WeekendAndMondayBehaviour(_Base):
    def test_weekend_run_with_no_newer_provider_data_is_a_no_op(self):
        self.p.seed(rows_on(FRI), T_FRI_1928, FRI)
        before = self.p.load()
        proc = self.p.run(rows_on(FRI), T_SUN_0608)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        self.assertIn("content_changed=False", proc.stdout)
        after = self.p.load()
        self.assertEqual(after["rates"], before["rates"])
        self.assertEqual(after["data_changed_at"], before["data_changed_at"])

    def test_weekend_run_returning_older_observations_is_rejected(self):
        self.p.seed(rows_on(FRI), T_FRI_1928, FRI)
        before = self.p.digest()
        proc = self.p.run(rows_on(THU), T_SUN_0608)
        self.assert_rejected_and_preserved(proc, before, "older than the published dataset")

    def test_a_few_older_currencies_keep_published_values_but_many_are_rejected(self):
        self.p.seed(rows_on(FRI), T_FRI_1928, FRI)
        pub = self.p.load()
        few = rows_on(MON, overrides={q: THU for q in ("KES", "INR", "SOS")}, scale=1.001)
        proc = self.p.run(few, T_MON_0610)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        ds = self.p.load()
        for code in ("KES", "INR", "SOS"):
            self.assertEqual(ds["rates"][code], pub["rates"][code], f"{code}: newer published value must be kept")
            self.assertEqual(ds["meta"][code]["date"], FRI)
        before = self.p.digest()
        many = rows_on(MON, overrides={q: THU for q in SAT_SET[:12]}, scale=1.001)
        proc = self.p.run(many, "2026-11-09T18:00:00Z")
        self.assert_rejected_and_preserved(proc, before, "came back older")

    def test_monday_with_genuinely_newer_data_is_accepted(self):
        self.p.seed(rows_on(FRI), T_FRI_1928, FRI)
        proc = self.p.run(rows_on(MON, scale=1.004), T_MON_0610)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        ds = self.p.load()
        self.assertEqual(ds["observation_date"], MON)
        self.assertEqual(ds["observation_date_oldest"], MON)
        self.assertNotIn("normalization", ds)
        self.assertIn("content_changed=True", proc.stdout)
        self.assertTrue(all("provider_date" not in m for m in ds["meta"].values()))

    def test_dates_stay_monotonic_across_a_full_weekend(self):
        steps = [
            ("2026-11-05T18:00:00Z", rows_on(THU)),
            ("2026-11-06T06:00:00Z", rows_on(FRI, overrides={q: THU for q in SAT_SET[:10]})),
            (T_FRI_1928, rows_on(FRI, overrides={q: SAT for q in SAT_SET})),
            (T_SAT_0604, rows_on(FRI)),
            (T_SUN_0608, rows_on(FRI)),
            (T_MON_0610, rows_on(MON, scale=1.003)),
        ]
        last_obs, last_day = "", {}
        for now, rows in steps:
            proc = self.p.run(rows, now)
            self.assertEqual(proc.returncode, 0, f"{now}: {proc.stderr}")
            ds = self.p.load()
            assert_no_future_dates(self, ds, now[:10])
            self.assertGreaterEqual(ds["observation_date"], last_obs, now)
            for code, m in ds["meta"].items():
                if "date" in m:
                    self.assertGreaterEqual(m["date"], last_day.get(code, ""), f"{now} {code} went backwards")
                    last_day[code] = m["date"]
            last_obs = ds["observation_date"]


class DifferentObservationDates(_Base):
    def test_each_currency_keeps_its_own_date(self):
        ov = {"EUR": THU, "GBP": FRI, "JPY": SAT, "KES": "2026-11-04"}
        rows = rows_on(FRI, overrides=ov)
        self.assertEqual(self.p.run(rows, T_FRI_1928).returncode, 0)
        ds = self.p.load()
        self.assertEqual(ds["meta"]["EUR"]["date"], THU)
        self.assertEqual(ds["meta"]["GBP"]["date"], FRI)
        self.assertEqual(ds["meta"]["JPY"]["date"], FRI)       # capped
        self.assertEqual(ds["meta"]["JPY"]["provider_date"], SAT)
        self.assertEqual(ds["meta"]["KES"]["date"], "2026-11-04")
        self.assertEqual(ds["observation_date"], FRI)
        self.assertEqual(ds["observation_date_oldest"], "2026-11-04")
        self.assertEqual(ds["meta"]["BGN"]["date"], THU, "legacy currencies follow EUR's own date")

    def test_older_single_currency_does_not_replace_newer_published_value(self):
        self.p.seed(rows_on(FRI), T_FRI_1928, FRI)
        pub = self.p.load()
        rows = rows_on(MON, overrides={"INR": THU}, scale=1.002)
        self.assertEqual(self.p.run(rows, T_MON_0610).returncode, 0)
        ds = self.p.load()
        self.assertEqual(ds["rates"]["INR"], pub["rates"]["INR"])
        self.assertEqual(ds["meta"]["INR"]["date"], FRI)
        self.assertEqual(ds["meta"]["EUR"]["date"], MON)


class InvalidDataNeverReplacesValidData(_Base):
    def setUp(self):
        super().setUp()
        self.good = self.p.seed(rows_on(FRI), T_FRI_1928, FRI)
        self.before = self.p.digest()

    def test_missing_currencies_rejected(self):
        for drop in (["INR"], ["KES", "SOS"], ["EUR"], [q for q in _quotes() if q != "EUR"][:30]):
            with self.subTest(dropped=drop[:3]):
                proc = self.p.run([r for r in rows_on(MON) if r["quote"] not in drop], T_MON_0610)
                self.assert_rejected_and_preserved(proc, self.before)

    def test_invalid_rate_values_rejected(self):
        bad_values = {"negative": -1.5, "zero": 0, "string": "1.5", "null": None, "bool": True,
                      "nan": float("nan"), "inf": float("inf"), "neg_inf": float("-inf"), "list": [1.2], "empty_str": ""}
        for label, value in bad_values.items():
            with self.subTest(label):
                rows = rows_on(MON)
                rows[3]["rate"] = value
                proc = self.p.run(rows, T_MON_0610)
                self.assert_rejected_and_preserved(proc, self.before)

    def test_missing_rate_key_rejected(self):
        rows = rows_on(MON)
        del rows[5]["rate"]
        self.assert_rejected_and_preserved(self.p.run(rows, T_MON_0610), self.before)

    def test_malformed_rows_and_dates_rejected(self):
        cases = {
            "bad date string": lambda r: r[2].update(date="not-a-date"),
            "null date": lambda r: r[2].update(date=None),
            "missing date": lambda r: r[2].pop("date"),
            "wrong base": lambda r: r[4].update(base="EUR"),
            "lowercase quote": lambda r: r[4].update(quote="eur"),
            "row not an object": lambda r: r.__setitem__(6, "oops"),
            "providers not a list": lambda r: r[1].update(providers="ECB"),
        }
        for label, mutate in cases.items():
            with self.subTest(label):
                rows = rows_on(MON)
                mutate(rows)
                self.assert_rejected_and_preserved(self.p.run(rows, T_MON_0610), self.before)

    def test_empty_and_non_list_responses_rejected(self):
        for label, raw in (("empty list", "[]"), ("object", "{}"), ("null", "null"), ("string", '"x"')):
            with self.subTest(label):
                self.assert_rejected_and_preserved(self.p.run(None, T_MON_0610, raw_fixture=raw), self.before)

    def test_unparseable_provider_payload_preserves_dataset(self):
        proc = self.p.run(None, T_MON_0610, raw_fixture="<html>502 Bad Gateway</html>")
        self.assertNotEqual(proc.returncode, 0)
        self.assertEqual(self.p.digest(), self.before)

    def test_implausible_jump_rejected(self):
        rows = rows_on(MON)
        for r in rows:
            if r["quote"] == "NPR":          # no direction sentinel, so only the jump guard can catch this
                r["rate"] = r["rate"] / 2.0  # USD per NPR doubles
        proc = self.p.run(rows, T_MON_0610)
        self.assert_rejected_and_preserved(proc, self.before, "implausible jumps")

    def test_previous_file_is_never_modified_by_a_failed_run_even_with_dry_run_off(self):
        stat = self.p.pub.stat()
        for rows, now in ((rows_on(THU), T_SUN_0608), (rows_on(FRI, overrides={"EUR": MON}), T_FRI_1928)):
            self.p.run(rows, now)
        self.assertEqual(self.p.digest(), self.before)
        self.assertEqual(self.p.pub.stat().st_mtime_ns, stat.st_mtime_ns, "file must not even be rewritten")


class FuzzNeverPublishesInvalidData(_Base):
    """Deterministic random corruption: either the run is rejected and the published bytes are untouched,
    or it succeeds and the result satisfies every invariant."""

    MUTATIONS = ["drop_row", "rate_zero", "rate_negative", "rate_nan", "rate_string", "rate_none", "rate_bool",
                 "date_garbage", "date_far_future", "date_plus_one", "date_old", "base_wrong", "dup_row_old_date",
                 "add_aave", "add_aave_garbage"]

    def mutate(self, rows, rng):
        for _ in range(rng.randint(1, 3)):
            kind, i = rng.choice(self.MUTATIONS), rng.randrange(len(rows))
            r = rows[i]
            if not isinstance(r, dict):
                continue
            if kind == "drop_row": rows.pop(i)
            elif kind == "rate_zero": r["rate"] = 0
            elif kind == "rate_negative": r["rate"] = -abs(r["rate"])
            elif kind == "rate_nan": r["rate"] = float("nan")
            elif kind == "rate_string": r["rate"] = str(r["rate"])
            elif kind == "rate_none": r["rate"] = None
            elif kind == "rate_bool": r["rate"] = True
            elif kind == "date_garbage": r["date"] = rng.choice(["", "yesterday", "2026-13-45", None, 20261106])
            elif kind == "date_far_future": r["date"] = "2027-01-01"
            elif kind == "date_plus_one": r["date"] = SAT
            elif kind == "date_old": r["date"] = rng.choice([THU, "2026-10-01"])
            elif kind == "base_wrong": r["base"] = "EUR"
            elif kind == "dup_row_old_date": rows.append(dict(r, date=THU, rate=r["rate"] * 5))
            elif kind == "add_aave": rows.append(aave_row())
            elif kind == "add_aave_garbage": rows.append({"date": None, "base": "USD", "quote": "AAVE", "rate": -3, "providers": "junk"})
        return rows

    def test_fuzz(self):
        self.p.seed(rows_on(FRI), T_FRI_1928, FRI)
        rng = random.Random(20261107)
        accepted = rejected = 0
        for n in range(int(os.environ.get("FUZZ_RUNS", "80"))):
            before = self.p.digest()
            rows = self.mutate(rows_on(FRI, scale=1.0005 + n * 1e-6), rng)
            now = rng.choice([T_FRI_1928, T_SAT_0604, T_SUN_0608])
            proc = self.p.run(rows, now)
            if proc.returncode == 0:
                accepted += 1
                ds = self.p.load()
                self.assertEqual(set(ds["rates"]), set(CURRENCIES), n)
                for code, v in ds["rates"].items():
                    self.assertTrue(isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v) and v > 0, f"{n} {code} {v!r}")
                self.assertEqual(ds["rates"]["USD"], 1.0)
                assert_no_future_dates(self, ds, now[:10])
                for code, m in ds["meta"].items():
                    if "date" in m:
                        date.fromisoformat(m["date"])
            else:
                rejected += 1
                self.assertIn(proc.returncode, (1, 2, 3), proc.stderr)
                self.assertEqual(self.p.digest(), before, f"run {n} was rejected but the published file changed")
        self.assertGreater(rejected, 10, "fuzz should hit plenty of rejections")
        self.assertGreater(accepted, 3, "fuzz should also exercise acceptance")


class UnsupportedProviderQuotes(_Base):
    """2026-11-07 production failure: `VALIDATION FAILED: bad quote code 'AAVE'`.

    The request has no `quotes=` filter, so Frankfurter returns every instrument it serves (currencies, metals,
    crypto assets). parse_rows used to require every quote in the response to be 3 uppercase letters BEFORE the
    response was reduced to the website's 156 currencies, so one 4-letter crypto code rejected the whole run.
    Rule now: a quote outside the website's inventory is an unsupported instrument - excluded, listed in the log,
    never published. Anything wrong with a SUPPORTED currency still rejects the run.
    """

    def setUp(self):
        super().setUp()
        self.good = self.p.seed(rows_on(FRI), T_FRI_1928, FRI)
        self.before = self.p.digest()
        self.original_bytes = self.p.pub.read_bytes()

    def _restore(self):
        self.p.pub.write_bytes(self.original_bytes)
        return self.p.digest()

    def _without_aave(self, rows, now):
        """Same run in a separate pipeline, without the unsupported row, for an exact comparison."""
        with tempfile.TemporaryDirectory() as tmp:
            q = Pipeline(tmp)
            q.seed(rows_on(FRI), T_FRI_1928, FRI)
            self.assertEqual(q.run(rows, now).returncode, 0)
            return q.load()

    def test_exact_aave_failure_unsupported_code_no_longer_blocks_supported_rates(self):
        rows = rows_on(MON, scale=1.003)
        proc = self.p.run(rows + [aave_row(MON)], T_MON_0610)
        self.assertEqual(proc.returncode, 0, proc.stderr + proc.stdout)
        ds = self.p.load()
        self.assertEqual(list(ds["rates"]), CURRENCIES)
        self.assertEqual(len(ds["rates"]), 156)
        self.assertNotIn("AAVE", json.dumps(ds), "an unsupported instrument must never be published")
        ref = self._without_aave(rows, T_MON_0610)
        for key in ("rates", "meta", "observation_date", "observation_date_oldest"):
            self.assertEqual(ds[key], ref[key], f"{key} must be identical with and without the AAVE row")
        self.assertIn("provider-supplied currencies present: 153/153", proc.stdout)
        self.assertIn("excluded, not in the website's 156 currencies: AAVE", proc.stdout)

    def test_many_kinds_of_unsupported_codes_are_excluded_and_reported(self):
        junk = ["AAVE", "UNI", "1INCH", "WBTC", "XAUT", "BTC", "ETH", "XAU", "XAG", "EURO", "aave", "", "A B"]
        extra = [aave_row(MON, quote=q) for q in junk]
        proc = self.p.run(rows_on(MON, scale=1.003) + extra, T_MON_0610)
        self.assertEqual(proc.returncode, 0, proc.stderr + proc.stdout)
        ds = self.p.load()
        self.assertEqual(list(ds["rates"]), CURRENCIES)
        text = json.dumps(ds)
        for q in junk:
            if q:
                self.assertNotIn(f'"{q}"', text, q)
        self.assertIn("provider currencies not used by the website: %d" % len(set(junk)), proc.stdout)
        for q in ("AAVE", "UNI", "1INCH", "WBTC", "XAUT", "BTC", "XAU", "EURO", "aave"):
            self.assertIn(q, proc.stdout.split("excluded, not in the website's 156 currencies:")[1].splitlines()[0])

    def test_unsupported_rows_are_neither_validated_nor_used(self):
        bad = [dict(rate=0), dict(rate=-1), dict(rate="x"), dict(rate=None), dict(rate=float("nan")),
               dict(date=None), dict(date="not-a-date"), dict(date="2099-01-01"), dict(providers="junk"), dict(providers=[1, None])]
        # 4-letter (AAVE) AND 3-letter (BTC crypto, XAU metal) codes: what matters is the inventory, not the code's shape
        for code in ("AAVE", "BTC", "XAU"):
            for overrides in bad:
                with self.subTest(code=code, overrides=overrides):
                    proc = self.p.run(rows_on(MON, scale=1.003) + [aave_row(MON, quote=code, **overrides)], T_MON_0610)
                    self.assertEqual(proc.returncode, 0, proc.stderr)
                    self.assertNotIn(code, self.p.load()["rates"])
                    self._restore()  # back to the exact original bytes between sub-cases

    def test_unsupported_rows_must_still_be_well_formed_response_rows(self):
        cases = {
            "wrong base on the AAVE row": aave_row(MON, base="EUR"),
            "row is not an object": "AAVE",
            "quote is null": aave_row(MON, quote=None),
            "quote is a number": aave_row(MON, quote=123),
            "quote is a list": aave_row(MON, quote=["AAVE"]),
        }
        for label, row in cases.items():
            with self.subTest(label):
                proc = self.p.run(rows_on(MON) + [row], T_MON_0610)
                self.assert_rejected_and_preserved(proc, self.before)

    def test_malformed_supported_currency_still_rejects_the_run_even_with_aave_present(self):
        mutations = {
            "rate zero": lambda r: r.update(rate=0), "rate negative": lambda r: r.update(rate=-4.2),
            "rate string": lambda r: r.update(rate="129.2"), "rate null": lambda r: r.update(rate=None),
            "rate NaN": lambda r: r.update(rate=float("nan")), "rate inf": lambda r: r.update(rate=float("inf")),
            "rate bool": lambda r: r.update(rate=True), "bad date": lambda r: r.update(date="2026-13-40"),
            "null date": lambda r: r.update(date=None), "providers not a list": lambda r: r.update(providers="CBK"),
        }
        for label, mutate in mutations.items():
            with self.subTest(label):
                rows = rows_on(MON)
                mutate(next(r for r in rows if r["quote"] == "KES"))
                before = self._restore()
                proc = self.p.run([aave_row(MON)] + rows, T_MON_0610)   # AAVE first: it must not mask the real fault
                self.assert_rejected_and_preserved(proc, before)
                self.assertIn("KES", proc.stderr, "the failure must name the supported currency, not the unsupported one")
                self.assertNotIn("AAVE", proc.stderr)

    def test_malformed_spelling_of_a_supported_code_is_rejected_not_silently_dropped(self):
        for spelled in ("kes", " KES", "KES ", "Kes", "kes\n"):
            with self.subTest(repr(spelled)):
                rows = [dict(r, quote=spelled) if r["quote"] == "KES" else r for r in rows_on(MON)]
                before = self._restore()
                proc = self.p.run(rows + [aave_row(MON)], T_MON_0610)
                self.assert_rejected_and_preserved(proc, before, "bad quote code")
        # an extra malformed duplicate next to a correct KES row is rejected too (strictness is not "last row wins")
        before = self.p.digest()
        proc = self.p.run(rows_on(MON) + [dict(next(r for r in rows_on(MON) if r["quote"] == "KES"), quote="kes")], T_MON_0610)
        self.assert_rejected_and_preserved(proc, before, "bad quote code")

    def test_missing_required_currencies_still_rejected_with_aave_present(self):
        for drop in (["INR"], ["KES", "SOS"], ["EUR"], [q for q in _quotes() if q != "EUR"][:40]):
            with self.subTest(dropped=drop[:3]):
                proc = self.p.run([r for r in rows_on(MON) if r["quote"] not in drop] + [aave_row(MON)], T_MON_0610)
                self.assert_rejected_and_preserved(proc, self.before, "lacks")
                self.assertIn("STOP", proc.stderr)

    def test_response_containing_only_unsupported_quote_codes_is_rejected(self):
        only = [aave_row(MON, quote=q) for q in ("AAVE", "UNI", "BTC", "XAU", "WBTC", "1INCH")]
        proc = self.p.run(only, T_MON_0610)
        self.assert_rejected_and_preserved(proc, self.before, "lacks 153 expected currencies")
        with tempfile.TemporaryDirectory() as tmp:  # first-ever run: nothing may be created either
            fresh = Pipeline(tmp)
            proc = fresh.run(only, T_MON_0610)
            self.assertEqual(proc.returncode, 3, proc.stderr)
            self.assertFalse(fresh.pub.exists(), "a rejected first run must not create a dataset")

    def test_every_failed_validation_leaves_the_published_file_byte_for_byte_unchanged(self):
        stat = self.p.pub.stat()
        failing = [
            [aave_row(MON)],                                                                   # only unsupported
            [r for r in rows_on(MON) if r["quote"] != "KES"] + [aave_row(MON)],                # supported missing
            [dict(r, rate=0) if r["quote"] == "KES" else r for r in rows_on(MON)] + [aave_row(MON)],  # supported malformed
            rows_on(MON) + [aave_row(MON, base="EUR")],                                        # malformed response
            rows_on(THU) + [aave_row(THU)],                                                    # genuinely older data
        ]
        for rows in failing:
            self.assertNotEqual(self.p.run(rows, T_MON_0610).returncode, 0)
            self.assertEqual(self.p.digest(), self.before)
        self.assertEqual(self.p.pub.stat().st_mtime_ns, stat.st_mtime_ns, "file must not even be rewritten")

    def test_the_large_exclusion_list_is_capped_in_the_log_but_every_code_is_excluded(self):
        many = [aave_row(MON, quote=f"ZZ{i:03d}") for i in range(100)]
        proc = self.p.run(rows_on(MON, scale=1.003) + many, T_MON_0610)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        self.assertEqual(list(self.p.load()["rates"]), CURRENCIES)
        self.assertIn("provider currencies not used by the website: 100", proc.stdout)
        self.assertIn("(+40 more)", proc.stdout)

    def test_aave_together_with_the_old_saturday_dated_dataset_recovers(self):
        """Production is in BOTH states at once: the live file has Saturday dates (old code) and the provider now sends AAVE."""
        legacy = legacy_like_run14(self.p.seed(rows_on(FRI, overrides={q: SAT for q in SAT_SET}), T_FRI_1928))
        self.p.pub.write_text(json.dumps(legacy), encoding="utf-8")
        proc = self.p.run(rows_on(FRI) + [aave_row(FRI)], T_SUN_0608)
        self.assertEqual(proc.returncode, 0, proc.stderr + proc.stdout)
        ds = self.p.load()
        assert_no_future_dates(self, ds, SUN)
        self.assertEqual(list(ds["rates"]), CURRENCIES)
        self.assertNotIn("AAVE", json.dumps(ds))

    def test_parse_rows_is_strict_without_an_inventory_and_selective_with_one(self):
        spec = importlib.util.spec_from_file_location("fetch_rates_parse_under_test", SCRIPT)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        rows = rows_on(FRI) + [aave_row(FRI)]
        with self.assertRaisesRegex(mod.ValidationError, "bad quote code 'AAVE'"):
            mod.parse_rows(rows, "USD")                      # original behaviour preserved when no inventory is given
        excluded = set()
        parsed = mod.parse_rows(rows, "USD", set(CURRENCIES), excluded)
        self.assertEqual(excluded, {"AAVE"})
        self.assertNotIn("AAVE", parsed)
        self.assertEqual(set(parsed), set(_quotes()))


class ValidateDatasetIsTheLastLine(unittest.TestCase):
    """Normalisation makes a later-than-run-date observation unreachable through the pipeline; the final
    check in validate_dataset is kept as defence in depth and is pinned here directly."""

    @classmethod
    def setUpClass(cls):
        spec = importlib.util.spec_from_file_location("fetch_rates_under_test", SCRIPT)
        cls.mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.mod)
        cls.config = json.loads((ROOT / "rates-config.json").read_text(encoding="utf-8"))
        from datetime import datetime, timezone
        cls.now = datetime(2026, 11, 6, 19, 28, tzinfo=timezone.utc)

    def good_dataset(self):
        parsed = self.mod.parse_rows(rows_on(FRI), "USD")
        return self.mod.build_dataset(parsed, CURRENCIES, self.config, self.now)

    def test_a_clean_dataset_passes(self):
        self.mod.validate_dataset(self.good_dataset(), CURRENCIES, self.config, self.now)

    def test_global_observation_date_after_run_date_is_rejected(self):
        ds = self.good_dataset()
        ds["observation_date"] = SAT
        with self.assertRaises(self.mod.ValidationError):
            self.mod.validate_dataset(ds, CURRENCIES, self.config, self.now)

    def test_a_single_currency_dated_after_run_date_is_rejected(self):
        ds = self.good_dataset()
        ds["meta"]["KES"]["date"] = SAT   # global date still fine: only the per-currency check can catch it
        with self.assertRaises(self.mod.ValidationError):
            self.mod.validate_dataset(ds, CURRENCIES, self.config, self.now)

    def test_malformed_currency_date_is_a_validation_error_not_a_crash(self):
        ds = self.good_dataset()
        ds["meta"]["KES"]["date"] = "11/07/2026"
        with self.assertRaises(self.mod.ValidationError):
            self.mod.validate_dataset(ds, CURRENCIES, self.config, self.now)


if __name__ == "__main__":
    unittest.main()

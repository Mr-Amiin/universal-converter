#!/usr/bin/env python3
"""
Builds the currency-rate dataset (rates.json, schema 2) for The Universal Converter.

This is the ONLY script that talks to a live provider. The website never calls a
provider directly: app.js reads the validated dataset that the scheduled GitHub
Actions workflow (.github/workflows/update-rates.yml) publishes to the `data`
branch, falling back to the offline /rates.json shipped with the site.

Provider: Frankfurter v2 (https://frankfurter.dev), default BLENDED rates (free for
commercial use per Frankfurter's FAQ). Individual-provider endpoints are NOT used.
ONE request returns every quote currency against USD:
    GET https://api.frankfurter.dev/v2/rates?base=USD&expand=providers
    -> [{"date": "...", "base": "USD", "quote": "EUR", "rate": 0.8739, "providers": ["ECB", ...]}, ...]
"providers" lists the institutions behind each blended rate. Per Frankfurter's docs the
field is omitted for pegged currencies (derived from the peg, not from provider data);
such rows are stored with basis "no_provider_attribution".
"rate" is UNITS OF QUOTE PER 1 USD (1 USD = 0.8739 EUR). The website stores
USD PER 1 UNIT (1 EUR = 1.1443 USD), so every provider rate is inverted here.

Guarantees:
  * Nothing is written unless the whole dataset validates (all supported currencies,
    finite positive numbers, direction sentinels, freshness, no implausible jumps).
  * The previous dataset is never replaced by an empty/partial/older one.
  * Only the website's own currencies are ever published. Provider quotes outside that inventory (crypto
    assets such as AAVE, metals, ...) are excluded and listed in the log; they never invalidate the supported
    currencies, and a malformed row or spelling of a SUPPORTED currency still rejects the whole run.
  * No observation date later than the run date (UTC) is ever published. A row dated up to
    `max_forward_dated_days` (default 1) ahead of the run date is capped at the run date; the
    provider's original date is kept in meta[code].provider_date, flagged "forward_dated_clamped" and
    listed under the top-level "normalization" key. A row further ahead is rejected. A published
    dataset written before this rule is capped at its own retrieval date, for comparison only.
  * The output file is replaced atomically (temp file + os.replace).
  * No API key is needed or read.

Exit codes: 0 success, 2 provider/network failure, 3 validation failure,
            1 usage/config error.

Usage:
    python3 fetch_rates.py --previous _data/rates.json --output _data/rates.json
    python3 fetch_rates.py --input-fixture tests/fixtures/frankfurter_usd.json --dry-run
"""
import argparse
import copy
import json
import math
import os
import sys
import tempfile
import time
import urllib.error
import urllib.request
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SCHEMA_VERSION = 2
USER_AGENT = "UniversalConverterRatesBot/1.0 (+https://theuniversalconverter.com)"


class FetchError(Exception):
    """Provider or network problem (exit code 2)."""


class ValidationError(Exception):
    """The candidate dataset must not be published (exit code 3)."""


# --------------------------------------------------------------------------- fetch

def fetch_provider_rows(config):
    """One batched request. Returns the parsed JSON (a list of rate rows)."""
    url = config["api_url"]
    retries = int(config.get("retries", 3))
    last = None
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=float(config.get("timeout_seconds", 20))) as resp:
                if resp.status != 200:
                    raise FetchError(f"HTTP {resp.status}")
                body = resp.read(10_000_000)
            return json.loads(body.decode("utf-8"))
        except (urllib.error.URLError, OSError, TimeoutError, ValueError, FetchError) as exc:
            last = exc
            print(f"fetch attempt {attempt} failed: {exc}", file=sys.stderr)
            if attempt < retries:
                time.sleep(2 * attempt)
    raise FetchError(f"provider request failed after retries: {last}")


def normalise_providers(value, quote):
    """Provider attribution -> sorted list of provider keys, or None when the API omitted it."""
    if value is None:
        return None
    if not isinstance(value, list):
        raise ValidationError(f"{quote}: 'providers' is not a list")
    keys = set()
    for item in value:
        if isinstance(item, str) and item.strip():
            keys.add(item.strip())
        elif isinstance(item, dict):
            if item.get("excluded") is True:
                continue  # an outlier the blend did not use
            key = item.get("key") or item.get("provider") or item.get("id") or item.get("name")
            if isinstance(key, str) and key.strip():
                keys.add(key.strip())
        else:
            raise ValidationError(f"{quote}: unrecognised provider entry {item!r}")
    return sorted(keys)


def parse_rows(rows, base, supported=None, excluded=None):
    """Validate the raw response shape. Returns {QUOTE: (units_per_base, date, providers|None)}.

    The provider serves more than ISO currencies (crypto assets such as AAVE, precious metals, ...). When
    `supported` (the website's currency inventory) is given, a row whose quote code is not in it is an
    unsupported provider instrument: it is recorded in `excluded` and skipped WITHOUT being validated or used,
    so it can neither invalidate nor leak into the published dataset. Every row must still be an object with
    the expected base and a string quote. A row for a SUPPORTED currency is validated in full, and a quote
    that is only a malformed spelling of a supported code ("kes", " KES") is rejected, never dropped.
    Without `supported` every quote must be a 3-letter uppercase code (the original strict behaviour).
    """
    if not isinstance(rows, list) or not rows:
        raise ValidationError("provider response is not a non-empty list")
    parsed = {}
    for row in rows:
        if not isinstance(row, dict):
            raise ValidationError("provider row is not an object")
        if row.get("base") != base:
            raise ValidationError(f"provider row has unexpected base {row.get('base')!r}")
        quote, rate, day = row.get("quote"), row.get("rate"), row.get("date")
        if not isinstance(quote, str):
            raise ValidationError(f"bad quote code {quote!r}")
        if supported is not None and quote not in supported:
            if quote.strip().upper() in supported:
                raise ValidationError(f"bad quote code {quote!r}: a malformed spelling of supported currency {quote.strip().upper()}")
            if excluded is not None:
                excluded.add(quote)
            continue  # unsupported provider instrument: ignored, reported in the coverage section
        if len(quote) != 3 or not quote.isupper():
            raise ValidationError(f"bad quote code {quote!r}")
        if isinstance(rate, bool) or not isinstance(rate, (int, float)) or not math.isfinite(rate) or rate <= 0:
            raise ValidationError(f"{quote}: rate is not a finite positive number ({rate!r})")
        try:
            date.fromisoformat(day)
        except (TypeError, ValueError):
            raise ValidationError(f"{quote}: bad observation date {day!r}")
        providers = normalise_providers(row.get("providers"), quote)
        if quote in parsed and day <= parsed[quote][1]:
            continue  # keep the newest row if the provider ever repeats a quote
        parsed[quote] = (float(rate), day, providers)
    return parsed


FORWARD_FLAG = "forward_dated_clamped"


def normalise_forward_dates(parsed, currencies, now, config):
    """Cap provider observation dates at the run date (UTC) BEFORE anything is compared or published.

    A provider may label a rate with the next calendar day (time zones, rates set in advance). Such a date
    is not an observation that has happened yet, and publishing it made every later run look "older than
    the published dataset" (the 2026-11-07 incident). Within `max_forward_dated_days` the rate itself is
    kept and only its date label is capped; the original date is returned in `forward` so it can be
    published next to the capped one. Further ahead is treated as corrupt and rejected (fail closed).
    Only currencies the website uses are checked; other quotes in the response are ignored downstream.
    Returns ({QUOTE: (units_per_base, effective_date, providers)}, {QUOTE: original_provider_date}).
    """
    run_day = now.astimezone(timezone.utc).date()
    limit = run_day + timedelta(days=int(config.get("max_forward_dated_days", 1)))
    used = set(currencies)
    out, forward = {}, {}
    for code, (rate, day, providers) in parsed.items():
        if code in used:
            observed = date.fromisoformat(day)
            if observed > limit:
                raise ValidationError(
                    f"{code}: observation date {day} is {(observed - run_day).days} days after the run date {run_day}; "
                    f"refusing to publish (max {int(config.get('max_forward_dated_days', 1))})"
                )
            if observed > run_day:
                forward[code] = day
                day = run_day.isoformat()
        out[code] = (rate, day, providers)
    return out, forward


def normalise_previous(previous, now):
    """Published datasets written before the rule above may carry dates later than the day they were retrieved
    (2026-11-06 19:28Z holds 2026-11-07). For COMPARISON ONLY, cap those at the dataset's own retrieval date
    so the next run is not judged against a date that never happened. The file on disk is not touched here;
    the next successful run republishes corrected dates. Returns (copy, number_of_dates_capped)."""
    prev = copy.deepcopy(previous)
    cap = now.astimezone(timezone.utc).date()
    try:
        retrieved = datetime.fromisoformat(str(prev.get("retrieved_at")).replace("Z", "+00:00")).astimezone(timezone.utc).date()
        cap = min(cap, retrieved)
    except (TypeError, ValueError):
        pass
    limit, capped = cap.isoformat(), 0
    for m in (prev.get("meta") or {}).values():
        if isinstance(m, dict) and isinstance(m.get("date"), str) and m["date"] > limit:
            m.setdefault("provider_date", m["date"])
            m["date"] = limit
            if FORWARD_FLAG not in m.setdefault("flags", []):
                m["flags"].append(FORWARD_FLAG)
            capped += 1
    for key in ("observation_date", "observation_date_oldest"):
        if isinstance(prev.get(key), str) and prev[key] > limit:
            prev[key] = limit
    return prev, capped


# --------------------------------------------------------------------------- build

def sig(value):
    """12 significant digits: stable output, far finer than any display precision."""
    return float(f"{value:.12g}")


def build_dataset(parsed, currencies, config, now, forward=None):
    """Turn provider rows (units per USD) into the site's USD-per-unit dataset."""
    base = config["base"]
    legacy = config.get("legacy_fixed_conversion", {})
    pegged = set(config.get("managed_or_pegged", []))
    unofficial = set(config.get("official_rate_may_differ_from_market", []))

    missing = [c for c in currencies if c != base and c not in legacy and c not in parsed]
    if missing:
        raise ValidationError(f"provider is missing {len(missing)} supported currencies: {missing}")
    if legacy and "EUR" not in parsed:
        raise ValidationError("EUR is required to derive legacy fixed-conversion currencies")

    forward = forward or {}
    rates, meta = {}, {}
    for code in currencies:
        if code == base:
            rates[code] = 1.0
            meta[code] = {"status": "base"}
        elif code in legacy:
            units_per_eur = Decimal(legacy[code]["units_per_eur"])
            eur_units_per_usd, eur_day, _eur_providers = parsed["EUR"]
            usd_per_eur = Decimal(1) / Decimal(repr(eur_units_per_usd))
            rates[code] = sig(float(usd_per_eur / units_per_eur))
            meta[code] = {
                "status": "legacy_fixed_conversion",
                "date": eur_day,
                "fixed_units_per_eur": legacy[code]["units_per_eur"],
                "derived_from": "EUR",
                "note": f"{code} is no longer a circulating currency; derived from EUR at the official fixed conversion rate.",
            }
        else:
            units_per_usd, day, providers = parsed[code]
            rates[code] = sig(1.0 / units_per_usd)  # INVERT: provider = units per USD, site = USD per unit
            meta[code] = {"status": "reference", "date": day}
            if providers:
                meta[code]["basis"] = "blended"
                meta[code]["providers"] = providers
            else:
                # Frankfurter omits "providers" for pegged currencies (derived from the peg, not provider data).
                meta[code]["basis"] = "no_provider_attribution"
        original = forward.get(code) or (forward.get("EUR") if code in legacy else None)
        if original:
            meta[code]["provider_date"] = original  # the provider's own (future) date, before capping
        flags = []
        if code in pegged:
            flags.append("managed_or_pegged")
        if original:
            flags.append(FORWARD_FLAG)
        if code in unofficial:
            flags.append("official_rate_may_differ_from_market")
        if flags:
            meta[code]["flags"] = flags

    dates = sorted(m["date"] for m in meta.values() if "date" in m)
    stamp = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    ds = {
        "schema_version": SCHEMA_VERSION,
        "base": base,
        "rate_unit": "USD per 1 unit of the currency",
        "provider": config["provider"],
        "provider_name": config["provider_name"],
        "provider_url": config["provider_url"],
        "provider_endpoint": "v2/rates (default blended rates; individual providers not queried)",
        "source_note": config["source_note"],
        "update_frequency": config["update_frequency"],
        "generated_at": stamp,          # kept for compatibility with the existing app.js
        "retrieved_at": stamp,          # last successful provider retrieval
        "data_changed_at": stamp,       # when rate values / observation dates last changed
        "observation_date": dates[-1],  # newest provider observation date
        "observation_date_oldest": dates[0],
        "rates": rates,
        "meta": meta,
    }
    if forward:
        ds["normalization"] = {
            "rule": "observation dates later than the run date (UTC) are capped at the run date; "
                    "the provider's original date is kept in meta[code].provider_date",
            "run_date": now.astimezone(timezone.utc).date().isoformat(),
            "forward_dated_currencies": sorted(forward),
        }
    return ds


# ------------------------------------------------------------------------ validate

def validate_dataset(ds, currencies, config, now):
    """Independent re-check of the final dataset. Raises ValidationError."""
    if ds.get("schema_version") != SCHEMA_VERSION:
        raise ValidationError("wrong schema_version")
    rates, meta = ds.get("rates"), ds.get("meta")
    if not isinstance(rates, dict) or not isinstance(meta, dict):
        raise ValidationError("rates/meta missing")
    if set(rates) != set(currencies):
        raise ValidationError(
            f"currency set mismatch: missing={sorted(set(currencies) - set(rates))} extra={sorted(set(rates) - set(currencies))}"
        )
    if rates.get(ds["base"]) != 1.0:
        raise ValidationError("base currency must equal exactly 1.0")
    for code, value in rates.items():
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or not (1e-9 < value < 1e7):
            raise ValidationError(f"{code}: implausible rate {value!r}")
        if code not in meta or "status" not in meta[code]:
            raise ValidationError(f"{code}: missing metadata")
    # Direction guard: catches units-per-USD vs USD-per-unit mix-ups.
    for code, (low, high) in config.get("direction_sentinels", {}).items():
        if code in rates and not (low <= rates[code] <= high):
            raise ValidationError(
                f"direction/sanity sentinel failed for {code}: {rates[code]} not in [{low}, {high}] (USD per unit)"
            )
    newest = date.fromisoformat(ds["observation_date"])
    age = (now.date() - newest).days
    if age > int(config.get("max_observation_age_days", 7)):
        raise ValidationError(f"provider data is stale: newest observation {ds['observation_date']} is {age} days old")
    run_day = now.astimezone(timezone.utc).date()
    if newest > run_day:
        raise ValidationError(f"observation date {ds['observation_date']} is later than the run date {run_day}")
    for code, m in meta.items():
        try:
            later = isinstance(m, dict) and m.get("date") is not None and date.fromisoformat(m["date"]) > run_day
        except (TypeError, ValueError):
            raise ValidationError(f"{code}: bad observation date {m.get('date')!r}")
        if later:
            raise ValidationError(f"{code}: observation date {m['date']} is later than the run date {run_day}")


def merge_with_previous(candidate, previous, config, allow_large_moves):
    """Never go backwards; refuse implausible jumps; keep newer per-currency values."""
    if previous is None:
        return candidate, []
    notes = []
    if candidate["observation_date"] < previous.get("observation_date", ""):
        raise ValidationError(
            f"candidate is older than the published dataset ({candidate['observation_date']} < {previous['observation_date']})"
        )
    prev_rates, prev_meta = previous.get("rates", {}), previous.get("meta", {})
    regressed = []
    for code in list(candidate["rates"]):
        new_day = candidate["meta"][code].get("date")
        old_day = prev_meta.get(code, {}).get("date")
        if new_day and old_day and new_day < old_day and code in prev_rates:
            candidate["rates"][code] = prev_rates[code]
            candidate["meta"][code] = prev_meta[code]
            regressed.append(code)
    if regressed:
        if len(regressed) > max(3, len(candidate["rates"]) // 20):
            raise ValidationError(f"{len(regressed)} currencies came back older than the published data: {regressed[:10]}")
        notes.append(f"kept newer published values for {regressed}")
    limit = float(config.get("max_move_ratio", 1.4))
    jumps = []
    for code, new in candidate["rates"].items():
        old = prev_rates.get(code)
        if old and not (1 / limit <= new / old <= limit):
            jumps.append(f"{code}: {old} -> {new}")
    if jumps and not allow_large_moves:
        raise ValidationError(f"implausible jumps (> x{limit}) since the published dataset: {jumps[:10]}")
    if jumps:
        notes.append(f"large moves accepted by operator: {jumps}")
    return candidate, notes


def same_content(a, b):
    if b is None or a["rates"] != b.get("rates"):
        return False
    key = lambda m: {k: (v.get("date"), v.get("status")) for k, v in m.items()}
    return key(a["meta"]) == key(b.get("meta", {}))



# ------------------------------------------------------------------------- report

def coverage_report(parsed, currencies, config, excluded=()):
    """What the LIVE response actually covers, compared with the website's currency list."""
    base = config["base"]
    legacy = config.get("legacy_fixed_conversion", {})
    expected = [c for c in currencies if c != base and c not in legacy]
    supplied = [c for c in expected if c in parsed]
    missing = [c for c in expected if c not in parsed]
    extras = sorted((set(parsed) - set(currencies)) | set(excluded))
    lines = [
        "== LIVE PROVIDER COVERAGE ==",
        f"website currencies: {len(currencies)} (base {base} + {len(legacy)} legacy-fixed {sorted(legacy)} + {len(expected)} provider-supplied expected)",
        f"provider response: {len(parsed)} quote currencies against {base}",
        f"provider-supplied currencies present: {len(supplied)}/{len(expected)}",
        f"missing from provider response: {missing if missing else 'none'}",
        f"provider currencies not used by the website: {len(extras)}",
    ]
    if extras:
        shown = ", ".join(extras[:60]) + (f", ... (+{len(extras) - 60} more)" if len(extras) > 60 else "")
        lines.append(f"excluded, not in the website's {len(currencies)} currencies: {shown}")
    return {"expected": expected, "supplied": supplied, "missing": missing, "extras": extras, "lines": lines}


def verification_report(dataset, parsed, currencies, config):
    """Explicit post-build verification. Returns (text_lines, markdown_lines); raises on any failed check."""
    base = config["base"]
    legacy = config.get("legacy_fixed_conversion", {})
    rates, meta = dataset["rates"], dataset["meta"]
    checks, failed = [], []

    def check(label, ok, detail=""):
        checks.append(f"[{'PASS' if ok else 'FAIL'}] {label}" + (f": {detail}" if detail else ""))
        if not ok:
            failed.append(label)

    check(f"all {len(currencies)} website currency codes present", list(rates) == currencies)
    check(f"{base} is the base currency (response base and rate == 1.0)", rates.get(base) == 1.0)
    provider_codes = [c for c in currencies if c != base and c not in legacy]
    # A currency whose published value is NEWER than this response keeps the published value (never go backwards).
    kept = [c for c in provider_codes if meta[c].get("date", "") > parsed[c][1]]
    fresh = [c for c in provider_codes if c not in kept]
    dates_ok = all(meta[c].get("date") == parsed[c][1] for c in fresh)
    check(f"every provider-supplied rate ({len(provider_codes)}) carries its own observation date", dates_ok,
          f"newer published value kept for {kept}" if kept else "")
    recip_ok = all(abs(rates[c] * parsed[c][0] - 1.0) < 1e-9 for c in fresh)
    check("USD-per-unit x provider units-per-USD == 1 for every provider-supplied currency (direction)", recip_ok)
    for code, spec in legacy.items():
        usd_per_eur = rates["EUR"]
        derived = rates[code] * float(spec["units_per_eur"])
        check(
            f"{code} derived fixed conversion (1 EUR = {spec['units_per_eur']} {code})",
            abs(derived - usd_per_eur) / usd_per_eur < 1e-9 and meta[code]["status"] == "legacy_fixed_conversion",
            f"USD per {code} = {rates[code]}",
        )
    no_date = [c for c in currencies if c != base and "date" not in meta[c]]
    check("no currency lacks an observation date (no offline-seed value retained)", not no_date, str(no_date) if no_date else "seed rates used: 0")
    for code in config.get("report_pairs", []):
        if code == base:
            continue
        has = code in parsed
        check(f"{base}/{code} present in response", has)
        if has and code not in kept:
            per_usd = parsed[code][0]
            check(
                f"{base}->{code} and {code}->{base} both directions",
                abs(1 * 1.0 / rates[code] - per_usd) / per_usd < 1e-9 and abs(per_usd * rates[code] - 1.0) < 1e-9,
                f"1 {base} = {per_usd} {code}; 1 {code} = {rates[code]} {base}",
            )
    attributed = [c for c in provider_codes if meta[c].get("providers")]
    unattributed = [c for c in provider_codes if not meta[c].get("providers")]
    note = f"attributed to providers: {len(attributed)}; no provider attribution (pegged/parity-derived per docs): {len(unattributed)} {unattributed}"
    if provider_codes and not attributed:
        note += "  WARNING: no currency carried provider attribution - expand=providers may not have been honoured"

    if dataset.get("normalization"):
        n = dataset["normalization"]
        note += (f"  | forward-dated observations capped at run date {n['run_date']}: {len(n['forward_dated_currencies'])} "
                 f"(provider dates kept in meta.provider_date)")
        if n.get("previous_dataset_dates_capped"):
            note += f"; published dates capped for comparison: {n['previous_dataset_dates_capped']}"
    dates = sorted({meta[c]["date"] for c in provider_codes})
    text = ["== VERIFICATION =="] + checks + [note, f"observation dates in response: {dates[0]} .. {dates[-1]} ({len(dates)} distinct)"]
    md = ["### Live provider coverage and verification", "", "```", *text, "```", "",
          "<details><summary>Every provider-supplied currency: observation date, rates, providers</summary>", "",
          "| code | observation date | units per USD | USD per unit | basis | providers |", "|---|---|---|---|---|---|"]
    for c in provider_codes:
        m = meta[c]
        md.append(f"| {c} | {m['date']} | {parsed[c][0]} | {rates[c]} | {m.get('basis', '')} | {', '.join(m.get('providers', []))} |")
    for c in legacy:
        md.append(f"| {c} | {meta[c]['date']} | (derived) | {rates[c]} | legacy_fixed_conversion | derived from EUR |")
    md += ["", "</details>"]
    if failed:
        raise ValidationError("verification failed: " + "; ".join(failed))
    return text, md


def per_currency_lines(dataset, parsed, currencies, config):
    """One line per website currency: observation date, both rate directions, attribution."""
    base, legacy = config["base"], config.get("legacy_fixed_conversion", {})
    out = ["== PER-CURRENCY (code, observation date, provider units per USD, USD per unit, basis/providers) =="]
    for code in currencies:
        m = dataset["meta"][code]
        if code == base:
            out.append(f"{code} base 1 1")
        elif code in legacy:
            out.append(f"{code} {m['date']} (derived) {dataset['rates'][code]} legacy_fixed_conversion 1 EUR = {m['fixed_units_per_eur']} {code}")
        else:
            out.append(f"{code} {m['date']} {parsed[code][0]} {dataset['rates'][code]} {m.get('basis')} {','.join(m.get('providers', []))}")
    return out


def emit_summary(lines):
    path = os.environ.get("GITHUB_STEP_SUMMARY")
    if path:
        with open(path, "a", encoding="utf-8") as fh:
            fh.write("\n".join(lines) + "\n")

# --------------------------------------------------------------------------- io

def load_json(path):
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None


def atomic_write(path, payload):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=str(path.parent), prefix=".rates-", suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            json.dump(payload, fh, indent=1, ensure_ascii=False)
            fh.write("\n")
        json.loads(Path(tmp).read_text(encoding="utf-8"))  # re-parse what we are about to publish
        os.chmod(tmp, 0o644)
        os.replace(tmp, path)
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)


def set_output(name, value):
    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a", encoding="utf-8") as fh:
            fh.write(f"{name}={value}\n")


def run(args):
    config = json.loads(Path(args.config).read_text(encoding="utf-8"))
    currencies = list(json.loads(Path(args.currencies).read_text(encoding="utf-8")).keys())
    now = datetime.fromisoformat(args.now.replace("Z", "+00:00")) if args.now else datetime.now(timezone.utc)

    previous = load_json(args.previous) if args.previous else None
    if previous is not None and previous.get("schema_version") != SCHEMA_VERSION:
        previous = None  # e.g. the old offline seed: nothing comparable
    previous_raw, previous_capped = previous, 0
    if previous is not None:
        previous, previous_capped = normalise_previous(previous, now)  # comparison copy; the file on disk is untouched

    rows = json.loads(Path(args.input_fixture).read_text(encoding="utf-8")) if args.input_fixture else fetch_provider_rows(config)
    excluded = set()
    parsed = parse_rows(rows, config["base"], set(currencies), excluded)
    cov = coverage_report(parsed, currencies, config, excluded)
    print("\n".join(cov["lines"]))
    if cov["missing"]:
        emit_summary(["### Live provider coverage", "", "```", *cov["lines"], "```", "", f"**STOP: missing currencies {cov['missing']}**"])
        raise ValidationError(f"STOP: the provider response lacks {len(cov['missing'])} expected currencies: {cov['missing']}")
    parsed, forward = normalise_forward_dates(parsed, currencies, now, config)
    candidate = build_dataset(parsed, currencies, config, now, forward)
    validate_dataset(candidate, currencies, config, now)
    candidate, notes = merge_with_previous(candidate, previous, config, args.allow_large_moves)
    if previous_capped:
        candidate.setdefault("normalization", {
            "rule": "observation dates later than the run date (UTC) are capped at the run date; "
                    "the provider's original date is kept in meta[code].provider_date",
            "run_date": now.astimezone(timezone.utc).date().isoformat(),
            "forward_dated_currencies": [],
        })["previous_dataset_dates_capped"] = previous_capped
        notes.append(f"{previous_capped} observation date(s) in the published dataset were later than its retrieval date; "
                     "capped for comparison and corrected in this release")
    if forward:
        notes.append(f"capped {len(forward)} forward-dated observation(s) at run date "
                     f"{now.astimezone(timezone.utc).date().isoformat()}: {sorted(forward)[:12]}"
                     f"{' ...' if len(forward) > 12 else ''} (provider dates kept in meta.provider_date)")
    validate_dataset(candidate, currencies, config, now)  # re-check after merging

    text, md = verification_report(candidate, parsed, currencies, config)
    print("\n".join(text))
    print("\n".join(per_currency_lines(candidate, parsed, currencies, config)))
    emit_summary(md)

    content_changed = not (previous_raw and same_content(candidate, previous_raw))  # compare with what is on disk
    if not content_changed:
        candidate["data_changed_at"] = previous_raw.get("data_changed_at", candidate["data_changed_at"])

    for note in notes:
        print(f"note: {note}")
    print(
        f"OK: {len(candidate['rates'])} currencies, observation {candidate['observation_date_oldest']}..{candidate['observation_date']}, "
        f"content_changed={content_changed}"
    )
    set_output("content_changed", str(content_changed).lower())
    set_output("observation_date", candidate["observation_date"])
    if args.dry_run:
        print("dry run: nothing written")
        return 0
    atomic_write(args.output, candidate)
    print(f"wrote {args.output}")
    return 0


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--config", default=str(ROOT / "rates-config.json"))
    ap.add_argument("--currencies", default=str(ROOT / "currency-data.json"))
    ap.add_argument("--previous", help="published dataset to compare against (never overwritten on failure)")
    ap.add_argument("--output", default=str(ROOT / "rates.json"))
    ap.add_argument("--input-fixture", help="test only: read provider rows from a file instead of the network")
    ap.add_argument("--now", help="test only: override the current UTC time (ISO 8601)")
    ap.add_argument("--allow-large-moves", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args(argv)
    try:
        return run(args)
    except FetchError as exc:
        print(f"FETCH FAILED: {exc}. Existing dataset left untouched.", file=sys.stderr)
        return 2
    except ValidationError as exc:
        print(f"VALIDATION FAILED: {exc}. Existing dataset left untouched.", file=sys.stderr)
        return 3
    except (OSError, KeyError, ValueError) as exc:
        print(f"ERROR: {exc}. Existing dataset left untouched.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())

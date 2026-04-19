#!/usr/bin/env python3
"""
Build the 1000 most common Spanish words with English translations.
Output: words-es-en.json
"""
import json, re, time
from wordfreq import top_n_list
from deep_translator import GoogleTranslator

OUT = "words-es-en.json"
N = 1000

def is_valid(w):
    return bool(re.fullmatch(r"[a-záéíóúñü]+", w.lower()))

def main():
    raw = top_n_list("es", N * 3)
    cleaned, seen = [], set()
    for w in raw:
        w = w.strip().lower()
        if w in seen or not is_valid(w) or len(w) < 2:
            continue
        seen.add(w)
        cleaned.append(w)
        if len(cleaned) == N:
            break

    print(f"Collected {len(cleaned)} Spanish words. Translating...")
    translator = GoogleTranslator(source="es", target="en")
    result = []

    for i, es in enumerate(cleaned, 1):
        try:
            en = translator.translate(es)
            en = (en or "").strip().lower()
        except Exception:
            en = ""
        if not en:
            en = es
        # Store multiple accepted answers (split on comma/slash)
        alts = [a.strip().lower() for a in re.split(r"[,/]", en) if a.strip()]
        if not alts:
            alts = [en]
        result.append({"es": es, "en": alts})
        if i % 100 == 0:
            print(f"  {i}/{N}")
        time.sleep(0.05)

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=1)
    print(f"✅ Saved {len(result)} words to {OUT}")

if __name__ == "__main__":
    main()

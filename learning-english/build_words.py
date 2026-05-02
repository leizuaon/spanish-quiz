#!/usr/bin/env python3
"""
Build 1000 common Hebrew words with English translations.
Output: words-he-en.json
"""
import json
import re
import time
from wordfreq import top_n_list
from deep_translator import GoogleTranslator

OUT = 'words-he-en.json'
N = 1000


def is_valid(w: str) -> bool:
    # Hebrew letters (+ optional apostrophe/hyphen)
    return bool(re.fullmatch(r"[\u0590-\u05FF'\-]+", (w or '').strip()))


def main():
    raw = top_n_list('he', N * 4)
    cleaned, seen = [], set()
    for w in raw:
        w = w.strip()
        if not w or w in seen or len(w) < 2 or not is_valid(w):
            continue
        seen.add(w)
        cleaned.append(w)
        if len(cleaned) == N:
            break

    print(f'Collected {len(cleaned)} Hebrew words. Translating...')
    tr = GoogleTranslator(source='iw', target='en')
    out = []

    for i, he in enumerate(cleaned, 1):
        try:
            en = (tr.translate(he) or '').strip().lower()
        except Exception:
            en = ''
        if not en:
            en = he
        alts = [a.strip().lower() for a in re.split(r'[,/;]', en) if a.strip()]
        if not alts:
            alts = [en]
        out.append({'he': he, 'en': alts})

        if i % 100 == 0:
            print(f'  {i}/{len(cleaned)}')
        time.sleep(0.05)

    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)

    print(f'✅ Saved {len(out)} words to {OUT}')


if __name__ == '__main__':
    main()

"""Report t('literal.keys') used in source that are missing from any locale.

Usage: python3 .agents/tools/i18n_used_keys.py src src/core/i18n/locales
Exits non-zero when a key is missing or when no keys were scanned.
"""
import json, re, sys, os
src, locdir = sys.argv[1], sys.argv[2]
def flat(o, p=''):
    out = {}
    if isinstance(o, dict):
        for k, v in o.items(): out.update(flat(v, f'{p}.{k}' if p else k))
    else: out[p] = o
    return out
locs = {f[:-5]: flat(json.load(open(os.path.join(locdir, f)))) for f in os.listdir(locdir) if f.endswith('.json')}
pat = re.compile(r"""\bt\(\s*['"]([a-zA-Z0-9_.]+)['"]""")
n = 0
missing = 0
for root, _, files in os.walk(src):
    for f in files:
        if not f.endswith(('.tsx', '.ts')) or '.test.' in f or '.stories.' in f or '__tests__' in root: continue
        p = os.path.join(root, f)
        for i, line in enumerate(open(p, encoding='utf-8'), 1):
            for k in pat.findall(line):
                n += 1
                miss = [l for l, kv in locs.items() if k not in kv and not any(x.startswith(k + '.') or x in {f'{k}_{p}' for p in ('zero','one','two','few','many','other')} for x in kv)]
                if miss:
                    missing += 1
                    print(f'{p}:{i} {k} missing in {sorted(miss)}')
if n == 0: sys.exit('no t() calls parsed')
print(f'{n} literal t() keys scanned')
sys.exit(1 if missing else 0)

import re

bundle_path = r"C:\Users\lenovo\Downloads\Himnario_Backup\assets\index.android.bundle"
with open(bundle_path, "rb") as f:
    data = f.read()

print(f"Bundle size: {len(data)} bytes")

# Look for firestore or database collections
for pattern in [rb'collection\([b\'\"]([^\'\"]+)[b\'\"]\)', rb'firestore', rb'databaseURL', rb'projectId']:
    found = re.findall(pattern, data)
    print(f"Pattern {pattern}: {found[:10]}")

text_data = data.decode('latin-1', errors='ignore')
candidates = set(re.findall(r'[A-Za-z0-9_\-\.\/]{4,50}(?:himno|coro|firebase|firestore)[A-Za-z0-9_\-\.\/]*', text_data, re.IGNORECASE))
print(f"Candidates found: {len(candidates)}")
for c in list(candidates)[:25]:
    print("Candidate:", c)

from hermes_dec.parsers.hbc_file_parser import HBCReader
import json
import os

bundle_path = r"C:\Users\lenovo\Downloads\Himnario_Backup\assets\index.android.bundle"
print("Leyendo bundle con HBCReader...")
with open(bundle_path, "rb") as f:
    reader = HBCReader()
    reader.read_whole_file(f)

strings = reader.strings
print(f"Total strings extraídos: {len(strings)}")

clean_strings = []
for s in strings:
    if isinstance(s, str):
        clean_s = s.encode('utf-8', errors='replace').decode('utf-8', errors='replace')
        clean_strings.append(clean_s)
    else:
        clean_strings.append(str(s))

out_json = r"C:\Users\lenovo\Downloads\Himnario_App_Build\bundle_strings.json"
with open(out_json, "w", encoding="utf-8") as f:
    json.dump(clean_strings, f, ensure_ascii=False, indent=2)

print(f"Guardado {out_json}. Buscando himnos y coros...")

# Let's inspect strings that have multiline or song lyrics
spanish_songs = []
for s in strings:
    if isinstance(s, str) and ("\n" in s or "||" in s or "II" in s):
        # Check if it looks like lyrics
        if any(w in s for w in ["Dios", "Señor", "Cristo", "Jesús", "gloria", "alabanza", "aleluya", "Espíritu", "Jehová"]):
            spanish_songs.append(s)

print(f"Candidatos con letra: {len(spanish_songs)}")
for i, s in enumerate(spanish_songs[:20]):
    print(f"\n--- CANCIÓN {i+1} ---")
    print(s[:150])

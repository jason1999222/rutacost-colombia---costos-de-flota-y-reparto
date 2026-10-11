import json
import re

with open(r"C:\Users\lenovo\Downloads\Himnario_App_Build\bundle_strings.json", "r", encoding="utf-8") as f:
    all_strings = json.load(f)

print(f"Total strings: {len(all_strings)}")

# Look for titles and indices
# In React Native apps, there are usually lists of objects with { id, title, number, lyrics, ... }
# Or strings like "Himno 1", "Coro 1"
songs = []
for i, s in enumerate(all_strings):
    if not isinstance(s, str):
        continue
    # Spanish lyrics typically have accents, Spanish keywords
    has_spanish = any(w in s.lower() for w in [
        "señor", "jesús", "dios", "gloria", "jehová", "aleluya", "espíritu", 
        "salvador", "cristo", "coro", "alabanza", "fuego", "hermanos", "bendito"
    ])
    if has_spanish and ("\n" in s or "II" in s or "CORO" in s):
        # Exclude non-lyrics
        if len(s) > 30 and not any(skip in s for skip in ["http", "class", "node_modules", "Firebase", "Exception", "Component"]):
            # Filter out non-Spanish (like Italian or English or German)
            non_sp = sum(1 for w in ["the ", "you ", "ecco", "dio ", "gesù", "und ", "der ", "die "] if w in s.lower())
            if non_sp < 2:
                songs.append((i, s))

print(f"Canciones en español encontradas: {len(songs)}")

# Save to a structured file
with open(r"C:\Users\lenovo\Downloads\Himnario_App_Build\canciones_extraidas.json", "w", encoding="utf-8") as f:
    json.dump([s[1] for s in songs], f, ensure_ascii=False, indent=2)

print("Guardado en canciones_extraidas.json")

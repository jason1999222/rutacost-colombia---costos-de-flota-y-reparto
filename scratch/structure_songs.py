import json
import re

with open(r"C:\Users\lenovo\Downloads\Himnario_App_Build\canciones_extraidas.json", "r", encoding="utf-8") as f:
    raw_songs = json.load(f)

print(f"Total raw songs: {len(raw_songs)}")

# Let's clean and structure each song
structured_songs = []
seen_texts = set()

for s in raw_songs:
    # Normalize whitespace
    text = s.strip()
    if len(text) < 25:
        continue
    # Key for deduplication
    norm_key = re.sub(r'[\s\W_]+', '', text.lower())[:80]
    if norm_key in seen_texts:
        continue
    seen_texts.add(norm_key)

    lines = [l.strip() for l in text.split("\n") if l.strip()]
    if not lines:
        continue

    # Title detection
    first_line = lines[0].strip()
    # If first line is a number or "CORO", take second line
    title = first_line
    if re.match(r'^(?:[0-9]+|CORO|II|\/\/|Himno|Coro)', first_line) and len(lines) > 1:
        title = lines[1].strip()

    # Clean title
    title = re.sub(r'^(?:[0-9]+[\.\-\s]*|II\s*|\/\/\s*|CORO:?\s*)', '', title)
    title = re.sub(r'(?:\s*II|\s*\/\/)$', '', title).strip()
    if len(title) > 60:
        title = title[:57] + "..."

    # Determine type: Himno vs Coro
    # Himnos typically have stanzas with numbers or > 3 stanzas
    has_numbered_stanzas = bool(re.search(r'\b[1-4]\b', text))
    is_long = len(lines) > 8
    song_type = "himno" if (has_numbered_stanzas or (is_long and "CORO" in text)) else "coro"

    # Split into stanzas
    stanzas = []
    current_stanza = []
    for l in text.split("\n"):
        line_clean = l.strip()
        if not line_clean:
            if current_stanza:
                stanzas.append("\n".join(current_stanza))
                current_stanza = []
        else:
            current_stanza.append(line_clean)
    if current_stanza:
        stanzas.append("\n".join(current_stanza))

    if not stanzas:
        stanzas = [text]

    structured_songs.append({
        "type": song_type,
        "title": title.capitalize() if title.isupper() else title,
        "stanzas": stanzas,
        "full_text": text
    })

# Separate into himnos and coros
himnos_list = [s for s in structured_songs if s["type"] == "himno"]
coros_list = [s for s in structured_songs if s["type"] == "coro"]

# Sort by title or natural order and assign sequential numbers
for i, h in enumerate(himnos_list):
    h["id"] = f"H{i+1}"
    h["num"] = i + 1

for i, c in enumerate(coros_list):
    c["id"] = f"C{i+1}"
    c["num"] = i + 1

print(f"Himnos estructurados: {len(himnos_list)}")
print(f"Coros estructurados: {len(coros_list)}")
print(f"Total canciones completas de la IDMJI: {len(himnos_list) + len(coros_list)}")

# Save to assets
with open(r"C:\Users\lenovo\Downloads\Himnario_App_Build\assets\himnos_completos.json", "w", encoding="utf-8") as f:
    json.dump(himnos_list, f, ensure_ascii=False, indent=2)

with open(r"C:\Users\lenovo\Downloads\Himnario_App_Build\assets\coros_completos.json", "w", encoding="utf-8") as f:
    json.dump(coros_list, f, ensure_ascii=False, indent=2)

print("Guardado en himnos_completos.json y coros_completos.json")

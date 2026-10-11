import os
import json
import sqlite3
import re
from hermes_dec.parsers.hbc_file_parser import HBCReader

BUILD_DIR = r"C:\Users\lenovo\Downloads\Himnario_App_Build"
ASSETS_DIR = os.path.join(BUILD_DIR, "assets")
DATA_DIR = os.path.join(BUILD_DIR, "data")
BUNDLE_PATH = r"C:\Users\lenovo\Downloads\Himnario_Backup\assets\index.android.bundle"
SQLITE_PATH = os.path.join(DATA_DIR, "RVR1960.sqlite")

print("1. Extracting all Spanish Himnos and Coros from original bundle...")
reader = HBCReader()
with open(BUNDLE_PATH, "rb") as f:
    reader.read_whole_file(f)

def dec(s):
    if not isinstance(s, str):
        return ""
    try:
        return bytes([ord(c) for c in s if ord(c) < 256]).decode('latin-1')
    except:
        return s

# Non-spanish indicators
non_es_words = [
    ' the ', ' and ', ' with ', ' lord ', ' jesus christ ', ' for me ', ' thou ', ' thy ', ' thee ', ' my savior ',
    ' ich ', ' und ', ' der ', ' die ', ' das ', ' nicht ', ' herr ', ' gott ', ' mein ', ' dein ',
    ' signore ', ' gesù ', ' perchè ', ' questo ', ' questa ', ' sono ', ' siamo ', ' grazia ', ' fratelli ',
    ' doamne ', ' pentru ', ' sunt ', ' este ', ' bucurie ', ' calea ', ' lumina ', ' viata ',
    '()', 'shu', 'kami', 'kirisuto'
]

def is_spanish(text):
    tl = ' ' + text.lower() + ' '
    if any(nw in tl for nw in non_es_words):
        return False
    es_chars = ['ñ', 'á', 'é', 'í', 'ó', 'ú', 'ü', '¿', '¡']
    es_words = [
        ' de ', ' en ', ' la ', ' el ', ' que ', ' y ', ' los ', ' las ', ' por ', ' con ', 
        ' su ', ' al ', ' para ', ' un ', ' una ', ' del ', ' señor ', ' dios ', ' jesús ', 
        ' cristo ', ' jehová ', ' gloria ', ' coro ', ' solo ', ' más ', ' fuego '
    ]
    has_char = any(c in tl for c in es_chars)
    has_words = sum(1 for w in es_words if w in tl) >= 2
    return has_char or has_words

# Collect all uppercase Spanish titles to assist naming
candidate_titles = []
for s in reader.strings:
    if isinstance(s, str) and 3 < len(s) < 65 and '\n' not in s:
        t = dec(s).strip()
        if t.isupper() and not any(t.startswith(x) for x in ['HTTP', 'VIEW', 'REACT', 'ANDROID', 'EXPO', 'FIREBASE', 'RN', 'ERROR', 'NULL', 'AUTH', 'GET', 'SET', 'ADBE']):
            if is_spanish(t):
                candidate_titles.append(t)

print(f"Collected {len(candidate_titles)} uppercase title candidates.")

# Extract Spanish lyrics
unique_lyrics = []
seen_norms = set()

for s in reader.strings:
    if not isinstance(s, str) or len(s) < 20 or '\n' not in s:
        continue
    text = dec(s).strip()
    if not is_spanish(text):
        continue
    norm = re.sub(r'[\s\W_]+', '', text.lower())[:70]
    if norm in seen_norms:
        continue
    seen_norms.add(norm)
    unique_lyrics.append(text)

print(f"Total unique Spanish lyrics extracted: {len(unique_lyrics)}")

himnos_raw = []
coros_raw = []

for text in unique_lyrics:
    # Himnos have numbered stanzas like 1\n ... 2\n or CORO with multiple stanzas
    has_numbered_stanzas = bool(re.search(r'(?:^|\n)\s*[1-4]\s*\n', text))
    line_count = len(text.split('\n'))
    if has_numbered_stanzas or (line_count > 10 and 'CORO' in text):
        himnos_raw.append(text)
    else:
        coros_raw.append(text)

print(f"Extracted Himnos: {len(himnos_raw)}, Coros: {len(coros_raw)}")

def process_song(text, song_type):
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    if not lines:
        return None
    
    # Determine title
    # Look for best matching uppercase title
    text_clean = text.lower()
    matched_title = None
    for ct in candidate_titles:
        if ct.lower() in text_clean:
            matched_title = ct.title() if ct.isupper() else ct
            break
            
    if not matched_title:
        first_line = lines[0]
        if re.match(r'^(?:[0-9]+|CORO|II|\/\/|Himno|Coro)', first_line) and len(lines) > 1:
            first_line = lines[1]
        first_line = re.sub(r'^(?:[0-9]+[\.\-\s]*|II\s*|\/\/\s*|CORO:?\s*)', '', first_line)
        first_line = re.sub(r'(?:\s*II|\s*\/\/)$', '', first_line).strip()
        matched_title = first_line[:55]
    
    # Split stanzas
    stanzas = []
    curr = []
    for l in text.split('\n'):
        line_clean = l.strip()
        if not line_clean:
            if curr:
                stanzas.append("\n".join(curr))
                curr = []
        else:
            curr.append(line_clean)
    if curr:
        stanzas.append("\n".join(curr))
        
    return {
        "title": matched_title,
        "stanzas": stanzas if stanzas else [text],
        "full_text": text
    }

structured_himnos = []
for i, t in enumerate(himnos_raw):
    s = process_song(t, "himno")
    if s:
        s["id"] = f"H{len(structured_himnos)+1}"
        s["num"] = len(structured_himnos) + 1
        s["type"] = "himno"
        structured_himnos.append(s)

structured_coros = []
for i, t in enumerate(coros_raw):
    s = process_song(t, "coro")
    if s:
        s["id"] = f"C{len(structured_coros)+1}"
        s["num"] = len(structured_coros) + 1
        s["type"] = "coro"
        structured_coros.append(s)

print(f"Final Structured Himnos: {len(structured_himnos)}")
print(f"Final Structured Coros: {len(structured_coros)}")

# Save to assets
with open(os.path.join(ASSETS_DIR, "himnos_completos.json"), "w", encoding="utf-8") as f:
    json.dump(structured_himnos, f, ensure_ascii=False, indent=2)

with open(os.path.join(ASSETS_DIR, "coros_completos.json"), "w", encoding="utf-8") as f:
    json.dump(structured_coros, f, ensure_ascii=False, indent=2)

print("2. Building complete Reina Valera 1960 with Section Headings (Titles)...")
conn = sqlite3.connect(SQLITE_PATH)
c = conn.cursor()

# Read books
c.execute("SELECT book_number, short_name, long_name FROM books ORDER BY book_number")
db_books = c.fetchall()

# Read stories / headings
c.execute("SELECT book_number, chapter, verse, title FROM stories WHERE title NOT LIKE '(<x>%'")
stories_rows = c.fetchall()

# Map headings: (book_number, chapter, verse) -> title
headings_map = {}
for bnum, ch, vs, title in stories_rows:
    key = f"{bnum}_{ch}_{vs}"
    # Clean title
    title_clean = title.strip()
    if title_clean:
        if key not in headings_map:
            headings_map[key] = []
        headings_map[key].append(title_clean)

# Read verses
c.execute("SELECT book_number, chapter, verse, text FROM verses ORDER BY book_number, chapter, verse")
verses_rows = c.fetchall()

bible_dataset = []
verses_by_book = {}
for bnum, ch, vs, text in verses_rows:
    if bnum not in verses_by_book:
        verses_by_book[bnum] = {}
    if ch not in verses_by_book[bnum]:
        verses_by_book[bnum][ch] = []
    
    # Check if there is a heading for this verse
    key = f"{bnum}_{ch}_{vs}"
    heading = headings_map.get(key, None)
    
    verses_by_book[bnum][ch].append({
        "v": vs,
        "t": text,
        "h": heading[0] if heading else None
    })

for bnum, sname, lname in db_books:
    ch_dict = verses_by_book.get(bnum, {})
    sorted_chapters = [ch_dict[ch] for ch in sorted(ch_dict.keys())]
    bible_dataset.append({
        "name": lname,
        "short": sname,
        "chapters": sorted_chapters
    })

out_biblia = os.path.join(ASSETS_DIR, "biblia_con_titulos.json")
with open(out_biblia, "w", encoding="utf-8") as f:
    json.dump(bible_dataset, f, ensure_ascii=False)

print(f"Saved complete Bible with titles: {out_biblia} ({os.path.getsize(out_biblia)/1024/1024:.2f} MB)")
print("Done preparing all complete data!")

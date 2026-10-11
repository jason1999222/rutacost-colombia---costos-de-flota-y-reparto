import os
import json
import re
from hermes_dec.parsers.hbc_file_parser import HBCReader

BUILD_DIR = r"C:\Users\lenovo\Downloads\Himnario_App_Build"
ASSETS_DIR = os.path.join(BUILD_DIR, "assets")
BUNDLE_PATH = r"C:\Users\lenovo\Downloads\Himnario_Backup\assets\index.android.bundle"

print("Reading Hermes bundle...")
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

# Italian words (never Spanish)
it_forbidden = {
    'il', 'lo', 'gli', 'dei', 'degli', 'delle', 'dello', 'nella', 'nello', 'nelle', 'nei', 
    'sul', 'sulla', 'sullo', 'sulle', 'sui', 'egli', 'cuor', 'signor', 'gesù', 'perchè', 
    'perché', 'questo', 'questa', 'questi', 'queste', 'sono', 'siamo', 'grazia', 'fratelli', 
    'dolce', 'clamor', 'chè', 'ognor', 'ognuno', 'salvator', 'redentor', 'tutto', 'tutti', 
    'tutta', 'tutte', 'vedrem', 'siam', 'camminando', 'mio', 'mia', 'miei', 'mie', 'tuo', 
    'tua', 'tuoi', 'tue', 'peccatore', 'croce', 'morì', 'sarai', 'devo', 'gioia', 'solo', 
    'sempre', 'signore', 'prezioso', 'cammino', 'ascolta', 'voce', 'padre', 'iddio', 
    'potente', 'vittoria', 'battaglia', 'nostro', 'nostra', 'nostri', 'nostre', 'bene', 
    'fede', 'luce', 'parola', 'dona', 'donami', 'chiamo', 'sento', 'vedo', 'andiamo',
    'gregge', 'pastore', 'agnel'
}

# Romanian forbidden
ro_forbidden = {
    'când', 'cand', 'cînd', 'isus', 'salvatorul', 'fraii', 'frați', 'dimineaa', 'dimineața', 
    'pentru', 'sunt', 'este', 'bucurie', 'calea', 'lumina', 'viata', 'viața', 'stânc', 
    'dragost', 'cerul', 'astzi', 'astazi', 'mâinile', 'nevoie', 'oapta', 'mare', 'harul', 
    'isuse', 'inima', 'taina', 'mult', 'din'
}

# English forbidden
en_forbidden = {
    'the', 'and', 'with', 'lord', 'thou', 'thy', 'thee', 'savior', 'praise', 'shall', 
    'unto', 'jesus', 'christ', 'when', 'will', 'have', 'from', 'our', 'his', 'him', 
    'they', 'them', 'their', 'was', 'were', 'been', 'come', 'came', 'glory', 'holy'
}

# German forbidden
de_forbidden = {
    'ich', 'und', 'der', 'die', 'das', 'nicht', 'herr', 'gott', 'mein', 'dein', 'sein', 
    'mit', 'auf', 'aus', 'mir', 'dir', 'wir', 'uns', 'ihr', 'sie', 'dem', 'den'
}

# Spanish distinctive required words (at least 2 required)
es_required = {
    'del', 'los', 'las', 'para', 'por', 'jehová', 'alabanza', 'fuego', 'corazón', 'señor', 
    'jesús', 'cristo', 'salvación', 'bendición', 'hermanos', 'dios', 'más', 'vida', 
    'cielo', 'alma', 'gloria', 'coro', 'hoy', 'pero', 'aleluya', 'santo', 'padre'
}

def is_strictly_spanish_lyrics(text):
    words = set(re.findall(r'[a-zA-ZáéíóúñüÁÉÍÓÚÑÜàèìòùÀÈÌÒÙ]+', text.lower()))
    if len(words & it_forbidden) >= 2:
        return False
    if len(words & ro_forbidden) >= 1:
        return False
    if len(words & en_forbidden) >= 2:
        return False
    if len(words & de_forbidden) >= 2:
        return False
    if len(words & es_required) < 2:
        return False
    return True

# Collect uppercase titles in Spanish
uppercase_titles = []
for s in reader.strings:
    if isinstance(s, str) and 3 < len(s) < 65 and '\n' not in s:
        t = dec(s).strip()
        if t.isupper() and not any(t.startswith(x) for x in ['HTTP', 'VIEW', 'REACT', 'ANDROID', 'EXPO', 'FIREBASE', 'RN', 'ERROR', 'NULL', 'AUTH', 'GET', 'SET', 'ADBE']):
            w = set(re.findall(r'[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ]+', t.lower()))
            if not (w & it_forbidden) and not (w & ro_forbidden) and not (w & en_forbidden) and not (w & de_forbidden):
                uppercase_titles.append(t)

print(f"Collected {len(uppercase_titles)} clean uppercase titles.")

# Collect unique lyrics
unique_lyrics = []
seen = set()
for s in reader.strings:
    if not isinstance(s, str) or len(s) < 25 or '\n' not in s:
        continue
    t = dec(s).strip()
    if not is_strictly_spanish_lyrics(t):
        continue
    norm = re.sub(r'[\s\W_]+', '', t.lower())[:60]
    if norm in seen:
        continue
    seen.add(norm)
    unique_lyrics.append(t)

print(f"Total pure Spanish lyrics extracted: {len(unique_lyrics)}")

himnos_list = []
coros_list = []

for text in unique_lyrics:
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    if not lines:
        continue
    
    # Check if himno (has numbered stanzas like 1\n ... 2\n or CORO with stanzas)
    has_numbered_stanzas = bool(re.search(r'(?:^|\n)\s*[1-4]\s*\n', text))
    line_count = len(lines)
    is_himno = has_numbered_stanzas or (line_count > 9 and 'CORO' in text)
    
    # Clean first line
    first_clean = ""
    for l in lines:
        cl = re.sub(r'^(?:[0-9]+[\.\-\s]*|II\s*|\/\/\s*|CORO:?\s*|¡|¿)', '', l)
        cl = re.sub(r'(?:\s*II|\s*\/\/|!|\?)$', '', cl).strip()
        if len(cl) > 3:
            first_clean = cl
            break
            
    # Match uppercase title that matches first_clean or begins with it
    matched_title = None
    fc_lower = first_clean.lower()
    for ut in uppercase_titles:
        ut_lower = ut.lower()
        if ut_lower == fc_lower or ut_lower.startswith(fc_lower[:20]) or fc_lower.startswith(ut_lower[:20]):
            matched_title = ut.title() if ut.isupper() else ut
            break
            
    if not matched_title:
        matched_title = first_clean[:55]
        if matched_title.isupper():
            matched_title = matched_title.title()
    
    # Stanzas
    stanzas = []
    curr = []
    for l in text.split('\n'):
        lc = l.strip()
        if not lc:
            if curr:
                stanzas.append("\n".join(curr))
                curr = []
        else:
            curr.append(lc)
    if curr:
        stanzas.append("\n".join(curr))
        
    song_obj = {
        "title": matched_title,
        "stanzas": stanzas if stanzas else [text],
        "full_text": text
    }
    
    if is_himno:
        himnos_list.append(song_obj)
    else:
        coros_list.append(song_obj)

# Sort alphabetically by title
himnos_list.sort(key=lambda s: s["title"].lower())
coros_list.sort(key=lambda s: s["title"].lower())

for i, h in enumerate(himnos_list):
    h["id"] = f"H{i+1}"
    h["num"] = i + 1
    h["type"] = "himno"

for i, c in enumerate(coros_list):
    c["id"] = f"C{i+1}"
    c["num"] = i + 1
    c["type"] = "coro"

print(f"Purified Himnos: {len(himnos_list)}")
print(f"Purified Coros: {len(coros_list)}")
print(f"Total Alabanzas IDMJI: {len(himnos_list) + len(coros_list)}")

# Save JSON and JS data
with open(os.path.join(ASSETS_DIR, "himnos_completos.json"), "w", encoding="utf-8") as f:
    json.dump(himnos_list, f, ensure_ascii=False, indent=2)

with open(os.path.join(ASSETS_DIR, "himnos_data.js"), "w", encoding="utf-8") as f:
    f.write("const HIMNOS_DATA = " + json.dumps(himnos_list, ensure_ascii=False) + ";")

with open(os.path.join(ASSETS_DIR, "coros_completos.json"), "w", encoding="utf-8") as f:
    json.dump(coros_list, f, ensure_ascii=False, indent=2)

with open(os.path.join(ASSETS_DIR, "coros_data.js"), "w", encoding="utf-8") as f:
    f.write("const COROS_DATA = " + json.dumps(coros_list, ensure_ascii=False) + ";")

print("Done purifying and updating data JS files!")

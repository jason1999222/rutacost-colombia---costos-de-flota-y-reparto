import os
import json
import sqlite3
import re

BUILD_DIR = r"C:\Users\lenovo\Downloads\Himnario_App_Build"
ASSETS_DIR = os.path.join(BUILD_DIR, "assets")
DATA_DIR = os.path.join(BUILD_DIR, "data")
SQLITE_PATH = os.path.join(DATA_DIR, "RVR1960.sqlite")

conn = sqlite3.connect(SQLITE_PATH)
c = conn.cursor()

# 1. Book map
c.execute("SELECT book_number, short_name, long_name FROM books ORDER BY book_number")
db_books = c.fetchall()

c.execute("SELECT book_number, short_name FROM books_all")
all_books_map = {r[0]: r[1] for r in c.fetchall()}

# Map abbreviations
def format_book_short(bnum):
    s = all_books_map.get(bnum, str(bnum))
    if not s.endswith('.'):
        s += '.'
    return s

def resolve_x_refs(text):
    def rep(m):
        content = m.group(1).strip()
        parts = content.split(' ', 1)
        if len(parts) == 2 and parts[0].isdigit():
            bnum = int(parts[0])
            bname = format_book_short(bnum)
            return f'{bname} {parts[1]}'
        return content
    return re.sub(r'<x>(.*?)</x>', rep, text)

# 2. Extract stories (titles and cross references)
c.execute("SELECT book_number, chapter, verse, order_if_several, title FROM stories ORDER BY book_number, chapter, verse, order_if_several")
all_stories = c.fetchall()

headings_by_key = {}
for bnum, ch, vs, ord_num, title in all_stories:
    key = f"{bnum}_{ch}_{vs}"
    if key not in headings_by_key:
        headings_by_key[key] = {"title": None, "crossref": None}
    
    t_clean = title.strip()
    if t_clean.startswith('(<x>'):
        headings_by_key[key]["crossref"] = resolve_x_refs(t_clean)
    else:
        headings_by_key[key]["title"] = t_clean

print(f"Total story keys: {len(headings_by_key)}")

# 3. Process verses
c.execute("SELECT book_number, chapter, verse, text FROM verses ORDER BY book_number, chapter, verse")
verses_rows = c.fetchall()

verses_by_book = {}
for bnum, ch, vs, text in verses_rows:
    if bnum not in verses_by_book:
        verses_by_book[bnum] = {}
    if ch not in verses_by_book[bnum]:
        verses_by_book[bnum][ch] = []

    # Clean text completely:
    # 1) Remove <f>...</f> completely
    # 2) Remove any leftover [12], [22†], etc.
    # 3) Remove <pb/>, <t>, </t>
    cleaned_text = re.sub(r'<f>.*?</f>', '', text)
    cleaned_text = re.sub(r'\[\s*\d+\s*†?\s*\]', '', cleaned_text)
    cleaned_text = cleaned_text.replace('<pb/>', '').replace('<t>', '').replace('</t>', '')
    cleaned_text = re.sub(r'\s{2,}', ' ', cleaned_text).strip()

    # Check for title / crossref
    key = f"{bnum}_{ch}_{vs}"
    story_info = headings_by_key.get(key, None)
    heading_title = story_info["title"] if story_info else None
    heading_ref = story_info["crossref"] if story_info else None

    verses_by_book[bnum][ch].append({
        "v": vs,
        "t": cleaned_text,
        "h": heading_title,
        "xr": heading_ref
    })

bible_dataset = []
for bnum, sname, lname in db_books:
    ch_dict = verses_by_book.get(bnum, {})
    sorted_chapters = [ch_dict[ch] for ch in sorted(ch_dict.keys())]
    bible_dataset.append({
        "name": lname,
        "short": sname,
        "chapters": sorted_chapters
    })

out_json = os.path.join(ASSETS_DIR, "biblia_con_titulos.json")
with open(out_json, "w", encoding="utf-8") as f:
    json.dump(bible_dataset, f, ensure_ascii=False)

out_js = os.path.join(ASSETS_DIR, "biblia_data.js")
with open(out_js, "w", encoding="utf-8") as f:
    f.write("const BIBLIA = " + json.dumps(bible_dataset, ensure_ascii=False) + ";\n")

print(f"Updated Bible dataset saved to {out_json} and {out_js}")

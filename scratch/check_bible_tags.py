import sqlite3
import re

SQLITE_PATH = r"C:\Users\lenovo\Downloads\Himnario_App_Build\data\RVR1960.sqlite"
conn = sqlite3.connect(SQLITE_PATH)
c = conn.cursor()

c.execute("SELECT name FROM sqlite_master WHERE type='table';")
print("Tables in sqlite:", c.fetchall())

# Check all tables
for tbl in [r[0] for r in c.fetchall()]:
    c.execute(f"SELECT COUNT(*) FROM {tbl}")
    print(f"Table {tbl}: {c.fetchone()[0]} rows")

c.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [r[0] for r in c.fetchall()]
for tbl in tables:
    c.execute(f"PRAGMA table_info({tbl});")
    print(f"Schema {tbl}: {[col[1] for col in c.fetchall()]}")

# Check verses for '{' or '[' or '<f>'
c.execute("SELECT book_number, chapter, verse, text FROM verses WHERE text LIKE '%{%' OR text LIKE '%}%' LIMIT 10;")
curly = c.fetchall()
print(f"\nFound {len(curly)} with curly braces: ")
for row in curly[:5]:
    print(row)

c.execute("SELECT book_number, chapter, verse, text FROM verses WHERE text LIKE '%<f>%' LIMIT 10;")
fn = c.fetchall()
print(f"\nFound {len(fn)} with <f>: ")
for row in fn[:5]:
    print(row)

# Let's see what tags appear across verses
c.execute("SELECT text FROM verses WHERE text LIKE '%<%' LIMIT 200;")
tags = set()
for (t,) in c.fetchall():
    for tag in re.findall(r'<[^>]+>', t):
        tags.add(tag)
print("\nUnique tags in verses:", tags)

# Check footnotes or crossreferences if any other table exists in sqlite
for tbl in tables:
    if 'foot' in tbl.lower() or 'cross' in tbl.lower() or 'ref' in tbl.lower() or 'note' in tbl.lower():
        print(f"Found relevant table: {tbl}")
        c.execute(f"SELECT * FROM {tbl} LIMIT 5")
        print(c.fetchall())

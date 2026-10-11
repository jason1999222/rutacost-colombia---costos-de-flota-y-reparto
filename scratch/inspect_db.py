import sqlite3
import json

conn = sqlite3.connect('C:/Users/lenovo/Downloads/Himnario_App_Build/assets/RVR1960.sqlite')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
print("Tables:", cursor.fetchall())

for t in ['verses', 'cross_references', 'footnotes', 'stories', 'books_all']:
    try:
        cursor.execute(f"PRAGMA table_info({t});")
        print(f"Schema {t}:", cursor.fetchall())
    except Exception as e:
        print(f"Error {t}:", e)

# Sample verses with strange notations or brackets
cursor.execute("SELECT book_number, chapter, verse, text FROM verses WHERE text LIKE '%{%' OR text LIKE '%[%' LIMIT 10;")
print("\nVerses with { or [: ")
for row in cursor.fetchall():
    print(row)

# Check footnotes or cross references table if exists
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [r[0] for r in cursor.fetchall()]
for t in tables:
    cursor.execute(f"SELECT COUNT(*) FROM {t}")
    print(f"{t}: {cursor.fetchone()[0]} rows")

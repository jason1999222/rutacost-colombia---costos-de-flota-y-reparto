import sqlite3
import json

conn = sqlite3.connect(r'C:\Users\lenovo\Downloads\Himnario_App_Build\data\RVR1960.sqlite')
c = conn.cursor()

c.execute("SELECT count(*) FROM stories WHERE title NOT LIKE '(<x>%'")
print('Total real section titles:', c.fetchone()[0])

c.execute("SELECT count(*) FROM verses")
print('Total verses:', c.fetchone()[0])

# Sample titles in Matthew
c.execute("""
SELECT b.long_name, s.chapter, s.verse, s.title 
FROM stories s 
JOIN books b ON s.book_number = b.book_number 
WHERE b.short_name = 'Mt' AND s.title NOT LIKE '(<x>%' 
LIMIT 15
""")
print("\nTitles in Mateo:")
for r in c.fetchall():
    print(f"Mateo {r[1]}:{r[2]} -> {r[3]}")

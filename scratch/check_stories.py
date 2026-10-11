import sqlite3

conn = sqlite3.connect(r'C:\Users\lenovo\Downloads\Himnario_App_Build\data\RVR1960.sqlite')
c = conn.cursor()
c.execute("SELECT COUNT(*) FROM stories WHERE title LIKE '(%' OR title LIKE '%<x>%'")
print('Stories with cross references:', c.fetchone()[0])
c.execute("SELECT COUNT(*) FROM stories")
print('Total stories:', c.fetchone()[0])

# Let's inspect some stories
c.execute("SELECT book_number, chapter, verse, title FROM stories WHERE title LIKE '%<x>%' LIMIT 10")
for r in c.fetchall():
    print(r)

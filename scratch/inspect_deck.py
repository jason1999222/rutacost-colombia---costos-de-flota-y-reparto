import re

with open(r"C:\Users\lenovo\Desktop\trabajos andres\Presentacion_Cultura_del_Cuidado.html", "r", encoding="utf-8") as f:
    text = f.read()

matches = re.findall(r'<section\s+class="slide[^"]*"\s+data-name="([^"]+)">', text)
print(f"Total slides found: {len(matches)}")
for idx, sname in enumerate(matches, 1):
    print(f"{idx}. {sname}")

import re

bundle_path = r"C:\Users\lenovo\Downloads\Himnario_Backup\assets\index.android.bundle"
with open(bundle_path, "rb") as f:
    data = f.read()

urls = set(re.findall(rb'https?://[a-zA-Z0-9_\.-]+(?:\.[a-zA-Z]{2,})+(?:/[^\s\"\'\<\>]*)?', data))
for u in sorted(urls):
    u_str = u.decode("utf-8", errors="ignore")
    if any(k in u_str.lower() for k in ["fire", "api", "coro", "himn", "futuro", "json", "idmji", "appspot"]):
        print(u_str)

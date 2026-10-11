import struct

bundle_path = r"C:\Users\lenovo\Downloads\Himnario_Backup\assets\index.android.bundle"
with open(bundle_path, "rb") as f:
    data = f.read()

# Parse Hermes Bytecode Header
magic = data[:8]
version = struct.unpack_from("<I", data, 8)[0]
print(f"Magic: {magic.hex()}, Version: {version}")

# Hermes v0.8.x header:
# 0..7: Magic
# 8..11: Version
# 12..31: SHA256 / Hash (20 or 32 bytes)
# Let's inspect bytes 12..64
print("Header bytes 12..64:", [hex(b) for b in data[12:64]])

# Alternative approach: Find all null-terminated or length-prefixed ASCII/UTF-8 strings of length >= 3
import re
strings = re.findall(rb'[\x20-\x7e\xc2-\xf4][\x20-\x7e\x80-\xbf]{3,}', data)
print(f"Found {len(strings)} raw string candidates.")

with open(r"C:\Users\lenovo\Downloads\Himnario_App_Build\all_strings.txt", "w", encoding="utf-8", errors="ignore") as out:
    for s in strings:
        try:
            line = s.decode("utf-8")
            out.write(line + "\n")
        except:
            pass

print("Saved all_strings.txt. Searching for himno / coro titles or collections...")
with open(r"C:\Users\lenovo\Downloads\Himnario_App_Build\all_strings.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()

results = [l.strip() for l in lines if any(w in l.lower() for w in ["himno", "coro", "cantad", "alabar", "jehova", "dios", "gloria"]) and len(l.strip()) < 80]
print(f"Relevant strings found: {len(results)}")
print("\n".join(results[:50]))

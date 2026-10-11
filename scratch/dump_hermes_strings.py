import struct

bundle_path = r"C:\Users\lenovo\Downloads\Himnario_Backup\assets\index.android.bundle"
with open(bundle_path, "rb") as f:
    data = f.read()

# Hermes bytecode header
magic, version, string_count, func_count = struct.unpack_from("<QIII", data, 0)
print(f"Hermes Magic: {hex(magic)}, Version: {version}, Strings: {string_count}, Functions: {func_count}")

# Find strings in bundle by searching for UTF-8 and ASCII blocks
import re
# Look for mentions of himnos or coros endpoints, collections, or filenames
matches = set(re.findall(rb'[a-zA-Z0-9_\-\.\/]{3,60}(?:himno|coro)[a-zA-Z0-9_\-\.\/]*', data, re.IGNORECASE))
print(f"Total matching paths: {len(matches)}")
for m in sorted(matches):
    print("  ", m.decode('latin-1', errors='ignore'))

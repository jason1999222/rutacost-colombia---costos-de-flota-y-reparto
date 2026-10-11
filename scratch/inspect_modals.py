# -*- coding: utf-8 -*-
import sys, re

with open('scratch/build_sequential_deck.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Locate MODAL_DATA
start = text.find('const MODAL_DATA = {')
end = text.find('};', start)
if start != -1 and end != -1:
    print("Found MODAL_DATA! Length:", end - start)
    sub = text[start:end+2]
    # Find all keys
    keys = re.findall(r'(\w+):\s*\{\s*badge:\s*["\']([^"\']+)["\'],\s*title:\s*["\']([^"\']+)["\']', sub)
    print(f"Total modals found: {len(keys)}")
    for k, b, t in keys:
        print(f"Key: {k:25} | Badge: {b:20} | Title: {t}")
else:
    print("Could not find MODAL_DATA marker")

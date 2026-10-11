# -*- coding: utf-8 -*-
import sys, re

with open('scratch/build_sequential_deck.py', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('const modalData = {')
end = text.find('function goTo(', start)
sub = text[start:end]

# Extract keys with regex accommodating {{ and }}
pattern = re.compile(r'(\w+):\s*\{\{\s*badge:\s*"([^"]+)",\s*icon:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*subtitle:\s*"([^"]+)",\s*content:\s*`([\s\S]*?)`\s*\}\}', re.MULTILINE)

items = pattern.findall(sub)
print(f"Total modal items matched: {len(items)}")

with open('scratch/all_modal_data.txt', 'w', encoding='utf-8') as out:
    for key, badge, icon, title, subtitle, content in items:
        out.write(f"=== KEY: {key} ===\n")
        out.write(f"BADGE: {badge}\n")
        out.write(f"ICON: {icon}\n")
        out.write(f"TITLE: {title}\n")
        out.write(f"SUBTITLE: {subtitle}\n")
        # Clean HTML tags from content for readability
        clean_content = re.sub(r'<[^>]+>', ' ', content)
        clean_content = re.sub(r'\s+', ' ', clean_content).strip()
        out.write(f"CONTENT: {clean_content}\n\n")

print("Saved all modal data to scratch/all_modal_data.txt")

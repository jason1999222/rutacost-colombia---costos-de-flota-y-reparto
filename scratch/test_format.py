import re

def format_song_text(text):
    # Handle III ... III -> x3
    def rep3(m):
        inner = m.group(1).strip()
        return f'<div class="song-repeat-block"><span class="repeat-icon">///</span> {inner} <span class="repeat-icon">///</span> <span class="repeat-badge">x3</span></div>'
    text = re.sub(r'III([\s\S]*?)(?:III|II)', rep3, text)

    # Handle II ... II -> x2
    def rep2(m):
        inner = m.group(1).strip()
        return f'<div class="song-repeat-block"><span class="repeat-icon">//</span> {inner} <span class="repeat-icon">//</span> <span class="repeat-badge">x2</span></div>'
    text = re.sub(r'II([\s\S]*?)II', rep2, text)
    text = re.sub(r'\/\/([\s\S]*?)\/\/', rep2, text)

    # Handle (bis) or (x2)
    text = re.sub(r'\((?:bis|x2)\)', '<span class="repeat-badge">x2</span>', text, flags=re.IGNORECASE)
    return text

sample1 = 'II Alaba, alma mía, a Jehová II\nAlabaré a Jehová\nEn mi vida mientras viva.'
sample2 = 'II Alabad, bendecid a Jehová,\nVosotros los hijos de Dios II\nII Alzad vuestras manos, batidlas a él\nY decidle que solo él es fiel. II'
print("Sample 1:\n", format_song_text(sample1))
print()
print("Sample 2:\n", format_song_text(sample2))

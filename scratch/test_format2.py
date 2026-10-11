def format_song_text(raw_text):
    lines = raw_text.split('\n')
    result = []
    in_repeat = False
    repeat_lines = []
    repeat_count = 'x2'

    def render_block(lines_arr, count):
        content = '<br>'.join(lines_arr)
        return f'<div class="song-repeat-block"><span class="repeat-icon">//</span> {content} <span class="repeat-icon">//</span> <span class="repeat-badge">{count}</span></div>'

    for line in lines:
        l = line.strip()
        if not l:
            if in_repeat:
                result.append(render_block(repeat_lines, repeat_count))
                repeat_lines = []
                in_repeat = False
            result.append('')
            continue

        import re
        m_single3 = re.match(r'^(?:III|///)\s*(.*?)\s*(?:III|///)$', l)
        if m_single3:
            result.append(render_block([m_single3.group(1)], 'x3'))
            continue

        m_single = re.match(r'^(?:II|//)\s*(.*?)\s*(?:II|//)$', l)
        if m_single:
            result.append(render_block([m_single.group(1)], 'x2'))
            continue

        if l.startswith('II ') or l == 'II' or l.startswith('// ') or l == '//':
            if in_repeat:
                result.append(render_block(repeat_lines, repeat_count))
                repeat_lines = []
            in_repeat = True
            repeat_count = 'x2'
            content = re.sub(r'^(?:II|//)\s*', '', l)
            if content:
                repeat_lines.append(content)
            continue

        if in_repeat and (l.endswith(' II') or l == 'II' or l.endswith(' //') or l == '//'):
            content = re.sub(r'\s*(?:II|//)$', '', l)
            if content:
                repeat_lines.append(content)
            result.append(render_block(repeat_lines, repeat_count))
            repeat_lines = []
            in_repeat = False
            continue

        if in_repeat:
            repeat_lines.append(l)
        else:
            cleaned = re.sub(r'\((?:bis|x2)\)', '<span class="repeat-badge">x2</span>', l, flags=re.IGNORECASE)
            result.append(cleaned)

    if in_repeat and repeat_lines:
        result.append(render_block(repeat_lines, repeat_count))

    return '\n'.join(result)

sample1 = 'II Alaba, alma mía, a Jehová II\nAlabaré a Jehová\nEn mi vida mientras viva.'
sample2 = 'II Alabad, bendecid a Jehová,\nVosotros los hijos de Dios II\nII Alzad vuestras manos, batidlas a él\nY decidle que solo él es fiel. II'
print("Sample 1:")
print(format_song_text(sample1))
print("\nSample 2:")
print(format_song_text(sample2))

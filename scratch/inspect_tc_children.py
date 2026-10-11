# -*- coding: utf-8 -*-
import docx

doc = docx.Document(r"C:\Users\lenovo\Downloads\Plantilla Tipo Tarea_CIENCIAS SOCIALES Y AMBIENTE -ACTIVIDAD-1.docx")
cell = doc.tables[1].rows[2].cells[0]

print("Elements inside cell:")
for child in cell._tc:
    tag = child.tag.split('}')[-1]
    if tag == 'p':
        p = docx.text.paragraph.Paragraph(child, cell)
        txt = p.text.strip()
        if txt:
            print(f"  <p>: {txt[:70]}")
    elif tag == 'tbl':
        tbl = docx.table.Table(child, cell)
        print(f"  <tbl>: rows={len(tbl.rows)}, cols={len(tbl.columns)}, text={[c.text.strip() for c in tbl.rows[0].cells]}")

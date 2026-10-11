import docx

doc = docx.Document(r"C:\Users\lenovo\Downloads\Plantilla Tipo Tarea_CIENCIAS SOCIALES Y AMBIENTE -ACTIVIDAD-1.docx")
cell = doc.tables[1].rows[2].cells[0]

for i, child in enumerate(cell._tc):
    tag = child.tag.split("}")[-1]
    txt = child.text[:50] if hasattr(child, "text") and child.text else ""
    print(f"[{i:02d}] <{tag}> : {repr(txt)}")

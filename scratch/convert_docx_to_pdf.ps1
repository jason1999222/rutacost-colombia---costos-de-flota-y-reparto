$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $docxPath = "C:\Users\lenovo\Desktop\trabajos andres\Guion_Exposicion_Cultura_del_Cuidado_Angie_Gomez.docx"
    $pdfPath = "C:\Users\lenovo\Desktop\trabajos andres\Guion_Exposicion_Cultura_del_Cuidado_Angie_Gomez.pdf"
    $doc = $word.Documents.Open($docxPath)
    $doc.SaveAs([ref]$pdfPath, [ref]17)
    $doc.Close()
    Copy-Item $pdfPath "C:\Users\lenovo\Downloads\Guion_Exposicion_Cultura_del_Cuidado_Angie_Gomez.pdf" -Force
    Write-Output "PDF generated and copied successfully!"
} catch {
    Write-Output "Error: $_"
} finally {
    $word.Quit()
}

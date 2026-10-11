$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $docxPath = "C:\Users\lenovo\Desktop\trabajos andres\PLAN DE MANEJO DE IMPACTOS AMBIENTALES.docx"
    $pdfPath = "C:\Users\lenovo\Desktop\trabajos andres\PLAN DE MANEJO DE IMPACTOS AMBIENTALES.pdf"
    $doc = $word.Documents.Open($docxPath)
    $doc.SaveAs([ref]$pdfPath, [ref]17)
    $pages = $doc.ComputeStatistics(2)
    Write-Host "PDF generado con exito. Total de paginas: $pages"
    $doc.Close()
} catch {
    Write-Error $_
} finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}

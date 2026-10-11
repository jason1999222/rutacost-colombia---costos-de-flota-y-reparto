$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $docxPath = "C:\Users\lenovo\Downloads\Anteproyecto_Impactos_Psicologicos_Medellin_Primera_Parte_Oficial.docx"
    $pdfPath = "C:\Users\lenovo\Downloads\Anteproyecto_Impactos_Psicologicos_Medellin_Primera_Parte_Oficial.pdf"
    $desktopPdf = "C:\Users\lenovo\Desktop\Anteproyecto_Impactos_Psicologicos_Medellin_Primera_Parte_Oficial.pdf"
    
    $doc = $word.Documents.Open($docxPath)
    $doc.SaveAs([ref]$pdfPath, [ref]17)
    $doc.SaveAs([ref]$desktopPdf, [ref]17)
    $pages = $doc.ComputeStatistics(2)
    Write-Host "PDF generado con exito. Total de paginas: $pages"
    $doc.Close()
} catch {
    Write-Error $_
} finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}

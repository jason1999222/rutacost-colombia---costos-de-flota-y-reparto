$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $docxPath = "C:\Users\lenovo\Desktop\trabajos andres\Guion_Exposicion_Cultura_del_Cuidado_Bertha_Medina.docx"
    $pdfDesktop = "C:\Users\lenovo\Desktop\trabajos andres\Guion_Exposicion_Cultura_del_Cuidado_Bertha_Medina.pdf"
    $pdfDownloads = "C:\Users\lenovo\Downloads\Guion_Exposicion_Cultura_del_Cuidado_Bertha_Medina.pdf"

    Write-Host "Abriendo guion en Word..."
    $doc = $word.Documents.Open($docxPath)
    $doc.SaveAs([ref]$pdfDesktop, [ref]17)
    $pages = $doc.ComputeStatistics(2)
    Write-Host "Guion exportado a PDF: $pdfDesktop ($pages paginas)"
    $doc.Close([ref]0)

    Copy-Item -Path $pdfDesktop -Destination $pdfDownloads -Force
    Write-Host "Copiado exitosamente a Descargas: $pdfDownloads"
} catch {
    Write-Error $_
} finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}

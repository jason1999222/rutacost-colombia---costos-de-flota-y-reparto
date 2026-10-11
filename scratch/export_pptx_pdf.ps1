$ppt = New-Object -ComObject PowerPoint.Application
try {
    $pptxPath = "C:\Users\lenovo\Desktop\trabajos andres\Presentacion_Cultura_del_Cuidado_Bertha_Medina.pptx"
    $pdfPath = "C:\Users\lenovo\Desktop\trabajos andres\Presentacion_Cultura_del_Cuidado_Bertha_Medina.pdf"
    $pdfDownloads = "C:\Users\lenovo\Downloads\Presentacion_Cultura_del_Cuidado_Bertha_Medina.pdf"

    Write-Host "Abriendo presentacion en PowerPoint..."
    $presentation = $ppt.Presentations.Open($pptxPath, [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)
    
    # 32 = ppSaveAsPDF
    Write-Host "Exportando a PDF en Desktop..."
    $presentation.SaveAs($pdfPath, 32)
    $presentation.Close()

    Copy-Item -Path $pdfPath -Destination $pdfDownloads -Force
    Write-Host "PDF generado y copiado con exito a Descargas."
} catch {
    Write-Error $_
} finally {
    $ppt.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}

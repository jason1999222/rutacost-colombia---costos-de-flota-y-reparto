$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $filesToConvert = @(
        @{
            Docx = "C:\Users\lenovo\Desktop\trabajos andres\Restrepo_JairAndres_Analizando.docx"
            PdfDesktop = "C:\Users\lenovo\Desktop\trabajos andres\Restrepo_JairAndres_Analizando.pdf"
            PdfDownloads = "C:\Users\lenovo\Downloads\Restrepo_JairAndres_Analizando.pdf"
        },
        @{
            Docx = "C:\Users\lenovo\Downloads\Plantilla Tipo Tarea_CIENCIAS SOCIALES Y AMBIENTE -ACTIVIDAD-1.docx"
            PdfDesktop = "C:\Users\lenovo\Desktop\trabajos andres\Plantilla Tipo Tarea_CIENCIAS SOCIALES Y AMBIENTE -ACTIVIDAD-1.pdf"
            PdfDownloads = "C:\Users\lenovo\Downloads\Plantilla Tipo Tarea_CIENCIAS SOCIALES Y AMBIENTE -ACTIVIDAD-1.pdf"
        }
    )

    foreach ($item in $filesToConvert) {
        Write-Host "Procesando $($item.Docx)..."
        $doc = $word.Documents.Open($item.Docx)
        $doc.SaveAs([ref]$item.PdfDesktop, [ref]17)
        $pages = $doc.ComputeStatistics(2)
        Write-Host "PDF generado en Desktop: $($item.PdfDesktop) - Paginas: $pages"
        $doc.Close([ref]0)
        
        Copy-Item -Path $item.PdfDesktop -Destination $item.PdfDownloads -Force
        Write-Host "Copia sincronizada a Descargas: $($item.PdfDownloads)"
    }
} catch {
    Write-Error $_
} finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}

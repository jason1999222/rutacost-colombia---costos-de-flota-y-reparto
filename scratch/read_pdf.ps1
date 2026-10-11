$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $pdfPath = "C:\Users\lenovo\Downloads\JAIR_ANDRES_RESTREPO_CIENCIAS_AMBIENTALES.pdf"
    $doc = $word.Documents.Open($pdfPath)
    Write-Host "PAGES:" $doc.ComputeStatistics(2)
    Write-Host "WORDS:" $doc.ComputeStatistics(0)
    $text = $doc.Content.Text
    $sample = $text.Substring(0, [Math]::Min(1500, $text.Length))
    Write-Host "SAMPLE:"
    Write-Host $sample
    $doc.Close([ref]0)
} catch {
    Write-Error $_
} finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}

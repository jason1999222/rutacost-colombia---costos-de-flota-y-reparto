$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $doc = $word.Documents.Open("C:\Users\lenovo\Downloads\test_repaired.docx")
    $pages = $doc.ComputeStatistics(2)
    Write-Host "EXITO TOTAL AL ABRIR: $pages paginas"
    $doc.Close([ref]0)
} catch {
    Write-Error $_
} finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}

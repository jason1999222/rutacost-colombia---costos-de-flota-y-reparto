$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $doc = $word.Documents.Open('C:\Users\lenovo\Downloads\Anteproyecto_Impactos_Psicologicos_Medellin_Primera_Parte_Oficial.docx')
    for ($i = 1; $i -le $doc.Paragraphs.Count; $i++) {
        $p = $doc.Paragraphs.Item($i)
        $txt = $p.Range.Text.Trim()
        if ($txt -match '^(1\.|2\.|3\.|4\.|5\.|6\.|7\.|9\.|18\.)') {
            $page = $p.Range.Information(3)
            Write-Host "$page : $txt"
        }
    }
    $doc.Close()
} finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}

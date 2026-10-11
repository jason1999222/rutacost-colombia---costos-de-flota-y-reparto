$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
try {
    $wb = $excel.Workbooks.Open('C:\Users\lenovo\Downloads\DC_IUD_Agr_MetInv_ForProInv_EA1_U2_F_Diligenciado.xlsx')
    $ws = $wb.Sheets.Item(1)
    Write-Host "Pages count: $($ws.PageSetup.Pages.Count)"
    $wb.Close($false)
} finally {
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
}

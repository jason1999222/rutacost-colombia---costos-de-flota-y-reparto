$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
try {
    $wbPath = "C:\Users\lenovo\Downloads\DC_IUD_Agr_MetInv_ForProInv_EA1_U2_F_Diligenciado.xlsx"
    $pdfPath = "C:\Users\lenovo\Downloads\DC_IUD_Agr_MetInv_ForProInv_EA1_U2_F_Diligenciado.pdf"
    $desktopPdfPath = "C:\Users\lenovo\Desktop\DC_IUD_Agr_MetInv_ForProInv_EA1_U2_F_Diligenciado.pdf"
    
    $wb = $excel.Workbooks.Open($wbPath)
    $ws = $wb.Sheets.Item(1)
    
    # Configure page setup to fit all columns on 1 page wide
    $ws.PageSetup.Zoom = $false
    $ws.PageSetup.FitToPagesWide = 1
    $ws.PageSetup.FitToPagesTall = $false
    $ws.PageSetup.Orientation = 1 # xlPortrait
    
    # Margins
    $ws.PageSetup.LeftMargin = $excel.InchesToPoints(0.4)
    $ws.PageSetup.RightMargin = $excel.InchesToPoints(0.4)
    $ws.PageSetup.TopMargin = $excel.InchesToPoints(0.5)
    $ws.PageSetup.BottomMargin = $excel.InchesToPoints(0.5)

    # Export to PDF (0 = xlTypePDF)
    $wb.ExportAsFixedFormat(0, $pdfPath)
    $wb.Close($false)
    Write-Output "PDF successfully generated at $pdfPath"
    Copy-Item $pdfPath $desktopPdfPath -Force
    Write-Output "PDF copied to Desktop at $desktopPdfPath"
} catch {
    Write-Error $_
} finally {
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}

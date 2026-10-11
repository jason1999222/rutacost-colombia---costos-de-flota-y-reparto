$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
try {
    $wbPath = "C:\Users\lenovo\Downloads\DC_IUD_Agr_MetInv_ForProInv_EA1_U2_F_Diligenciado.xlsx"
    $pdfPath = "C:\Users\lenovo\Downloads\DC_IUD_Agr_MetInv_ForProInv_EA1_U2_F_Diligenciado.pdf"
    
    $dest1 = "C:\Users\lenovo\Desktop\trabajos andres\DC_IUD_Agr_MetInv_ForProInv_EA1_U2_F_Diligenciado.pdf"
    $dest2 = "C:\Users\lenovo\Desktop\trabajos andres\Propuesta_Proyecto_Investigacion_Jair_Restrepo_TURNITIN.pdf"
    
    $wb = $excel.Workbooks.Open($wbPath)
    $ws = $wb.Sheets.Item(1)
    
    # Configure page setup
    $ws.PageSetup.Zoom = $false
    $ws.PageSetup.FitToPagesWide = 1
    $ws.PageSetup.FitToPagesTall = $false
    $ws.PageSetup.Orientation = 1 # xlPortrait
    
    $ws.PageSetup.LeftMargin = $excel.InchesToPoints(0.4)
    $ws.PageSetup.RightMargin = $excel.InchesToPoints(0.4)
    $ws.PageSetup.TopMargin = $excel.InchesToPoints(0.5)
    $ws.PageSetup.BottomMargin = $excel.InchesToPoints(0.5)

    # Export to PDF (0 = xlTypePDF)
    $wb.ExportAsFixedFormat(0, $pdfPath)
    $wb.Close($false)
    Write-Output "PDF generated: $pdfPath"
    
    Copy-Item $pdfPath $dest1 -Force
    Write-Output "PDF saved to: $dest1"
    
    Copy-Item $pdfPath $dest2 -Force
    Write-Output "PDF saved to: $dest2"
} catch {
    Write-Error $_
} finally {
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}

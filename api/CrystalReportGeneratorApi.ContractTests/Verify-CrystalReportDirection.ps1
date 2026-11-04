param(
    [Parameter(Mandatory = $true)][string]$ReportPath,
    [Parameter(Mandatory = $true)][string]$RuntimeAssemblyPath,
    [Parameter(Mandatory = $true)][string]$OutputDirectory
)

# Run with 64-bit Windows PowerShell and the installed SAP Crystal runtime.
# Fixtures are added in memory. The supplied RPT is never saved or registered.
$ErrorActionPreference = 'Stop'
$sourcePath = (Resolve-Path -LiteralPath $ReportPath).Path
$runtimePath = (Resolve-Path -LiteralPath $RuntimeAssemblyPath).Path
$assemblyRoot = Split-Path -Parent $runtimePath
$sourceHash = (Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash
[void](New-Item -ItemType Directory -Path $OutputDirectory -Force)
$outputPath = (Resolve-Path -LiteralPath $OutputDirectory).Path

foreach ($name in @('CrystalDecisions.CrystalReports.Engine',
    'CrystalDecisions.ReportAppServer.ReportDefModel', 'CrystalDecisions.ReportAppServer.Controllers')) {
    [void][Reflection.Assembly]::LoadFrom((Join-Path $assemblyRoot ($name + '.dll')))
}
$runtime = [Reflection.Assembly]::LoadFrom($runtimePath)
$direction = $runtime.GetType('CrystalReportGeneratorApi.Runtime.Rendering.CrystalReportDirection', $true)
$apply = $direction.GetMethod('Apply', [Reflection.BindingFlags]'Public,Static')

function Assert-Equal($Actual, $Expected, [string]$Message) {
    if ($Actual -ne $Expected) { throw "$Message (expected=$Expected actual=$Actual)" }
}

function Read-Lines($Report) {
    $result = @{}
    foreach ($section in $Report.ReportDefinition.Sections) {
        foreach ($line in $section.ReportObjects) {
            if ($line -is [CrystalDecisions.CrystalReports.Engine.LineObject]) {
                $result[$line.Name] = [ordered]@{
                    left = $line.Left; right = $line.Right; top = $line.Top; bottom = $line.Bottom
                    section = $section.Name; endSection = $line.EndSectionName
                    extend = $line.EnableExtendToBottomOfSection; suppressed = $line.ObjectFormat.EnableSuppress
                    thickness = $line.LineThickness; color = $line.LineColor.ToArgb(); style = $line.LineStyle.ToString()
                }
            }
        }
    }
    return $result
}

function Add-FixtureLine($Controller, $Section, $EndSection, [string]$Name,
    [int]$Left, [int]$Right, [int]$Top, [int]$Bottom, [uint32]$Color, [bool]$Extend) {
    $line = New-Object CrystalDecisions.ReportAppServer.ReportDefModel.LineObjectClass
    $line.Name = $Name
    $line.Left = $Left; $line.Right = $Right; $line.Top = $Top; $line.Bottom = $Bottom
    $line.SectionCode = $Section.SectionCode
    $line.SectionName = $Section.Name; $line.EndSectionName = $EndSection.Name
    $line.LineThickness = 20; $line.LineColor = $Color
    $line.LineStyle = [CrystalDecisions.ReportAppServer.ReportDefModel.CrLineStyleEnum]::crLineStyleSingle
    $line.EnableExtendToBottomOfSection = $Extend
    $Controller.Add($line, $Section, -1)
}

$results = @()
foreach ($language in @('ar', 'en')) {
    $report = New-Object CrystalDecisions.CrystalReports.Engine.ReportDocument
    try {
        $report.Load($sourcePath, [CrystalDecisions.Shared.OpenReportMethod]::OpenReportByTempCopy)
        $definition = $report.ReportClientDocument.ReportDefController.ReportDefinition
        $controller = $report.ReportClientDocument.ReportDefController.ReportObjectController
        $header = $definition.PageHeaderArea.Sections.Item(0)
        $footer = $definition.ReportFooterArea.Sections.Item(0)
        Add-FixtureLine $controller $header $header 'DirectionVisible' 700 700 0 480 255 $false
        Add-FixtureLine $controller $header $header 'DirectionHorizontal' 1800 4500 480 480 16711680 $false
        # Equal Y endpoints across two sections still describe a vertical line.
        Add-FixtureLine $controller $header $footer 'DirectionSpanning' 2200 2200 100 100 32768 $true
        Add-FixtureLine $controller $header $header 'DirectionSuppressed' 3600 3600 0 480 65535 $false
        $report.ReportDefinition.ReportObjects.Item('DirectionSuppressed').ObjectFormat.EnableSuppress = $true

        $data = New-Object System.Data.DataTable 'Command'
        foreach ($name in @('CountryId', 'CountryAr', 'CountryEn', 'StateId', 'StateAr', 'StateEn')) {
            $type = [string]
            if ($name.EndsWith('Id')) { $type = [int] }
            [void]$data.Columns.Add($name, $type)
        }
        [void]$data.Rows.Add(1, 'Country A', 'Country A', 10, 'State A', 'State A')
        [void]$data.Rows.Add(2, 'Country B', 'Country B', 20, 'State B', 'State B')
        $report.ReportOptions.EnableUseDummyData = $false
        $report.ReportOptions.EnableSaveDataWithReport = $false
        $report.ReportOptions.EnableSaveSummariesWithReport = $false
        $report.Database.Tables.Item(0).SetDataSource($data)

        $before = Read-Lines $report
        $width = $report.PrintOptions.PageContentWidth
        $arguments = New-Object object[] 2
        $arguments[0] = $report.PSObject.BaseObject
        $arguments[1] = $language
        [void]$apply.Invoke($null, $arguments)
        $after = Read-Lines $report
        foreach ($name in $before.Keys) {
            $original = $before[$name]
            $actual = $after[$name]
            $expectedLeft = $original.left
            $expectedRight = $original.right
            if ($language -eq 'en' -and ($original.left -eq $original.right -or $original.top -eq $original.bottom)) {
                $expectedLeft = $width - $original.right
                $expectedRight = $width - $original.left
            }
            Assert-Equal $actual.left $expectedLeft "$language $name left"
            Assert-Equal $actual.right $expectedRight "$language $name right"
            foreach ($property in @('top', 'bottom', 'section', 'endSection', 'extend', 'suppressed', 'thickness', 'color', 'style')) {
                Assert-Equal $actual[$property] $original[$property] "$language $name $property"
            }
        }

        $pdfPath = Join-Path $outputPath ("direction-$language.pdf")
        $report.ExportToDisk([CrystalDecisions.Shared.ExportFormatType]::PortableDocFormat, $pdfPath)
        $pdf = [IO.File]::ReadAllBytes($pdfPath)
        Assert-Equal ([Text.Encoding]::ASCII.GetString($pdf, 0, 5)) '%PDF-' "$language PDF signature"
        $results += [ordered]@{ language = $language; pageContentWidth = $width; before = $before; after = $after
            pdfFile = [IO.Path]::GetFileName($pdfPath); pdfBytes = $pdf.Length }
    }
    finally {
        $report.Close()
        $report.Dispose()
        Assert-Equal (Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash $sourceHash 'Original RPT hash'
    }
}

[ordered]@{ status = 'Passed'; sourceSha256 = $sourceHash; sourceSaved = $false
    runtimeSha256 = (Get-FileHash -LiteralPath $runtimePath -Algorithm SHA256).Hash; languages = $results
} | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $outputPath 'native-direction.json') -Encoding UTF8
Write-Output 'Native direction passed: AR/EN endpoints, cross-section attachment, visibility, style and PDF export; source hash unchanged.'

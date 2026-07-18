param(
  [string]$TargetRoot = "D:\AIPROJECTS\MV-OPERATING-SYSTEM"
)

$Source = Split-Path -Parent $MyInvocation.MyCommand.Path
$Target = Join-Path $TargetRoot "volumes\volume-02-design"

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $Target) | Out-Null

if (Test-Path $Target) {
  $Backup = "$Target.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
  Copy-Item $Target $Backup -Recurse -Force
  Write-Host "Existing Volume 02 backed up to $Backup"
}

Copy-Item $Source $Target -Recurse -Force
Write-Host "Volume 02 installed at $Target"
Write-Host ""
Write-Host "Next commands:"
Write-Host "cd $TargetRoot"
Write-Host "claude"

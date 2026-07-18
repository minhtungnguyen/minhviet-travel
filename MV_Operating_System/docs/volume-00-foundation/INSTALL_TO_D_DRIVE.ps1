param(
    [string]$TargetRoot = "D:\AIPROJECTS\MINH-VIET-TRAVEL-PLATFORM"
)

$Source = Split-Path -Parent $MyInvocation.MyCommand.Path
$Target = Join-Path $TargetRoot "docs\volume-00-foundation"

New-Item -ItemType Directory -Path $Target -Force | Out-Null
Copy-Item -Path (Join-Path $Source "*") -Destination $Target -Recurse -Force

Write-Host "Installed Volume 00 to: $Target" -ForegroundColor Green
Write-Host "Next: open Claude Code at $TargetRoot and use prompts\claude-startup.md" -ForegroundColor Cyan

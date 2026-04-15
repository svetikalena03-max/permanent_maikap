$ErrorActionPreference = "Stop"

$taskName = "PermanentMaikapTelegramRelay"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$startScript = Join-Path $projectRoot "start-relay.ps1"

if (-not (Test-Path $startScript)) {
  throw "Missing file start-relay.ps1"
}

$currentUser = "$env:USERDOMAIN\$env:USERNAME"
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$startScript`""
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $currentUser
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description "Autostart local Telegram relay for website leads" -Force | Out-Null

Write-Host "Autostart task created: $taskName"

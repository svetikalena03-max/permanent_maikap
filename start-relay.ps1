$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
  Write-Error "Node.js не найден в PATH. Установите Node.js 18+."
}

& $nodeCmd.Source "$projectRoot\local-bot-relay.mjs"

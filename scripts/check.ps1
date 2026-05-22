$ErrorActionPreference = "Stop"

Write-Host "Validando JavaScript..."
Get-ChildItem -Path "src/main/resources/static/assets/js" -Recurse -Filter "*.js" | ForEach-Object {
    node --check $_.FullName
    Write-Host "ok $($_.FullName)"
}

$localMaven = "C:\tmp\apache-maven-3.9.11\bin\mvn.cmd"

if (Get-Command mvn -ErrorAction SilentlyContinue) {
    Write-Host "Rodando testes backend..."
    mvn test
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Host "Gerando package..."
    mvn -DskipTests package
    exit $LASTEXITCODE
} elseif (Test-Path -LiteralPath $localMaven) {
    Write-Host "Rodando testes backend com Maven local..."
    & $localMaven test
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Host "Gerando package com Maven local..."
    & $localMaven -DskipTests package
    exit $LASTEXITCODE
} else {
    Write-Host "Maven nao encontrado; validacao Java pulada."
}

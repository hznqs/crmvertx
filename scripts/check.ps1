$ErrorActionPreference = "Stop"

$localMaven = "C:\tmp\apache-maven-3.9.11\bin\mvn.cmd"
$mavenArgs = @("-Dmaven.resources.skip=true")

if (Test-Path -LiteralPath "frontend/package.json") {
    Write-Host "Validando frontend Next.js..."
    Push-Location "frontend"
    try {
        npm run typecheck
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        npm run lint
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        npm run test
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        npm run build
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        npm audit --audit-level=moderate
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    } finally {
        Pop-Location
    }
}

if (Get-Command mvn -ErrorAction SilentlyContinue) {
    Write-Host "Rodando testes backend..."
    mvn @mavenArgs test
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Host "Gerando package..."
    mvn -DskipTests package
    exit $LASTEXITCODE
} elseif (Test-Path -LiteralPath $localMaven) {
    Write-Host "Rodando testes backend com Maven local..."
    & $localMaven @mavenArgs test
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Host "Gerando package com Maven local..."
    & $localMaven -DskipTests package
    exit $LASTEXITCODE
} else {
    Write-Host "Maven nao encontrado; validacao Java pulada."
}

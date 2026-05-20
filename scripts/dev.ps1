$ErrorActionPreference = "Stop"

$localMaven = "C:\tmp\apache-maven-3.9.11\bin\mvn.cmd"

if (Get-Command mvn -ErrorAction SilentlyContinue) {
    mvn spring-boot:run
    exit $LASTEXITCODE
}

if (Test-Path -LiteralPath $localMaven) {
    & $localMaven spring-boot:run
    exit $LASTEXITCODE
}

throw "Maven nao encontrado. Baixe o Maven ou coloque o executavel em C:\tmp\apache-maven-3.9.11\bin\mvn.cmd."

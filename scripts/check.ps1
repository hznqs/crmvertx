$ErrorActionPreference = "Stop"

Write-Host "Validando JavaScript..."
node -e "const fs=require('fs'); for (const file of ['src/main/resources/static/assets/js/config/tailwind.config.js','src/main/resources/static/assets/js/core/auth.js','src/main/resources/static/assets/js/core/api.js','src/main/resources/static/assets/js/pages/login.js','src/main/resources/static/assets/js/pages/crm.js']) { new Function(fs.readFileSync(file,'utf8')); console.log('ok', file); }"

$localMaven = "C:\tmp\apache-maven-3.9.11\bin\mvn.cmd"

if (Get-Command mvn -ErrorAction SilentlyContinue) {
    Write-Host "Compilando backend..."
    mvn -q -DskipTests compile
    exit $LASTEXITCODE
} elseif (Test-Path -LiteralPath $localMaven) {
    Write-Host "Compilando backend com Maven local..."
    & $localMaven -q -DskipTests compile
    exit $LASTEXITCODE
} else {
    Write-Host "Maven nao encontrado; compile Java pulado."
}

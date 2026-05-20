param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"

function Import-EnvFile {
    param([string]$Path)

    if (!(Test-Path -LiteralPath $Path)) {
        return
    }

    Get-Content -LiteralPath $Path | ForEach-Object {
        $line = $_.Trim()
        if ($line.Length -eq 0 -or $line.StartsWith("#") -or !$line.Contains("=")) {
            return
        }

        $name, $value = $line.Split("=", 2)
        $name = $name.Trim()
        $value = $value.Trim().Trim('"').Trim("'")
        if ($name) {
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

function Convert-ToJdbcUrl {
    param([string]$DatabaseUrl)

    $rawUrl = $DatabaseUrl -replace "^jdbc:", ""
    $uri = [System.Uri]$rawUrl
    $builder = "jdbc:postgresql://$($uri.Host)"

    if (!$uri.IsDefaultPort) {
        $builder += ":$($uri.Port)"
    }

    $path = if ($uri.AbsolutePath) { $uri.AbsolutePath } else { "/postgres" }
    $builder += $path

    $query = $uri.Query.TrimStart("?")
    if ([string]::IsNullOrWhiteSpace($query)) {
        $builder += "?sslmode=require"
    } elseif ($query -notmatch "(^|&)sslmode=") {
        $builder += "?$query&sslmode=require"
    } else {
        $builder += "?$query"
    }

    return $builder
}

function Get-DbCredential {
    param([string]$DatabaseUrl)

    $rawUrl = $DatabaseUrl -replace "^jdbc:", ""
    $uri = [System.Uri]$rawUrl
    if ([string]::IsNullOrWhiteSpace($uri.UserInfo)) {
        return @{ User = ""; Password = "" }
    }

    $parts = $uri.UserInfo.Split(":", 2)
    $user = [System.Uri]::UnescapeDataString($parts[0])
    $password = if ($parts.Length -gt 1) { [System.Uri]::UnescapeDataString($parts[1]) } else { "" }
    return @{ User = $user; Password = $password }
}

if (!$Force) {
    Write-Host "Este comando atualiza a tabela flyway_schema_history para aceitar os checksums locais atuais."
    Write-Host "Use apenas depois de confirmar que V1 e V2 representam o schema que ja existe no banco."
    $answer = Read-Host "Digite REPARAR para continuar"
    if ($answer -ne "REPARAR") {
        Write-Host "Operacao cancelada."
        exit 1
    }
}

Import-EnvFile ".env"

if ([string]::IsNullOrWhiteSpace($env:DATABASE_URL)) {
    throw "DATABASE_URL nao encontrada no .env ou no ambiente."
}

$maven = if (Get-Command mvn -ErrorAction SilentlyContinue) {
    "mvn"
} elseif (Test-Path -LiteralPath "C:\tmp\apache-maven-3.9.11\bin\mvn.cmd") {
    "C:\tmp\apache-maven-3.9.11\bin\mvn.cmd"
} else {
    throw "Maven nao encontrado."
}

$jdbcUrl = Convert-ToJdbcUrl $env:DATABASE_URL
$credential = Get-DbCredential $env:DATABASE_URL

& $maven -q flyway:repair `
    "-Dflyway.url=$jdbcUrl" `
    "-Dflyway.user=$($credential.User)" `
    "-Dflyway.password=$($credential.Password)" `
    "-Dflyway.locations=filesystem:src/main/resources/db/migration"

Write-Host "Flyway repair concluido. Rode .\scripts\dev.ps1 novamente."

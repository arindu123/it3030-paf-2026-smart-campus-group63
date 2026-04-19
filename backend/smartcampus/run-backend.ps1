param(
    [int]$Port = 8089,
    [ValidateSet("shared")]
    [string]$Profile = "shared",
    [string]$DbUrl = "jdbc:mysql://localhost:3306/smartcampusdb?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Colombo",
    [string]$DbUsername = "smartcampus_user",
    [string]$DbPassword = "StrongPass123!",
    [string]$GoogleClientId = $env:GOOGLE_CLIENT_ID,
    [string]$GoogleClientSecret = $env:GOOGLE_CLIENT_SECRET,
    [string]$GithubClientId = $env:GITHUB_CLIENT_ID,
    [string]$GithubClientSecret = $env:GITHUB_CLIENT_SECRET,
    [switch]$UseEnvDbCredentials,
    [switch]$RestartIfRunning
)

if ($UseEnvDbCredentials) {
    if (-not [string]::IsNullOrWhiteSpace($env:DB_URL)) {
        $DbUrl = $env:DB_URL
    }
    if (-not [string]::IsNullOrWhiteSpace($env:DB_USERNAME)) {
        $DbUsername = $env:DB_USERNAME
    }
    if (-not [string]::IsNullOrWhiteSpace($env:DB_PASSWORD)) {
        $DbPassword = $env:DB_PASSWORD
    }
} elseif (
    -not [string]::IsNullOrWhiteSpace($env:DB_URL) -or
    -not [string]::IsNullOrWhiteSpace($env:DB_USERNAME) -or
    -not [string]::IsNullOrWhiteSpace($env:DB_PASSWORD)
) {
    Write-Host "Ignoring existing DB_URL/DB_USERNAME/DB_PASSWORD from shell. Use -UseEnvDbCredentials to opt in."
}

$existingConnection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1

if ($existingConnection) {
    $existingPid = $existingConnection.OwningProcess
    if (-not $RestartIfRunning) {
        Write-Host "Backend is already running on port $Port (PID $existingPid)."
        Write-Host "Use -RestartIfRunning to stop and restart it."
        exit 0
    }

    Write-Host "Stopping existing process on port $Port (PID $existingPid)..."
    Stop-Process -Id $existingPid -Force
    Start-Sleep -Seconds 1
}

if ([string]::IsNullOrWhiteSpace($DbUsername)) {
    $DbUsername = "smartcampus_user"
}
if ([string]::IsNullOrWhiteSpace($DbPassword)) {
    $DbPassword = "StrongPass123!"
}
if ([string]::IsNullOrWhiteSpace($GithubClientId)) {
    $GithubClientId = "github-client-placeholder"
}
if ([string]::IsNullOrWhiteSpace($GithubClientSecret)) {
    $GithubClientSecret = "github-secret-placeholder"
}

$env:DB_URL = $DbUrl
$env:DB_USERNAME = $DbUsername
$env:DB_PASSWORD = $DbPassword

Write-Host "Starting Smart Campus backend on port $Port using profile '$Profile'..."
Write-Host "Database URL: $DbUrl"
Write-Host "Database user: $DbUsername"
$env:SERVER_PORT = "$Port"
$env:SPRING_PROFILES_ACTIVE = $Profile
$env:GOOGLE_CLIENT_ID = $GoogleClientId
$env:GOOGLE_CLIENT_SECRET = $GoogleClientSecret
$env:GITHUB_CLIENT_ID = $GithubClientId
$env:GITHUB_CLIENT_SECRET = $GithubClientSecret
& ".\mvnw.cmd" spring-boot:run

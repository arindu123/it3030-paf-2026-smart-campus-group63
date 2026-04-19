param(
    [int]$Port = 8089,
    [ValidateSet("shared")]
    [string]$Profile = "shared",
    [string]$DbUrl = "jdbc:mysql://localhost:3306/smartcampusdb?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Colombo",
    [string]$DbUsername = "smartcampus_user",
    [string]$DbPassword = "ChangeThisPassword",
    [string]$GoogleClientId = $env:GOOGLE_CLIENT_ID,
    [string]$GoogleClientSecret = $env:GOOGLE_CLIENT_SECRET,
    [switch]$RestartIfRunning
)

if (-not [string]::IsNullOrWhiteSpace($env:DB_URL)) {
    $DbUrl = $env:DB_URL
}
if (-not [string]::IsNullOrWhiteSpace($env:DB_USERNAME)) {
    $DbUsername = $env:DB_USERNAME
}
if (-not [string]::IsNullOrWhiteSpace($env:DB_PASSWORD)) {
    $DbPassword = $env:DB_PASSWORD
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
    $DbPassword = "ChangeThisPassword"
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
& ".\mvnw.cmd" spring-boot:run

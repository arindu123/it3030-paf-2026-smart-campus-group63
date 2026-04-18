param(
    [int]$Port = 8089,
    [ValidateSet("local", "shared")]
    [string]$Profile = "shared",
    [string]$DbUrl = "jdbc:mysql://localhost:3306/smartcampusdb?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Colombo",
    [string]$DbUsername = "smartcampus_user",
    [string]$DbPassword = "StrongPass123!",
    [string]$GoogleClientId = $env:GOOGLE_CLIENT_ID,
    [string]$GoogleClientSecret = $env:GOOGLE_CLIENT_SECRET
)

$existingConnection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1

if ($existingConnection) {
    $existingPid = $existingConnection.OwningProcess
    Write-Host "Stopping existing process on port $Port (PID $existingPid)..."
    Stop-Process -Id $existingPid -Force
    Start-Sleep -Seconds 1
}

Write-Host "Starting Smart Campus backend on port $Port using profile 'shared'..."
$env:SERVER_PORT = "$Port"
$env:SPRING_PROFILES_ACTIVE = "shared"
& ".\mvnw.cmd" spring-boot:run

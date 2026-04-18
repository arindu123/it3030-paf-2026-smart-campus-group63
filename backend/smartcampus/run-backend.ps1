param(
<<<<<<< Updated upstream
    [int]$Port = 8089
=======
    [int]$Port = 8089,
    [ValidateSet("local", "shared")]
    [string]$Profile = "shared",
    [string]$DbUrl = "jdbc:mysql://localhost:3306/smartcampusdb?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Colombo",
    [string]$DbUsername = "smartcampus_user",
    [string]$DbPassword = "StrongPass123!"
>>>>>>> Stashed changes
)

$existingConnection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1

if ($existingConnection) {
    $existingPid = $existingConnection.OwningProcess
    Write-Host "Stopping existing process on port $Port (PID $existingPid)..."
    Stop-Process -Id $existingPid -Force
    Start-Sleep -Seconds 1
}

<<<<<<< Updated upstream
Write-Host "Starting Smart Campus backend on port $Port..."
=======
Write-Host "Starting Smart Campus backend on port $Port using profile '$Profile'..."
$env:SERVER_PORT = "$Port"
$env:SPRING_PROFILES_ACTIVE = $Profile
$env:DB_URL = $DbUrl
$env:DB_USERNAME = $DbUsername
$env:DB_PASSWORD = $DbPassword
>>>>>>> Stashed changes
& ".\mvnw.cmd" spring-boot:run

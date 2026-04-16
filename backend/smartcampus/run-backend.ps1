param(
    [int]$Port = 8089,
    [ValidateSet("local", "shared")]
    [string]$Profile = "local"
)

$existingConnection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1

if ($existingConnection) {
    $existingPid = $existingConnection.OwningProcess
    Write-Host "Stopping existing process on port $Port (PID $existingPid)..."
    Stop-Process -Id $existingPid -Force
    Start-Sleep -Seconds 1
}

Write-Host "Starting Smart Campus backend on port $Port using profile '$Profile'..."
$env:SERVER_PORT = "$Port"
$env:SPRING_PROFILES_ACTIVE = $Profile
& ".\mvnw.cmd" spring-boot:run

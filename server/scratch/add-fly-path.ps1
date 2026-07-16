$flyPath = "$env:LOCALAPPDATA\fly"
$currentPath = [System.Environment]::GetEnvironmentVariable('PATH', 'User')
if ($currentPath -notlike "*$flyPath*") {
    [System.Environment]::SetEnvironmentVariable('PATH', "$flyPath;$currentPath", 'User')
    Write-Host "PATH updated: flyctl added permanently"
} else {
    Write-Host "flyctl already in PATH"
}

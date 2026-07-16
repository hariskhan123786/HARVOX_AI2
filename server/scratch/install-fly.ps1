$r = Invoke-RestMethod 'https://api.github.com/repos/superfly/flyctl/releases/latest'
$url = ($r.assets | Where-Object { $_.name -like '*Windows_x86_64.zip' }).browser_download_url
Write-Host "Download URL: $url"
New-Item -ItemType Directory -Force -Path "$env:LOCALAPPDATA\fly" | Out-Null
Invoke-WebRequest -Uri $url -OutFile "$env:TEMP\flyctl.zip"
Expand-Archive -Path "$env:TEMP\flyctl.zip" -DestinationPath "$env:LOCALAPPDATA\fly" -Force
$env:PATH = "$env:LOCALAPPDATA\fly;$env:PATH"
Write-Host "flyctl installed to $env:LOCALAPPDATA\fly"
& "$env:LOCALAPPDATA\fly\flyctl.exe" version

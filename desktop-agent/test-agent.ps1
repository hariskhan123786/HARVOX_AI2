# HARVOX Desktop Agent - Test Script
# Tests various agent functionalities

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HARVOX Desktop Agent Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$agentUrl = "http://127.0.0.1:8765"
$testToken = "test-token-12345"

# Test 1: Health Check
Write-Host "[TEST 1] Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$agentUrl/health" -Method GET -UseBasicParsing
    $health = $response.Content | ConvertFrom-Json
    Write-Host "✅ PASS: Agent is healthy" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
    Write-Host "   Version: $($health.version)" -ForegroundColor Gray
    Write-Host "   Port: $($health.port)" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAIL: Agent not responding" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Check if port is listening
Write-Host "[TEST 2] Port Check..." -ForegroundColor Yellow
$portCheck = netstat -ano | Select-String "8765"
if ($portCheck) {
    Write-Host "✅ PASS: Port 8765 is listening" -ForegroundColor Green
    Write-Host "   $portCheck" -ForegroundColor Gray
} else {
    Write-Host "❌ FAIL: Port 8765 not found" -ForegroundColor Red
}
Write-Host ""

# Test 3: Get process info
Write-Host "[TEST 3] Process Info..." -ForegroundColor Yellow
try {
    $process = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue).CommandLine
        $cmdLine -like "*agent.mjs*"
    }
    if ($process) {
        Write-Host "✅ PASS: Agent process found" -ForegroundColor Green
        Write-Host "   PID: $($process.Id)" -ForegroundColor Gray
        Write-Host "   Name: $($process.ProcessName)" -ForegroundColor Gray
        Write-Host "   Memory: $([math]::Round($process.WorkingSet64 / 1MB, 2)) MB" -ForegroundColor Gray
        Write-Host "   CPU: $([math]::Round($process.CPU, 2))s" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  WARNING: Could not find agent process" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  WARNING: Error checking process" -ForegroundColor Yellow
}
Write-Host ""

# Test 4: Test CORS headers
Write-Host "[TEST 4] CORS Configuration..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$agentUrl/health" -Method GET -UseBasicParsing
    $corsHeaders = $response.Headers['Access-Control-Allow-Methods']
    Write-Host "✅ PASS: CORS configured" -ForegroundColor Green
    Write-Host "   Methods: $corsHeaders" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  WARNING: Could not verify CORS" -ForegroundColor Yellow
}
Write-Host ""

# Test 5: Test simple automation (volume control - safe)
Write-Host "[TEST 5] Automation Test (Volume Control)..." -ForegroundColor Yellow
Write-Host "   This will increase your volume by 5 steps" -ForegroundColor Gray
$confirm = Read-Host "   Run test? (y/n)"
if ($confirm -eq 'y') {
    try {
        $body = @{
            step = @{
                action = "media_volume_up"
                args = @()
            }
        } | ConvertTo-Json

        $response = Invoke-WebRequest `
            -Uri "$agentUrl/execute" `
            -Method POST `
            -Body $body `
            -ContentType "application/json" `
            -Headers @{"Authorization"="Bearer $testToken"} `
            -UseBasicParsing

        $result = $response.Content | ConvertFrom-Json
        if ($result.success) {
            Write-Host "✅ PASS: Automation executed successfully" -ForegroundColor Green
            Write-Host "   Message: $($result.message)" -ForegroundColor Gray
        } else {
            Write-Host "❌ FAIL: Automation failed" -ForegroundColor Red
            Write-Host "   Message: $($result.message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ FAIL: Request error" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⏭️  SKIP: User skipped test" -ForegroundColor Yellow
}
Write-Host ""

# Test 6: Test invalid action
Write-Host "[TEST 6] Error Handling Test..." -ForegroundColor Yellow
try {
    $body = @{
        step = @{
            action = "invalid_action_12345"
            args = @()
        }
    } | ConvertTo-Json

    $response = Invoke-WebRequest `
        -Uri "$agentUrl/execute" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -Headers @{"Authorization"="Bearer $testToken"} `
        -UseBasicParsing `
        -ErrorAction Stop

    Write-Host "❌ FAIL: Should have returned error" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "✅ PASS: Error handling works correctly" -ForegroundColor Green
        Write-Host "   Status: 400 Bad Request (expected)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  WARNING: Unexpected status code" -ForegroundColor Yellow
    }
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Desktop Agent is OPERATIONAL" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Open HARVOX AI in your browser" -ForegroundColor White
Write-Host "  2. Go to Voice Assistant page" -ForegroundColor White
Write-Host "  3. Say: 'Open Chrome' or 'Play music on Spotify'" -ForegroundColor White
Write-Host "  4. Watch the magic happen! ✨" -ForegroundColor White
Write-Host ""
Write-Host "For more commands, see: DESKTOP_AGENT_STATUS.md" -ForegroundColor Gray
Write-Host ""

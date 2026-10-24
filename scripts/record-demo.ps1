# ==============================================================================
# scripts/record-demo.ps1 - Windows Screen Recording Helper
# ==============================================================================

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host " 🎬 HACKATHON DEMO RECORDER (Windows PowerShell)     " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

$outputDir = Join-Path $PSScriptRoot "..\presentation"
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$outputMp4 = Join-Path $outputDir "demo.mp4"
$outputGif = Join-Path $outputDir "demo.gif"

# Check for ffmpeg
$ffmpegCmd = Get-Command ffmpeg -ErrorAction SilentlyContinue

if (-not $ffmpegCmd) {
    Write-Host "[!] ffmpeg was not found on your system PATH." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Quick Options:" -ForegroundColor Cyan
    Write-Host "  1. Install via winget:   winget install Gyan.FFmpeg"
    Write-Host "  2. Built-in Screen Recorder (Zero Install):" -ForegroundColor Green
    Write-Host "     Press [Win + Alt + R] to record your screen using Xbox Game Bar."
    Write-Host "     Save your video file to: presentation/demo.mp4"
    Write-Host ""
    Exit 0
}

Write-Host "Prepare your browser window with your hackathon app." -ForegroundColor Yellow
Read-Host "Press [ENTER] to start recording"

Write-Host ""
Write-Host "● RECORDING IN PROGRESS..." -ForegroundColor Red
Write-Host "Press 'q' in this window to stop recording when finished.`n" -ForegroundColor Cyan

& ffmpeg -y -f gdigrab -framerate 30 -i desktop -c:v libx264 -pix_fmt yuv420p -preset ultrafast $outputMp4

if (Test-Path $outputMp4) {
    Write-Host "`n[✓] Saved demo video to: $outputMp4" -ForegroundColor Green
    
    # Mirror to pitch folder
    $pitchDir = Join-Path $PSScriptRoot "..\pitch"
    if (Test-Path $pitchDir) {
        Copy-Item -Path $outputMp4 -Destination (Join-Path $pitchDir "demo.mp4") -Force
    }

    Write-Host "[*] Generating backup GIF..." -ForegroundColor Cyan
    & ffmpeg -y -i $outputMp4 -vf "fps=10,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -t 15 $outputGif 2>$null
    if (Test-Path $outputGif) {
        Write-Host "[✓] Saved preview GIF to: $outputGif" -ForegroundColor Green
    }
}

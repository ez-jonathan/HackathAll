#!/usr/bin/env bash

# ==============================================================================
# scripts/record-demo.sh - Offline Demo Screen Recorder (MP4 + Backup GIF)
# ==============================================================================
# Cross-platform helper using ffmpeg to record a fail-safe screen demonstration.
# Generates:
#   - `presentation/demo.mp4` (1080p presentation backup)
#   - `presentation/demo.gif` (Quick animated preview for README / Devpost)
# ==============================================================================

set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}=====================================================${NC}"
echo -e "${CYAN} 🎬 HACKATHON DEMO RECORDER (record-demo.sh)          ${NC}"
echo -e "${CYAN}=====================================================${NC}\n"

# Ensure output folders exist
mkdir -p presentation pitch

OUTPUT_MP4="presentation/demo.mp4"
OUTPUT_GIF="presentation/demo.gif"

# Check if ffmpeg is available
if ! command -v ffmpeg &> /dev/null; then
  echo -e "${YELLOW}[!] ffmpeg is not currently installed on your system PATH.${NC}"
  echo -e "\n${CYAN}Quick Install Options:${NC}"
  echo "  • macOS:   brew install ffmpeg"
  echo "  • Windows: winget install Gyan.FFmpeg   (or choco install ffmpeg)"
  echo "  • Ubuntu:  sudo apt install -y ffmpeg"
  echo -e "\n${GREEN}Native Built-in Shortcuts (No Install Needed):${NC}"
  echo "  • Windows: Press Win + Alt + R (Xbox Game Bar Screen Capture)"
  echo "  • macOS:   Press Cmd + Shift + 5 (QuickTime Screen Recording)"
  echo -e "\nAfter recording, save your MP4 file to: ${OUTPUT_MP4}\n"
  exit 0
fi

# Detect Operating System & Select FFmpeg Screen Capture Device
OS="$(uname -s)"
case "${OS}" in
  Darwin*)
    echo -e "${GREEN}[*] macOS detected. Using avfoundation screen capture...${NC}"
    CAPTURE_ARGS="-f avfoundation -i 1:none -r 30"
    ;;
  Linux*)
    echo -e "${GREEN}[*] Linux detected. Using x11grab display :0.0...${NC}"
    DISPLAY_ENV="${DISPLAY:-:0.0}"
    CAPTURE_ARGS="-f x11grab -r 30 -s 1920x1080 -i ${DISPLAY_ENV}"
    ;;
  CYGWIN*|MINGW*|MSYS*|Windows_NT*)
    echo -e "${GREEN}[*] Windows environment detected. Using gdigrab desktop...${NC}"
    CAPTURE_ARGS="-f gdigrab -framerate 30 -i desktop"
    ;;
  *)
    echo -e "${YELLOW}[!] Unrecognized OS (${OS}). Falling back to gdigrab...${NC}"
    CAPTURE_ARGS="-f gdigrab -framerate 30 -i desktop"
    ;;
esac

echo -e "${YELLOW}Prepare your browser demo window.${NC}"
read -rp "Press [ENTER] to start recording (or Ctrl+C to cancel)..."

echo -e "\n${RED}● RECORDING IN PROGRESS...${NC}"
echo -e "Press ${CYAN}'q'${NC} in this terminal or ${CYAN}Ctrl+C${NC} when your 3-minute demo is finished.\n"

# Run recording
ffmpeg -y ${CAPTURE_ARGS} \
  -c:v libx264 -pix_fmt yuv420p -preset ultrafast \
  "${OUTPUT_MP4}" || true

echo -e "\n${GREEN}[✓] Saved demo video:${NC} ${OUTPUT_MP4}"

# Also mirror to pitch/demo.mp4 for backward compatibility
cp "${OUTPUT_MP4}" "pitch/demo.mp4" 2>/dev/null || true

# Generate lightweight GIF preview
echo -e "${CYAN}[*] Generating optimized backup GIF for README...${NC}"
ffmpeg -y -i "${OUTPUT_MP4}" \
  -vf "fps=10,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
  -t 15 \
  "${OUTPUT_GIF}" 2>/dev/null || true

if [ -f "${OUTPUT_GIF}" ]; then
  echo -e "${GREEN}[✓] Saved demo preview GIF:${NC} ${OUTPUT_GIF}"
  cp "${OUTPUT_GIF}" "pitch/demo.gif" 2>/dev/null || true
fi

echo -e "\n${GREEN}${BOLD}✨ Demo recording successfully captured and ready for judging!${NC}\n"

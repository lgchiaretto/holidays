#!/bin/bash

# ==============================================================================
# build.sh - Build the container image for holidays-api
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DEFAULT_IMAGE="quay.io/chiaretto/holidays"
DEFAULT_TAG="latest"

# Parse arguments
IMAGE_REPO="${1:-$DEFAULT_IMAGE}"
IMAGE_TAG="${2:-$DEFAULT_TAG}"
FULL_IMAGE="${IMAGE_REPO}:${IMAGE_TAG}"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}    Holidays API - Container Build${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${YELLOW}Image:${NC} ${FULL_IMAGE}"
echo ""

# Check if podman is available, fallback to docker
if command -v podman &> /dev/null; then
    CONTAINER_CLI="podman"
elif command -v docker &> /dev/null; then
    CONTAINER_CLI="docker"
else
    echo -e "${RED}Error: Neither podman nor docker found. Please install one of them.${NC}"
    exit 1
fi

echo -e "${YELLOW}Using container CLI:${NC} ${CONTAINER_CLI}"
echo ""

# Build the image
echo -e "${YELLOW}Building container image...${NC}"
${CONTAINER_CLI} build -t "${FULL_IMAGE}" .

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}    Build completed successfully!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    echo -e "${YELLOW}Image:${NC} ${FULL_IMAGE}"
    echo ""
    echo -e "${YELLOW}To push the image:${NC}"
    echo "  ${CONTAINER_CLI} push ${FULL_IMAGE}"
    echo ""
    echo -e "${YELLOW}To run locally:${NC}"
    echo "  ${CONTAINER_CLI} run -d -p 3000:3000 --name holidays-api ${FULL_IMAGE}"
else
    echo -e "${RED}Build failed!${NC}"
    exit 1
fi

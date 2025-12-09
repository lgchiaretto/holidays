#!/bin/bash

# ==============================================================================
# build-and-deploy.sh - Build and deploy holidays-api to OpenShift
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
echo -e "${BLUE}    Holidays API - Build and Deploy${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${YELLOW}Image:${NC} ${FULL_IMAGE}"
echo ""

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if podman is available, fallback to docker
if command -v podman &> /dev/null; then
    CONTAINER_CLI="podman"
elif command -v docker &> /dev/null; then
    CONTAINER_CLI="docker"
else
    echo -e "${RED}Error: Neither podman nor docker found. Please install one of them.${NC}"
    exit 1
fi

# Check if oc is available
if ! command -v oc &> /dev/null; then
    echo -e "${RED}Error: OpenShift CLI (oc) not found. Please install it.${NC}"
    exit 1
fi

# Check if logged in to OpenShift
if ! oc whoami &> /dev/null; then
    echo -e "${RED}Error: Not logged in to OpenShift. Please run 'oc login' first.${NC}"
    exit 1
fi

echo -e "${YELLOW}Container CLI:${NC} ${CONTAINER_CLI}"
echo -e "${YELLOW}OpenShift user:${NC} $(oc whoami)"
echo -e "${YELLOW}OpenShift server:${NC} $(oc whoami --show-server)"
echo ""

# Step 1: Build the image
echo -e "${BLUE}Step 1/3: Building container image...${NC}"
echo ""
${CONTAINER_CLI} build -t "${FULL_IMAGE}" .

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Build completed successfully!${NC}"
echo ""

# Step 2: Push the image
echo -e "${BLUE}Step 2/3: Pushing container image...${NC}"
echo ""

# Login to registry if needed (for quay.io or other registries)
${CONTAINER_CLI} push "${FULL_IMAGE}"

if [ $? -ne 0 ]; then
    echo -e "${RED}Push failed! Make sure you are logged in to the container registry.${NC}"
    echo -e "${YELLOW}Try: ${CONTAINER_CLI} login ${IMAGE_REPO%%/*}${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Push completed successfully!${NC}"
echo ""

# Step 3: Deploy to OpenShift
echo -e "${BLUE}Step 3/3: Deploying to OpenShift...${NC}"
echo ""

"${SCRIPT_DIR}/deploy.sh" "${IMAGE_REPO}" "${IMAGE_TAG}"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}    Build and Deploy completed!${NC}"
    echo -e "${GREEN}============================================${NC}"
else
    echo -e "${RED}Deployment failed!${NC}"
    exit 1
fi

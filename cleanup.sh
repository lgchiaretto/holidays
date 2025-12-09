#!/bin/bash

# ==============================================================================
# cleanup.sh - Remove all holidays-api resources from OpenShift and local
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
NAMESPACE="holidays"

# Parse arguments
IMAGE_REPO="${1:-$DEFAULT_IMAGE}"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}    Holidays API - Cleanup${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Check for --force flag
FORCE=false
for arg in "$@"; do
    if [ "$arg" == "--force" ] || [ "$arg" == "-f" ]; then
        FORCE=true
    fi
done

if [ "$FORCE" != true ]; then
    echo -e "${YELLOW}This will remove ALL holidays-api resources.${NC}"
    echo ""
    echo "Resources to be deleted:"
    echo "  - OpenShift namespace: ${NAMESPACE} (and all resources within)"
    echo "  - Local container: holidays-api"
    echo "  - Local volume: holidays-data"
    echo "  - Local images: ${IMAGE_REPO}:*"
    echo ""
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Cleanup cancelled.${NC}"
        exit 0
    fi
fi

echo ""

# Determine container CLI
if command -v podman &> /dev/null; then
    CONTAINER_CLI="podman"
elif command -v docker &> /dev/null; then
    CONTAINER_CLI="docker"
else
    CONTAINER_CLI=""
fi

# ==============================================================================
# Clean up OpenShift resources
# ==============================================================================
echo -e "${YELLOW}Cleaning up OpenShift resources...${NC}"

if command -v oc &> /dev/null && oc whoami &> /dev/null 2>&1; then
    echo "  Deleting namespace ${NAMESPACE}..."
    oc delete namespace ${NAMESPACE} --ignore-not-found=true --wait=false || true
    
    # Wait for namespace to be deleted (with timeout)
    echo "  Waiting for namespace to be deleted..."
    TIMEOUT=60
    COUNTER=0
    while oc get namespace ${NAMESPACE} &> /dev/null && [ $COUNTER -lt $TIMEOUT ]; do
        sleep 2
        COUNTER=$((COUNTER + 2))
    done
    
    if [ $COUNTER -ge $TIMEOUT ]; then
        echo -e "${YELLOW}  Warning: Namespace deletion timed out. It may still be deleting in the background.${NC}"
    else
        echo -e "${GREEN}  OpenShift resources deleted.${NC}"
    fi
else
    echo -e "${YELLOW}  Skipping OpenShift cleanup (not logged in or oc not available).${NC}"
fi

echo ""

# ==============================================================================
# Clean up local container resources
# ==============================================================================
if [ -n "$CONTAINER_CLI" ]; then
    echo -e "${YELLOW}Cleaning up local container resources...${NC}"
    
    # Stop and remove container
    echo "  Stopping container holidays-api..."
    ${CONTAINER_CLI} stop holidays-api 2>/dev/null || true
    echo "  Removing container holidays-api..."
    ${CONTAINER_CLI} rm holidays-api 2>/dev/null || true
    
    # Remove volume
    echo "  Removing volume holidays-data..."
    ${CONTAINER_CLI} volume rm holidays-data 2>/dev/null || true
    
    # Remove images
    echo "  Removing images ${IMAGE_REPO}..."
    ${CONTAINER_CLI} rmi $(${CONTAINER_CLI} images -q "${IMAGE_REPO}" 2>/dev/null) 2>/dev/null || true
    
    echo -e "${GREEN}  Local container resources cleaned up.${NC}"
else
    echo -e "${YELLOW}No container CLI found. Skipping local cleanup.${NC}"
fi

echo ""

# ==============================================================================
# Clean up local data directory
# ==============================================================================
echo -e "${YELLOW}Cleaning up local data...${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="${SCRIPT_DIR}/data"

if [ -d "$DATA_DIR" ]; then
    echo "  Removing data directory..."
    rm -rf "$DATA_DIR"
    echo -e "${GREEN}  Data directory removed.${NC}"
else
    echo "  Data directory not found. Skipping."
fi

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}    Cleanup completed!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "All holidays-api resources have been removed."
echo ""
echo "To start fresh, run:"
echo "  ./build-and-deploy.sh [image-repo] [tag]"

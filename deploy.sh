#!/bin/bash

# ==============================================================================
# deploy.sh - Deploy holidays-api to OpenShift
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
NAMESPACE="holidays"

# Parse arguments
IMAGE_REPO="${1:-$DEFAULT_IMAGE}"
IMAGE_TAG="${2:-$DEFAULT_TAG}"
FULL_IMAGE="${IMAGE_REPO}:${IMAGE_TAG}"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}    Holidays API - OpenShift Deploy${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${YELLOW}Image:${NC} ${FULL_IMAGE}"
echo -e "${YELLOW}Namespace:${NC} ${NAMESPACE}"
echo ""

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

echo -e "${YELLOW}Connected to OpenShift as:${NC} $(oc whoami)"
echo -e "${YELLOW}Server:${NC} $(oc whoami --show-server)"
echo ""

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPENSHIFT_DIR="${SCRIPT_DIR}/openshift"

# Create namespace if it doesn't exist
echo -e "${YELLOW}Creating namespace...${NC}"
oc apply -f "${OPENSHIFT_DIR}/namespace.yaml" || true

# Wait for namespace to be ready
sleep 2

# Apply configurations
echo -e "${YELLOW}Applying ConfigMap...${NC}"
oc apply -f "${OPENSHIFT_DIR}/configmap.yaml"

echo -e "${YELLOW}Applying Secret...${NC}"
oc apply -f "${OPENSHIFT_DIR}/secret.yaml"

echo -e "${YELLOW}Creating PersistentVolumeClaim...${NC}"
oc apply -f "${OPENSHIFT_DIR}/pvc.yaml"

# Update deployment with correct image
echo -e "${YELLOW}Applying Deployment...${NC}"
sed "s|image: .*|image: ${FULL_IMAGE}|g" "${OPENSHIFT_DIR}/deployment.yaml" | oc apply -f -

echo -e "${YELLOW}Applying Service...${NC}"
oc apply -f "${OPENSHIFT_DIR}/service.yaml"

echo -e "${YELLOW}Applying Route...${NC}"
oc apply -f "${OPENSHIFT_DIR}/route.yaml"

# Wait for deployment to be ready
echo ""
echo -e "${YELLOW}Waiting for deployment to be ready...${NC}"
oc rollout status deployment/holidays-api -n ${NAMESPACE} --timeout=120s

# Get the route URL
ROUTE_URL=$(oc get route holidays-api -n ${NAMESPACE} -o jsonpath='{.spec.host}' 2>/dev/null || echo "")

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}    Deployment completed successfully!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
if [ -n "${ROUTE_URL}" ]; then
    echo -e "${YELLOW}Application URL:${NC} https://${ROUTE_URL}"
    echo -e "${YELLOW}API Documentation:${NC} https://${ROUTE_URL}/api-docs"
    echo -e "${YELLOW}Health Check:${NC} https://${ROUTE_URL}/api/health"
fi
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  oc get pods -n ${NAMESPACE}"
echo "  oc logs -f deployment/holidays-api -n ${NAMESPACE}"
echo "  oc get route holidays-api -n ${NAMESPACE}"

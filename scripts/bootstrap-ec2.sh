#!/bin/bash
set -euo pipefail

# Non-interactive apt
export DEBIAN_FRONTEND=noninteractive

# Install prerequisites
apt-get update
apt-get install -y ca-certificates curl gnupg lsb-release git

mkdir -p /etc/apt/keyrings
if [ -f /etc/apt/keyrings/docker.gpg ]; then
  echo "Backing up existing /etc/apt/keyrings/docker.gpg"
  mv /etc/apt/keyrings/docker.gpg /etc/apt/keyrings/docker.gpg.bak.$(date -u +"%Y%m%dT%H%M%SZ") || true
fi
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker apt repository (expand command substitutions properly)
ARCH=$(dpkg --print-architecture)
CODENAME=$(lsb_release -cs)
cat > /etc/apt/sources.list.d/docker.list <<EOF
deb [arch=${ARCH} signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${CODENAME} stable
EOF

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add ubuntu user to docker group (assuming default user)
if id ubuntu &>/dev/null; then
  usermod -aG docker ubuntu || true
fi

# Clone repo (replace with your repo url if needed)
cd /home/ubuntu || exit
if [ ! -d photos ]; then
  sudo -u ubuntu git clone https://github.com/mrsprogrammer/photos.git photos
fi
cd photos || exit

# Start services
docker compose -f docker-compose.prod.yml up -d --build

# Done
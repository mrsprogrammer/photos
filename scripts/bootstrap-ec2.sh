#!/bin/bash
set -e

# Install Docker and Docker Compose
apt-get update
apt-get install -y ca-certificates curl gnupg lsb-release git
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \$(lsb_release -cs) stable\" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add ubuntu user to docker group (assuming default user)
usermod -aG docker ubuntu || true

# Clone repo (replace with your repo url if needed)
cd /home/ubuntu
if [ ! -d photos ]; then
  sudo -u ubuntu git clone https://github.com/mrsprogrammer/photos.git photos
fi
cd photos

# Start services
docker compose -f docker-compose.prod.yml up -d --build

# Done

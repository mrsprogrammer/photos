Deployment on EC2 (Ubuntu) - bootstrap guide

1) Prepare AWS
- Create an EC2 instance (Ubuntu 22.04 LTS recommended)
- Instance type: t3.small (or t3.medium if you expect more load)
- Security Group: open ports 22 (SSH), 80 (HTTP) or 3000/3002 if you want direct mapping (we use 3000/3002 in compose)
- Key pair: create or use existing key pair and download the private key

2) User data
- Add the script `scripts/bootstrap-ec2.sh` as user-data (or run it manually after SSH)

3) Manual steps (if not using user-data)
- SSH into instance: ssh -i yourkey.pem ubuntu@<EC2_IP>
- Run as root:
  sudo bash /home/ubuntu/photos/scripts/bootstrap-ec2.sh

4) Notes
- The script clones the repository from GitHub. If your repo is private, change the clone step to use your deploy key or add your SSH key to the instance.
- The script installs Docker and docker compose plugin and runs `docker compose -f docker-compose.prod.yml up -d --build`.
- `BACKEND_API_URL` is set in the compose file to `http://localhost:3002`. If you want it to be accessible externally you can change the value to `http://<EC2_IP>:3002` or place a reverse proxy (Nginx) in front.

5) Optional: Use Cloud-Init user-data to set TIMEZONE, LOCALE, or run additional scripts.

6) Optional: Use a domain and a reverse proxy (Nginx / Traefik) for TLS (LetsEncrypt). If you want I can add an Nginx service to the docker-compose and configure certbot.

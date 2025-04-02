# Deploying FinGenius on AWS EC2 with Nginx

This guide will walk you through deploying the FinGenius application on an AWS EC2 instance using Nginx as a web server.

## Prerequisites

1. An AWS account with an EC2 instance running
2. SSH access to your EC2 instance
3. A domain name (optional, but recommended)

## Step 1: Set Up Your EC2 Instance

1. Launch an EC2 instance with Ubuntu Server (recommended: t2.medium or larger)
2. Configure security groups to allow:
   - SSH (port 22)
   - HTTP (port 80)
   - HTTPS (port 443)
3. Connect to your instance via SSH:
   ```
   ssh -i your-key.pem ubuntu@your-instance-public-ip
   ```

## Step 2: Install Required Software

```bash
# Update package lists
sudo apt update
sudo apt upgrade -y

# Install Docker and Docker Compose
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu

# Install Nginx
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Install Git
sudo apt install -y git
```

## Step 3: Clone the Repository

```bash
# Create directory for the application
mkdir -p /home/ubuntu/fingenius
cd /home/ubuntu/fingenius

# Clone the repository
git clone https://github.com/maigenai/fingenius.git .
```

## Step 4: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the environment file with your settings
nano .env
```

Make sure to update:
- Database credentials
- API keys
- Production URLs
- Any other environment-specific settings

## Step 5: Build and Start the Application

```bash
# Build and start the containers
docker-compose up -d

# Check if containers are running
docker-compose ps
```

## Step 6: Configure Nginx as a Reverse Proxy

Create an Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/fingenius
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # Replace with your domain or server IP

    location / {
        proxy_pass http://localhost:3001;  # Frontend port
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:8000;  # Backend API port
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Additional configuration for WebSocket support if needed
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/fingenius /etc/nginx/sites-enabled/
sudo nginx -t  # Test the configuration
sudo systemctl restart nginx
```

## Step 7: Set Up SSL with Let's Encrypt (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain and install SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Certbot will modify your Nginx configuration automatically
# Test the configuration and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
```

## Step 8: Set Up Automatic Updates (Optional)

Create a script to pull updates and restart the application:

```bash
sudo nano /home/ubuntu/update-fingenius.sh
```

Add the following content:

```bash
#!/bin/bash
cd /home/ubuntu/fingenius
git pull
docker-compose down
docker-compose up -d
```

Make it executable:

```bash
sudo chmod +x /home/ubuntu/update-fingenius.sh
```

Set up a cron job to run it periodically (e.g., daily):

```bash
crontab -e
```

Add the following line:

```
0 2 * * * /home/ubuntu/update-fingenius.sh >> /home/ubuntu/update-fingenius.log 2>&1
```

## Step 9: Monitoring and Logs

View Docker container logs:

```bash
# View logs for all containers
docker-compose logs

# View logs for a specific service
docker-compose logs frontend
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f
```

View Nginx logs:

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

1. **Cannot connect to the application**:
   - Check if Docker containers are running: `docker-compose ps`
   - Verify Nginx configuration: `sudo nginx -t`
   - Check security group settings in AWS console

2. **Database connection issues**:
   - Verify environment variables in `.env`
   - Check if the database container is running: `docker ps`

3. **SSL certificate issues**:
   - Run Certbot again: `sudo certbot --nginx`
   - Check certificate expiration: `sudo certbot certificates`

4. **Application errors**:
   - Check application logs: `docker-compose logs`
   - Verify file permissions: `ls -la /home/ubuntu/fingenius`

## Backup Strategy

Set up regular backups of your database:

```bash
# Create a backup script
sudo nano /home/ubuntu/backup-fingenius.sh
```

Add the following content:

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/home/ubuntu/backups"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup the database
docker-compose exec -T postgres pg_dump -U postgres fingenius > $BACKUP_DIR/fingenius_$TIMESTAMP.sql

# Keep only the last 7 backups
ls -tp $BACKUP_DIR/*.sql | grep -v '/$' | tail -n +8 | xargs -I {} rm -- {}
```

Make it executable and set up a cron job:

```bash
sudo chmod +x /home/ubuntu/backup-fingenius.sh
crontab -e
```

Add the following line for daily backups:

```
0 3 * * * /home/ubuntu/backup-fingenius.sh >> /home/ubuntu/backup-fingenius.log 2>&1
```

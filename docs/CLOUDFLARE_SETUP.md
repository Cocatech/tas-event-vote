# Cloudflare Tunnel Setup for Docker

This guide explains how to set up Cloudflare Tunnel credentials for use with Docker.

## Prerequisites

- Cloudflare account with a registered domain
- Docker and Docker Compose installed
- `cloudflared` CLI tool (temporary, only for credential creation)

## Step 1: Install cloudflared CLI (Temporary)

### Windows
```powershell
# Using Scoop
scoop install cloudflare-wrangler

# Or download from: https://github.com/cloudflare/cloudflared/releases
```

### macOS
```bash
brew install cloudflare/cloudflare/cloudflared
```

### Linux
```bash
# Install via package manager or download from releases
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

## Step 2: Authenticate with Cloudflare

Run this command to authenticate:
```bash
cloudflared tunnel login
```

This will:
1. Open a browser window
2. Ask you to log in to Cloudflare
3. Select your domain
4. Save credentials to `~/.cloudflared/cert.pem`

## Step 3: Create a Tunnel

```bash
cloudflared tunnel create tas-event-vote
```

This will output:
```
Tunnel ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Tunnel name: tas-event-vote
Credentials location: /Users/username/.cloudflared/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.json
```

**Save these values!**

## Step 4: Extract Credentials

The tunnel credentials are in: `~/.cloudflared/<TUNNEL_ID>.json`

Copy this file and extract the values:

```bash
# Show the credentials file
cat ~/.cloudflared/<TUNNEL_ID>.json
```

You'll see something like:
```json
{
  "AccountTag": "account-id-12345",
  "TunnelSecret": "base64encodedsecret==",
  "TunnelID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "TunnelName": "tas-event-vote"
}
```

## Step 5: Update Files in Project

### 1. Update `cloudflare-credentials.json`

Replace the placeholder with actual values:

```json
{
  "AccountTag": "YOUR_ACCOUNT_ID",
  "TunnelSecret": "YOUR_TUNNEL_SECRET",
  "TunnelID": "YOUR_TUNNEL_ID",
  "TunnelName": "tas-event-vote"
}
```

### 2. Update `cloudflare-config.yml`

Replace `TUNNEL_ID_HERE` and `yourdomain.com`:

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /root/.cloudflared/cloudflare-credentials.json

ingress:
  - hostname: vote.yourdomain.com
    service: http://nginx:80
  - service: http://nginx:80
```

## Step 6: Add DNS Record

In Cloudflare Dashboard:
1. Go to your domain's DNS settings
2. Add CNAME record:
   - **Name**: vote (or subdomain you prefer)
   - **Target**: `<TUNNEL_ID>.cfargotunnel.com`
   - **Proxy status**: Proxied (orange cloud)
   - **TTL**: Auto

## Step 7: Start Docker Containers

```bash
docker compose up -d
```

Verify cloudflared is running:
```bash
docker compose logs cloudflared
```

You should see:
```
cloudflared | <timestamp> INF Registering tunnel connection
cloudflared | <timestamp> INF Connection registered
cloudflared | <timestamp> INF Serving Tunnel ID xxxxxxxx
```

## Step 8: Test Public Access

```bash
# Test from another machine or browser
curl https://vote.yourdomain.com/health

# Or open in browser
https://vote.yourdomain.com
```

## Troubleshooting

### Cloudflared container won't start
```bash
# Check logs
docker compose logs cloudflared

# Verify credentials file format
cat cloudflare-credentials.json | jq .
```

### "Invalid credentials"
- Ensure JSON file has correct values (no extra spaces/quotes)
- Check AccountTag and TunnelID match

### "Tunnel not found"
- Verify tunnel exists: `cloudflared tunnel list`
- Check TUNNEL_ID in both files matches

### DNS not resolving
- Wait a few minutes for DNS propagation
- Verify CNAME record in Cloudflare DNS settings
- Use `nslookup vote.yourdomain.com` to check

### Connection refused
- Check nginx container is running: `docker compose ps`
- Check nginx health: `docker compose logs nginx`
- Verify cloudflared is connected

## Security Notes

⚠️ **Important:**
1. **Never commit credentials to Git!**
   - Add to `.gitignore`: `cloudflare-credentials.json`
   - Store credentials securely

2. **Rotate credentials periodically**
   - Delete tunnel and create new one
   - Update credentials in Docker

3. **Use strong Cloudflare account passwords**
   - Enable 2FA on Cloudflare account

4. **Monitor tunnel activity**
   - Check Cloudflare Dashboard for any unusual traffic

## Files Reference

| File | Purpose | Should Commit |
|------|---------|-----------------|
| `Dockerfile.cloudflared` | Container image | ✅ Yes |
| `cloudflare-config.yml` | Tunnel config (template) | ✅ Yes |
| `cloudflare-credentials.json` | Credentials (template) | ❌ No |
| `docker-compose.yml` | Orchestration | ✅ Yes |

## Next Steps

After credentials are set up:
1. Run `docker compose up -d`
2. Wait for cloudflared to connect (30-60 seconds)
3. Access via https://vote.yourdomain.com
4. Monitor logs: `docker compose logs -f`

## Support

For issues with Cloudflare Tunnel:
- Cloudflare Docs: https://developers.cloudflare.com/cloudflare-one/
- GitHub Issues: https://github.com/cloudflare/cloudflared/issues

---

**Important**: The actual credentials file should NOT be committed to Git. Add it to `.gitignore` for security.

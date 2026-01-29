# Developer Commands Reference

Quick reference for all development commands in the Clash of Clanks project.

## 📦 Installation & Setup

```bash
# Initial setup
cd clash-of-clanks
npm install
cp .env.example .env

# Edit .env with your values
code .env
```

## 🏃 Development

```bash
# Start Next.js development server (port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## 🔨 Smart Contracts

```bash
# Compile contracts
npm run compile
npx hardhat compile

# Run tests
npm run test
npx hardhat test

# Run tests with coverage
npx hardhat coverage

# Clean build artifacts
npx hardhat clean
```

## 🚀 Deployment

```bash
# Deploy to Base Sepolia testnet
npm run deploy:testnet

# Deploy to Base mainnet
npm run deploy:mainnet

# Verify contracts on Basescan
npm run verify
npx hardhat verify --network base <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## 🧪 Testing Mini App Locally

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Expose with ngrok
npx ngrok http 3000

# Or with a specific subdomain (paid plan)
npx ngrok http 3000 --subdomain=clashofclanks

# Copy the ngrok URL and use it in Farcaster developer tools
```

## 🔐 Farcaster Developer Mode

```bash
# Enable developer mode (in browser):
# 1. Visit: https://farcaster.xyz/~/settings/developer-tools
# 2. Toggle "Developer Mode"
# 3. Access tools from left sidebar

# Or use this direct link:
open "https://farcaster.xyz/~/settings/developer-tools"
```

## 📱 Mini App Management

```bash
# Serve manifest for testing
npx serve public -p 3001

# Validate manifest.json
cat public/manifest.json | jq .

# Check Mini App SDK version
npm list @farcaster/miniapp-sdk
```

## 🎨 Asset Generation

```bash
# Create app icon (requires ImageMagick)
convert icon.png -resize 192x192 public/icon-192.png

# Create splash screen
convert splash.png -resize 1200x630 public/splash.png

# Create OG image
convert og.png -resize 1200x630 public/og-image.png
```

## 🐛 Debugging

```bash
# Check contract addresses
cat .env | grep ADDRESS

# View contract on Base Sepolia
open "https://sepolia.basescan.org/address/<CONTRACT_ADDRESS>"

# View contract on Base mainnet
open "https://basescan.org/address/<CONTRACT_ADDRESS>"

# Check gas estimation
npx hardhat run scripts/estimate-gas.ts --network base-sepolia

# Debug specific transaction
npx hardhat run scripts/debug-tx.ts --network base-sepolia
```

## 📊 Analytics & Monitoring

```bash
# Check contract events
npx hardhat run scripts/check-events.ts --network base

# Monitor battles
npx hardhat run scripts/monitor-battles.ts --network base

# Get platform stats
npx hardhat run scripts/get-stats.ts --network base
```

## 🔄 Git Commands

```bash
# Check status
git status

# View changes
git diff

# View commit history
git log --oneline -10

# Create new branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "Description of changes"

# Push to remote
git push origin main
```

## 🧹 Cleanup

```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clean build artifacts
rm -rf .next out build dist artifacts cache

# Reset to fresh state
npm run clean  # if defined
npx hardhat clean
```

## 📦 Package Management

```bash
# Add new dependency
npm install <package-name>

# Add dev dependency
npm install -D <package-name>

# Update dependencies
npm update

# Check outdated packages
npm outdated

# Audit security
npm audit
npm audit fix
```

## 🎯 Quick Actions

```bash
# Full rebuild
npm run clean && npm install && npm run compile && npm run dev

# Quick test
npm test

# Deploy and verify
npm run deploy:testnet && npm run verify

# Update manifest and test
code public/manifest.json
npx serve public -p 3001
```

## 📝 Documentation

```bash
# Generate contract documentation (if using docgen)
npx hardhat docgen

# View docs locally
cd docs
python3 -m http.server 8000
# Visit http://localhost:8000
```

## 🛠️ Hardhat Console

```bash
# Open Hardhat console (local network)
npx hardhat console

# Open Hardhat console (testnet)
npx hardhat console --network base-sepolia

# Example usage in console:
# > const Token = await ethers.getContractFactory("COCToken")
# > const token = await Token.attach("0x...")
# > const balance = await token.balanceOf("0x...")
```

## 🔍 Contract Interaction

```bash
# Call contract function (read)
npx hardhat run scripts/call-contract.ts --network base

# Send transaction (write)
npx hardhat run scripts/send-transaction.ts --network base

# Batch operations
npx hardhat run scripts/batch-operations.ts --network base
```

## 📤 Deployment Helpers

```bash
# Get deployer address
npx hardhat run scripts/get-deployer.ts

# Check balance
npx hardhat run scripts/check-balance.ts --network base-sepolia

# Fund account (testnet)
# Visit: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
```

## 🎮 Mini App Testing

```bash
# Test authentication
open "http://localhost:3000?fid=123456"

# Test with mock data
NEXT_PUBLIC_MOCK_MODE=true npm run dev

# Test wallet integration
# (Must be accessed through Farcaster client)
```

## 🔗 Useful Links

```bash
# Open project URLs
open "https://miniapps.farcaster.xyz/"                          # Mini Apps docs
open "https://farcaster.xyz/~/settings/developer-tools"         # Developer tools
open "https://basescan.org/"                                     # Base explorer
open "https://docs.base.org/"                                    # Base docs
open "https://hardhat.org/hardhat-runner/docs/getting-started"  # Hardhat docs
```

## 🚨 Emergency Commands

```bash
# Pause platform (if implemented)
npx hardhat run scripts/emergency-pause.ts --network base

# Unpause platform
npx hardhat run scripts/emergency-unpause.ts --network base

# Withdraw emergency funds
npx hardhat run scripts/emergency-withdraw.ts --network base
```

## 📊 Status Checks

```bash
# Check all contract addresses
cat .env | grep -E "(ADDRESS|CONTRACT)"

# Verify all contracts deployed
npx hardhat run scripts/verify-deployment.ts --network base

# Health check
npx hardhat run scripts/health-check.ts --network base

# Get system status
npx hardhat run scripts/system-status.ts --network base
```

## 💾 Backup & Restore

```bash
# Backup environment
cp .env .env.backup

# Backup artifacts
tar -czf artifacts-backup.tar.gz artifacts/

# Restore from backup
cp .env.backup .env
tar -xzf artifacts-backup.tar.gz
```

---

## 🎯 Common Workflows

### First Time Setup
```bash
git clone <repo>
cd clash-of-clanks
npm install
cp .env.example .env
# Edit .env
npm run compile
npm run dev
```

### Daily Development
```bash
git pull
npm install  # if package.json changed
npm run dev
# Make changes
npm test
git add .
git commit -m "Description"
git push
```

### Deploy to Testnet
```bash
npm run compile
npm run test
npm run deploy:testnet
# Update .env with addresses
npm run verify
```

### Deploy to Production
```bash
npm run build
npm run test
npm run deploy:mainnet
npm run verify
# Update public/manifest.json
# Deploy frontend to Vercel/Netlify
```

---

**Keep this reference handy during development! 🛠️**

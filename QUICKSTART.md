# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js 18+ and npm 9+
- Git
- A code editor (VS Code recommended)
- MetaMask or similar Web3 wallet

### Step 1: Installation

```bash
# Navigate to project
cd clash-of-clanks

# Install dependencies
npm install

# This will install:
# - Hardhat & smart contract tools
# - Next.js & React
# - Farcaster SDK
# - Testing libraries
```

### Step 2: Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Open .env and fill in:
# - Your private key (for deployment)
# - RPC URLs (Alchemy/Infura)
# - API keys
```

**⚠️ IMPORTANT**: Never commit your `.env` file!

### Step 3: Test Smart Contracts

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Expected output: All tests passing
```

### Step 4: Deploy to Testnet

```bash
# Deploy to Base Sepolia
npm run deploy:testnet

# Save the deployed contract addresses
# Update .env with new addresses
```

### Step 5: Run Frontend

```bash
# Start development server
npm run dev

# Open http://localhost:3000
# You should see the Clash of Clanks interface
```

## 📋 Project Structure

```
clash-of-clanks/
├── contracts/              # Smart contracts
│   ├── core/              # Battle & betting logic
│   ├── token/             # $COC token
│   ├── oracle/            # Price/metrics oracle
│   └── staking/           # Staking contracts
├── frame/                 # Farcaster Frame frontend
│   ├── app/              # Next.js pages
│   └── components/       # React components
├── scripts/              # Deployment scripts
├── docs/                 # Documentation
│   ├── PRD.md           # Product requirements
│   ├── ARCHITECTURE.md  # Technical docs
│   ├── API.md           # API reference
│   ├── USER_GUIDE.md    # User documentation
│   └── ROADMAP.md       # Development plan
├── hardhat.config.ts    # Hardhat configuration
├── next.config.js       # Next.js configuration
└── package.json         # Dependencies
```

## 🔑 Key Commands

### Development
```bash
npm run dev              # Start frontend dev server
npm run build           # Build for production
npm run start           # Start production server
```

### Smart Contracts
```bash
npm run compile         # Compile contracts
npm run test           # Run contract tests
npm run deploy:testnet # Deploy to Base Sepolia
npm run deploy:mainnet # Deploy to Base mainnet
npm run verify         # Verify on Basescan
```

## 🎮 Testing Locally

### 1. Start Local Blockchain
```bash
# In terminal 1
npx hardhat node
```

### 2. Deploy Contracts Locally
```bash
# In terminal 2
npx hardhat run scripts/deploy.ts --network localhost
```

### 3. Run Frontend
```bash
# In terminal 3
npm run dev
```

### 4. Connect MetaMask
- Network: Localhost:8545
- Chain ID: 31337
- Import test account from Hardhat output

## 📝 Common Tasks

### Create a Battle (Admin)
```javascript
const battleManager = await ethers.getContractAt("BattleManager", address);
await battleManager.createBattle(
  token1Address,
  token2Address,
  deployer1Address,
  deployer2Address,
  604800, // 7 days in seconds
  0, // Random theme
  true // Spotlight battle
);
```

### Place a Bet (User)
```javascript
const bettingPool = await ethers.getContractAt("BettingPool", address);
await cocToken.approve(bettingPoolAddress, amount);
await bettingPool.placeBet(
  battleId,
  checkpointIndex,
  predictedWinner,
  amount,
  1000 // 10x leverage
);
```

### Stake Tokens
```javascript
const stakingPool = await ethers.getContractAt("StakingPool", address);
await cocToken.approve(stakingPoolAddress, amount);
await stakingPool.stakeCOC(amount);
```

## 🐛 Troubleshooting

### Contract Compilation Fails
```bash
# Clean and rebuild
npx hardhat clean
npm run compile
```

### Frontend Not Loading
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

### Transaction Failing
- Check gas limits
- Verify contract addresses in .env
- Ensure wallet has enough ETH/COC
- Check network is correct (testnet vs mainnet)

### NFT Verification Failing
- Verify NFT contract address: `0x59df628ab3478e0A1E221c327BF6e08BD5D57B23`
- Ensure wallet holds NFT or 10M+ $COC
- Check network matches contract deployment

## 📚 Learning Resources

### Smart Contracts
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Solidity Docs](https://docs.soliditylang.org/)

### Frontend
- [Next.js Docs](https://nextjs.org/docs)
- [Farcaster SDK](https://docs.farcaster.xyz/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Base Blockchain
- [Base Docs](https://docs.base.org/)
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

## 🔐 Security Checklist

Before Mainnet:
- [ ] Smart contract audit completed
- [ ] All tests passing (90%+ coverage)
- [ ] Environment variables secured
- [ ] Multi-sig wallet configured
- [ ] Emergency pause tested
- [ ] Bug bounty program launched
- [ ] Insurance/reserve fund allocated

## 💬 Getting Help

### Documentation
1. Check `docs/` folder for detailed guides
2. Review `PROJECT_SUMMARY.md` for overview
3. Read contract comments in source code

### Community
- Farcaster: @clinkers
- GitHub Issues: Report bugs
- Developer Docs: `docs/API.md`

## 🎯 Next Steps

After initial setup:

1. **Week 1**: Complete smart contract development
2. **Week 2**: Implement advanced betting features
3. **Week 3**: Build staking UI
4. **Week 4**: End-to-end testing
5. **Week 9**: Security audit
6. **Week 12**: Mainnet launch! 🚀

## 📊 Development Checklist

### Smart Contracts
- [ ] COCToken deployed and verified
- [ ] BattleManager deployed and configured
- [ ] BettingPool deployed with correct fees
- [ ] StakingPool deployed and linked
- [ ] Oracle configured with Chainlink

### Frontend
- [ ] Wallet connection working
- [ ] Battle listing displays
- [ ] Betting interface functional
- [ ] Staking UI complete
- [ ] Mobile responsive

### Integration
- [ ] Contracts connected to frontend
- [ ] NFT verification working
- [ ] Token approval flows correct
- [ ] Transactions confirmed on-chain
- [ ] Events properly indexed

### Testing
- [ ] Unit tests: 90%+ coverage
- [ ] Integration tests: All flows
- [ ] E2E tests: Critical paths
- [ ] Load testing: 1000+ users
- [ ] Security testing: No critical issues

## 🎉 Ready to Build!

You now have everything you need to start developing Clash of Clanks:

✅ Complete smart contract suite  
✅ Farcaster Frame frontend  
✅ Comprehensive documentation  
✅ Deployment scripts ready  
✅ Testing framework set up  

**Let's build the future of token battles! ⚔️**

---

For detailed information, see:
- `README.md` - Project overview
- `docs/PRD.md` - Product requirements
- `docs/ROADMAP.md` - Development timeline
- `PROJECT_SUMMARY.md` - Complete summary

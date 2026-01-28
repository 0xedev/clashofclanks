# Clash of Clanks ($COC) 🎮⚔️

**A Farcaster-native prediction market game where Clanker tokens battle for supremacy**

## 🎯 Overview

Clash of Clanks is a gamified prediction market platform built on Farcaster where users bet on which newly deployed Clanker tokens will perform better across key metrics (market cap, volume, holder count, price appreciation). Winners take the pot, and platform revenue flows to stakers.

## ✨ Key Features

### 🔥 Battle System
- **Match Types**: Random matchmaking, direct challenges, or community voting
- **Battle Duration**: Up to 1 week with multiple prediction checkpoints
- **Prediction Lines**: 1 hour, 12 hours, Day 1, Day 1.5, Day 2... up to end of week
- **Themed Battles**: Wheel-based themes (Mini Apps, Memes, Banker Coins, Random)
- **Composite Scoring**: Market cap, volume, price appreciation, holder count

### 💰 Betting & Leverage
- **Currency**: $COC (Clash of Clanks) token - launched via Clanker
- **Leverage**: 10-50x multipliers for high-risk/high-reward plays
- **Minimum Bet**: $1 worth of $COC
- **No Pool Limits**: Unlimited pot growth
- **Early Cash Out**: Exit positions mid-battle with dynamic odds
- **Locked Bets**: Cannot change once placed (unless cashed out early)

### 💎 Access & NFT Integration
- **Existing NFT**: Integrates @clinkers NFT (0x59df628ab3478e0A1E221c327BF6e08BD5D57B23)
- **Entry Requirements**: 
  - Hold @clinkers NFT, OR
  - Hold minimum 10M $COC tokens
- **NFT Perks**: Tiered boosts, multipliers, in-app credits
- **Upgradeable**: Higher tier = more boosts

### 📊 Revenue Distribution
- **80%**: Winner's pool
- **10%**: Token deployers
- **5%**: Platform fees
- **5%**: Stakers

### 🎁 Staking System
- **Stake**: $COC tokens or @clinkers NFTs
- **Rewards**: 5% of all betting pools + platform fees
- **Governance**: Voting power for battle selections
- **Airdrops**: Regular rewards from platform revenue

### 🚀 Boosting Services (Pay-to-Win Elements)
- **$1**: Likes & recasts
- **$5**: Quote casts
- **$10**: Full hype posts
- **Daily Auctions**: Special boost packages

### 📈 Token Deployment
- **New Tokens Only**: Focus on newly deployed bangers
- **Deploy Methods**: Via Clash of Clanks app or external (same day)
- **Matchmaking**: Platform matches deployers OR deployers find opponents
- **Existing Tokens**: Future feature with separate mechanics (TBD)

## 🏗️ Technical Stack

- **Platform**: Farcaster Frame/Mini-app
- **Blockchain**: Base (native to Farcaster ecosystem)
- **Oracle**: Automated on-chain oracle (Chainlink or similar)
- **Smart Contracts**: Solidity
- **Frontend**: Next.js/React with Farcaster SDK
- **Token Standard**: ERC-20 ($COC)
- **NFT Standard**: ERC-721 (existing @clinkers NFT)

## 🎮 User Flow

1. User opens app on Farcaster
2. Views spotlight battle or active battles
3. Selects battle to participate in
4. Reviews prediction lines and odds
5. Places bet with optional leverage
6. Monitors battle progress
7. Collects winnings or exits early

## 📁 Repository Structure

```
clash-of-clanks/
├── contracts/           # Smart contracts (Solidity)
│   ├── core/           # Core battle & betting logic
│   ├── token/          # $COC token contract
│   ├── oracle/         # Oracle integration
│   └── staking/        # Staking mechanisms
├── frame/              # Farcaster Frame frontend
│   ├── app/           # Next.js app router
│   ├── components/    # React components
│   └── lib/           # Utilities & helpers
├── api/                # Backend API services
├── scripts/            # Deployment & automation scripts
└── docs/              # Documentation
```

## 🔧 Development Phases

### Phase 1: Core Infrastructure
- [ ] Smart contract development
- [ ] $COC token deployment via Clanker
- [ ] Oracle integration
- [ ] Basic battle creation

### Phase 2: Farcaster Integration
- [ ] Frame development
- [ ] NFT verification system
- [ ] Betting interface
- [ ] Leverage system

### Phase 3: Advanced Features
- [ ] Staking mechanism
- [ ] Boosting services
- [ ] Themed battle wheels
- [ ] Early cash-out system

### Phase 4: Platform Features
- [ ] Daily auctions
- [ ] Governance voting
- [ ] Analytics dashboard
- [ ] Revenue tracking

## 💡 Revenue Model

1. **5% Platform Fees**: From every betting pool
2. **Boosting Services**: Pay-per-boost revenue stream
3. **NFT Upgrades**: One-time and recurring upgrade fees
4. **Daily Auctions**: Premium boost auctions

## 🎯 Success Metrics

- Daily Active Users (DAU)
- Total Value Locked (TVL) in battles
- Battle creation rate
- Betting volume
- Staker rewards distributed
- Platform revenue

## 🛡️ Risk Management

- **Leverage Payouts**: Hybrid pool + platform liquidity reserve
- **Oracle Security**: Multiple data sources with verification
- **Smart Contract Audits**: Before mainnet launch
- **Emergency Pause**: Circuit breakers for critical issues

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run development server
npm run dev

# Deploy contracts (testnet)
npm run deploy:testnet
```

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## 📞 Contact

- **Farcaster**: @clinkers
- **Platform**: Clash of Clanks
- **Token**: $COC (deployed via Clanker)

---

**Built with 🔥 for the Farcaster community**

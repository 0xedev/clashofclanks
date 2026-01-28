# Technical Architecture

## System Overview

Clash of Clanks is a decentralized prediction market built on Base blockchain with Farcaster integration. The platform allows users to bet on newly deployed Clanker token battles using leverage.

## Architecture Components

### Smart Contracts Layer

#### 1. COCToken.sol
- **Purpose**: Native ERC-20 token for platform
- **Features**:
  - Burnable supply
  - Trading restrictions (can be enabled/disabled)
  - Exemption system for platform contracts
  - Max supply cap: 1 billion tokens

#### 2. BattleManager.sol
- **Purpose**: Core battle orchestration
- **Features**:
  - Battle creation and lifecycle management
  - Checkpoint system (1h, 12h, Day 1, Day 1.5, Day 2, Final)
  - Theme-based battles (Random, MiniApp, Meme, Banker)
  - Access control (NFT or token holdings)
  - Oracle integration for result settlement

#### 3. BettingPool.sol
- **Purpose**: Handles all betting operations
- **Features**:
  - Place bets with 1x-50x leverage
  - Pool-based payout system
  - Early cash-out mechanism (10% penalty)
  - Platform reserve for leverage payouts
  - Fee distribution (80% winners, 10% deployers, 5% platform, 5% stakers)

#### 4. StakingPool.sol
- **Purpose**: Staking mechanism for governance and rewards
- **Features**:
  - Stake $COC tokens or @clinkers NFTs
  - Time-based reward accumulation
  - Voting power allocation
  - 2x rewards for NFT holders
  - Reward claiming system

#### 5. TokenMetricsOracle.sol
- **Purpose**: Fetch real-time token metrics
- **Features**:
  - Chainlink integration for automated updates
  - Composite scoring system
  - Manual override for emergencies
  - Weighted metrics: Market cap (40%), Volume (30%), Holders (20%), Price (10%)

### Frontend Layer

#### Farcaster Frame (Next.js 14)
- **Framework**: Next.js with App Router
- **Styling**: Tailwind CSS
- **Features**:
  - Battle listing with real-time updates
  - Betting interface with leverage selection
  - User portfolio tracking
  - Staking dashboard
  - NFT verification

### Data Flow

```
User Action → Farcaster Frame → Smart Contract → Oracle (if needed) → State Update → UI Refresh
```

## Revenue Model

### Revenue Streams
1. **Platform Fees**: 5% of each betting pool
2. **Boosting Services**:
   - Likes/Recasts: $1
   - Quote casts: $5
   - Hype posts: $10
3. **NFT Upgrades**: Tiered upgrade system
4. **Daily Auctions**: Special boost packages

### Revenue Distribution
- **80%**: Winner pool
- **10%**: Token deployers
- **5%**: Platform operations
- **5%**: Staker rewards

## Security Considerations

### Smart Contract Security
- ReentrancyGuard on all state-changing functions
- Access control with Ownable pattern
- Emergency pause mechanisms
- Rate limiting on oracle updates
- Maximum leverage caps

### Frontend Security
- Input validation
- Rate limiting
- CORS configuration
- Environment variable protection

## Scalability

### On-Chain
- Gas-optimized contracts
- Batch operations where possible
- Event-driven architecture
- Off-chain computation for complex calculations

### Off-Chain
- Caching layer for frequently accessed data
- Indexed events for historical data
- Optimistic UI updates

## Integration Points

### External Services
1. **Chainlink**: Price feeds and token metrics
2. **DexScreener API**: Token data aggregation
3. **Farcaster Hub**: User authentication and social features
4. **Base RPC**: Blockchain interaction

### Contract Interactions
```
BattleManager ←→ BettingPool
     ↓              ↓
Oracle         StakingPool
     ↓
TokenMetricsOracle
```

## Deployment Pipeline

1. **Development**: Hardhat local network
2. **Testing**: Base Sepolia testnet
3. **Staging**: Base Sepolia with production config
4. **Production**: Base mainnet

## Monitoring & Analytics

### On-Chain Metrics
- Total Value Locked (TVL)
- Active battles count
- Betting volume
- Unique users
- Revenue generated

### Off-Chain Metrics
- User engagement
- Battle completion rate
- Average bet size
- Leverage usage distribution
- Cashout frequency

## Future Enhancements

### Phase 2 Features
- Mobile app (React Native)
- Advanced charting
- Social features (leaderboards, achievements)
- Governance voting
- Cross-chain support

### Phase 3 Features
- Existing token battles
- Multi-token battles (3+ tokens)
- Custom battle parameters
- API for third-party integrations

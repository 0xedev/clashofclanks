# Product Requirements Document (PRD)

## Product Vision

Clash of Clanks is a gamified prediction market that transforms token speculation into an engaging battle experience, where users bet on which newly deployed Clanker tokens will perform better across measurable metrics.

## Problem Statement

1. **Lack of Engagement**: Traditional token launches are passive experiences
2. **No Structured Competition**: Tokens launch in isolation without comparative context
3. **Limited Monetization**: Token deployers have few revenue opportunities post-launch
4. **Prediction Market Complexity**: Existing platforms are difficult for newcomers

## Solution

A Farcaster-native platform that:
- Gamifies token competition through "battles"
- Provides leverage-based betting for enhanced returns
- Creates sustainable revenue for all participants
- Simplifies prediction markets through intuitive UI

## Target Audience

### Primary Users
- **Degens**: High-risk traders seeking leverage opportunities
- **Token Deployers**: Creators wanting visibility and revenue
- **NFT Holders**: @clinkers NFT community members
- **Farcaster Users**: Active community members

### Secondary Users
- **Stakers**: Long-term holders seeking passive income
- **Spectators**: Non-betting viewers tracking battles

## Core Features

### MVP Features (Phase 1)

#### 1. Battle System
- **Priority**: P0 (Critical)
- **User Story**: As a user, I want to view active token battles so I can decide which to bet on
- **Acceptance Criteria**:
  - Display all active battles with token info
  - Show time remaining and total pool
  - Filter by theme (Random, Meme, MiniApp, Banker)
  - Spotlight featured battles

#### 2. Betting with Leverage
- **Priority**: P0 (Critical)
- **User Story**: As a user, I want to place leveraged bets so I can maximize returns
- **Acceptance Criteria**:
  - Minimum bet: $1 worth $COC
  - Leverage: 1x to 50x
  - Clear risk warnings for high leverage
  - Confirmation before submission

#### 3. Access Control
- **Priority**: P0 (Critical)
- **User Story**: As a platform, I need to verify user access to prevent spam
- **Acceptance Criteria**:
  - Check for @clinkers NFT ownership
  - Alternative: 10M $COC token holdings
  - Clear messaging for non-qualified users

#### 4. Staking System
- **Priority**: P0 (Critical)
- **User Story**: As a user, I want to stake tokens/NFTs to earn passive rewards
- **Acceptance Criteria**:
  - Stake/unstake $COC tokens
  - Stake/unstake NFTs
  - View pending rewards
  - Claim rewards anytime

#### 5. Checkpoint Betting
- **Priority**: P0 (Critical)
- **User Story**: As a user, I want to bet on multiple timeframes to diversify
- **Acceptance Criteria**:
  - 6 checkpoints per battle (1h, 12h, Day1, Day1.5, Day2, Final)
  - Independent betting lines for each
  - Clear odds display

### Phase 2 Features

#### 6. Early Cash Out
- **Priority**: P1 (Important)
- **User Story**: As a user, I want to exit my position early if market conditions change
- **Acceptance Criteria**:
  - 10% penalty on cash-out amount
  - Only available before battle completion
  - Clear penalty disclosure

#### 7. Boosting Services
- **Priority**: P1 (Important)
- **User Story**: As a deployer, I want to promote my token to increase visibility
- **Acceptance Criteria**:
  - Likes/Recasts: $1
  - Quote casts: $5
  - Hype posts: $10
  - Transparent delivery metrics

#### 8. Daily Auctions
- **Priority**: P2 (Nice to have)
- **User Story**: As a user, I want to bid on premium boosts
- **Acceptance Criteria**:
  - Daily auction listings
  - Transparent bidding process
  - Automatic winner notification

### Phase 3 Features

#### 9. Governance Voting
- **Priority**: P2 (Nice to have)
- **User Story**: As a staker, I want to vote on platform decisions
- **Acceptance Criteria**:
  - Voting power based on stake
  - Clear proposal descriptions
  - Transparent results

#### 10. Mobile App
- **Priority**: P2 (Nice to have)
- **User Story**: As a user, I want a native mobile experience
- **Acceptance Criteria**:
  - iOS and Android support
  - Push notifications
  - Biometric authentication

## User Flows

### Flow 1: First-Time User Betting
1. Open Farcaster frame
2. Connect wallet
3. System checks NFT/token holdings
4. If qualified: Browse battles
5. Select battle and checkpoint
6. Choose token and amount
7. Set leverage (optional)
8. Confirm and submit bet
9. Receive confirmation

### Flow 2: Claiming Winnings
1. Navigate to "My Bets"
2. View completed battles
3. See winning/losing bets
4. Click "Claim" on winning bet
5. Confirm transaction
6. Receive tokens

### Flow 3: Staking Flow
1. Go to Staking tab
2. Choose stake type (Token or NFT)
3. Enter amount / Select NFT
4. Approve transaction
5. Confirm stake
6. View updated balance and rewards

## Technical Requirements

### Performance
- Page load: < 2 seconds
- Transaction confirmation: < 30 seconds on Base
- Real-time updates: < 5 second latency
- Support: 1000+ concurrent users

### Security
- Smart contract audits before mainnet
- Multi-sig for admin functions
- Rate limiting on API endpoints
- Oracle redundancy

### Scalability
- Horizontal scaling for API
- Caching layer for frequently accessed data
- Event-driven architecture
- Indexed blockchain events

## Success Metrics

### Launch Metrics (Week 1)
- 500+ unique users
- 100+ active battles
- $100K+ TVL
- 1,000+ bets placed

### Growth Metrics (Month 1)
- 2,000+ unique users
- $500K+ TVL
- 50% user retention
- 10+ daily new battles

### Revenue Metrics
- $10K+ platform fees (Month 1)
- $5K+ boost revenue (Month 1)
- 25% month-over-month growth

### Engagement Metrics
- 10+ bets per user (average)
- 60%+ win rate satisfaction
- < 5% churn rate
- 3+ sessions per user per week

## Revenue Model

### Revenue Breakdown
| Source | Percentage | Notes |
|--------|------------|-------|
| Platform fees | 5% of pools | Recurring |
| Boosting services | Variable | Pay-per-use |
| NFT upgrades | One-time | Future feature |
| Daily auctions | Variable | Competitive bidding |

### Cost Structure
| Item | Monthly Cost | Notes |
|------|--------------|-------|
| Infrastructure | $500 | Hosting, RPC |
| Oracle fees | $300 | Chainlink calls |
| Marketing | $1,000 | Growth initiatives |
| Team | Variable | Based on development |

### Break-Even Analysis
- Break-even TVL: $200K (at 5% fees)
- Expected timeline: Month 2-3
- Assumes 100 battles/month avg pool $2K

## Competitive Analysis

### Direct Competitors
- **Polymarket**: Traditional prediction market, no leverage
- **PancakeSwap Prediction**: Binary options, limited themes
- **Azuro**: Sports betting focus

### Competitive Advantages
1. **Leverage**: 1x-50x multipliers (unique)
2. **Farcaster Native**: Built-in social distribution
3. **Theme Variety**: Specialized battle types
4. **Token Integration**: Native $COC utility
5. **NFT Benefits**: @clinkers integration

## Risks & Mitigation

### Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Smart contract bugs | High | Audits, bug bounty |
| Oracle failure | High | Fallback mechanisms |
| Scalability issues | Medium | Load testing, caching |

### Market Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Low adoption | High | Marketing, incentives |
| Regulatory concerns | Medium | Legal review |
| Competition | Medium | Unique features, quality |

### Financial Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Insufficient liquidity | High | Reserve fund, limits |
| High leverage losses | High | Risk warnings, caps |
| Token price volatility | Medium | Diversified revenue |

## Launch Plan

### Pre-Launch (Week -2)
- [ ] Smart contract audits
- [ ] Testnet deployment
- [ ] Community testing
- [ ] Marketing materials

### Launch Day
- [ ] Mainnet deployment
- [ ] Announce on Farcaster
- [ ] First spotlight battle
- [ ] Monitor systems

### Post-Launch (Week 1)
- [ ] Daily battles
- [ ] User support
- [ ] Bug fixes
- [ ] Analytics review

## Future Roadmap

### Q2 2026
- Mobile app development
- Governance implementation
- Advanced analytics dashboard
- Partnership integrations

### Q3 2026
- Multi-chain support
- Existing token battles
- API for third parties
- Enhanced social features

### Q4 2026
- Tournament system
- Leaderboards & achievements
- Referral program
- Cross-platform expansion

## Appendix

### Glossary
- **Checkpoint**: Time-based prediction point in a battle
- **Leverage**: Multiplier applied to potential returns
- **Composite Score**: Weighted calculation of token performance
- **Spotlight Battle**: Featured battle with enhanced visibility

### References
- Client requirements document
- Technical architecture
- User research findings

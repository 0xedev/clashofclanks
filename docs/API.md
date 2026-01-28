# API Documentation

## REST API Endpoints

### Battles

#### GET /api/battles
Get list of active battles

**Response:**
```json
{
  "battles": [
    {
      "id": 1,
      "token1": {
        "address": "0x...",
        "name": "Token A",
        "symbol": "TKA"
      },
      "token2": {
        "address": "0x...",
        "name": "Token B",
        "symbol": "TKB"
      },
      "startTime": 1234567890,
      "endTime": 1234999890,
      "totalBets": "125000000000000000000000",
      "spotlightBattle": true,
      "theme": "Meme",
      "checkpoints": [...]
    }
  ]
}
```

#### GET /api/battles/:id
Get specific battle details

#### POST /api/battles/:id/bet
Place a bet on a battle

**Request:**
```json
{
  "checkpointIndex": 0,
  "predictedWinner": "0x...",
  "amount": "1000000000000000000",
  "leverage": 1000
}
```

### User

#### GET /api/user/:address
Get user profile and statistics

**Response:**
```json
{
  "address": "0x...",
  "hasNFT": true,
  "cocBalance": "10000000000000000000000",
  "totalBets": 15,
  "winRate": 0.6,
  "totalWinnings": "50000000000000000000000",
  "votingPower": 100
}
```

#### GET /api/user/:address/bets
Get user's betting history

### Staking

#### GET /api/staking/:address
Get user's staking information

**Response:**
```json
{
  "cocStaked": "5000000000000000000000",
  "nftsStaked": [123, 456],
  "pendingRewards": "100000000000000000000",
  "votingPower": 50,
  "lastClaimTime": 1234567890
}
```

#### POST /api/staking/stake
Stake tokens or NFTs

#### POST /api/staking/unstake
Unstake tokens or NFTs

#### POST /api/staking/claim
Claim rewards

### Metrics

#### GET /api/metrics/token/:address
Get token metrics

**Response:**
```json
{
  "address": "0x...",
  "marketCap": 1000000,
  "volume24h": 250000,
  "holderCount": 1500,
  "priceUSD": 0.01,
  "compositeScore": 45000,
  "lastUpdate": 1234567890
}
```

## Smart Contract Functions

### BattleManager

#### createBattle
```solidity
function createBattle(
    address _token1,
    address _token2,
    address _deployer1,
    address _deployer2,
    uint256 _duration,
    BattleTheme _theme,
    bool _spotlightBattle
) external onlyOwner returns (uint256)
```

#### completeBattle
```solidity
function completeBattle(
    uint256 _battleId, 
    address _winner
) external
```

#### hasAccess
```solidity
function hasAccess(address _user) public view returns (bool)
```

### BettingPool

#### placeBet
```solidity
function placeBet(
    uint256 _battleId,
    uint256 _checkpointIndex,
    address _predictedWinner,
    uint256 _amount,
    uint256 _leverage
) external nonReentrant returns (uint256)
```

#### settleBet
```solidity
function settleBet(uint256 _betId) external nonReentrant
```

#### cashOutBet
```solidity
function cashOutBet(uint256 _betId) external nonReentrant
```

### StakingPool

#### stakeCOC
```solidity
function stakeCOC(uint256 _amount) external nonReentrant
```

#### unstakeCOC
```solidity
function unstakeCOC(uint256 _amount) external nonReentrant
```

#### stakeNFT
```solidity
function stakeNFT(uint256 _tokenId) external nonReentrant
```

#### claimRewards
```solidity
function claimRewards() external nonReentrant
```

### TokenMetricsOracle

#### requestMetrics
```solidity
function requestMetrics(address _token) external returns (bytes32)
```

#### compareTokens
```solidity
function compareTokens(
    address _token1,
    address _token2
) external view returns (address winner, uint256 score1, uint256 score2)
```

## Events

### BattleManager Events

```solidity
event BattleCreated(
    uint256 indexed battleId,
    address token1,
    address token2,
    address deployer1,
    address deployer2,
    uint256 startTime,
    uint256 endTime,
    BattleTheme theme
)

event BattleCompleted(uint256 indexed battleId, address winner)
```

### BettingPool Events

```solidity
event BetPlaced(
    uint256 indexed betId,
    uint256 indexed battleId,
    uint256 checkpointIndex,
    address indexed bettor,
    address predictedWinner,
    uint256 amount,
    uint256 leverage
)

event BetSettled(uint256 indexed betId, uint256 payout)
```

### StakingPool Events

```solidity
event COCStaked(address indexed user, uint256 amount)
event RewardsClaimed(address indexed user, uint256 amount)
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| E001 | "No access" | User doesn't hold NFT or minimum tokens |
| E002 | "Below min bet" | Bet amount below minimum |
| E003 | "Invalid leverage" | Leverage outside 1x-50x range |
| E004 | "Battle not active" | Battle is not in active state |
| E005 | "Already settled" | Bet has already been settled |
| E006 | "Insufficient stake" | User trying to unstake more than staked |

## Rate Limits

- API calls: 100 requests per minute per IP
- Contract calls: Limited by gas and block time
- Oracle updates: Maximum 1 per minute per token

## Webhooks (Future)

### Battle Completed
```json
{
  "event": "battle.completed",
  "battleId": 1,
  "winner": "0x...",
  "timestamp": 1234567890
}
```

### Bet Settled
```json
{
  "event": "bet.settled",
  "betId": 123,
  "user": "0x...",
  "payout": "5000000000000000000000"
}
```

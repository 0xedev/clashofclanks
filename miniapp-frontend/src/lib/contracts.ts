import { Contract } from "ethers";

export const ADDRESSES = {
  BATTLE_MANAGER: import.meta.env.VITE_BATTLE_MANAGER_ADDRESS || "",
  BETTING_POOL: import.meta.env.VITE_BETTING_POOL_ADDRESS || "",
  STAKING_POOL: import.meta.env.VITE_STAKING_POOL_ADDRESS || "",
  ORACLE: import.meta.env.VITE_ORACLE_ADDRESS || "",
  COC_TOKEN: import.meta.env.VITE_COC_TOKEN_ADDRESS || "",
};

export const ABIS = {
  BattleManager: [
    "function battles(uint256) view returns (uint256 id, address token1, address token2, address deployer1, address deployer2, uint256 startTime, uint256 endTime, uint8 status, uint8 theme, address winner, uint256 totalBets, bool spotlightBattle)",
    "function getActiveBattles() view returns (uint256[])",
    "function hasAccess(address user) view returns (bool)",
    "function completeBattle(uint256 battleId)",
  ],
  BettingPool: [
    "function placeBet(uint256 battleId, address predictedWinner, uint256 amount, uint256 leverage) returns (uint256)",
    "function settleBet(uint256 betId)",
    "function cashOutBet(uint256 betId)",
    "function getUserBets(address user) view returns (uint256[])",
    "function bets(uint256) view returns (uint256 battleId, address bettor, address predictedWinner, uint256 amount, uint256 leverage, uint256 timestamp, bool settled, bool cashedOut, bool liquidated)",
  ],
  StakingPool: [
    "function stakeCOC(uint256 amount)",
    "function unstakeCOC(uint256 amount)",
    "function claimRewards()",
    "function getPendingRewards(address user) view returns (uint256)",
  ],
  TokenMetricsOracle: [
    "function submitBatchMetrics(address[] tokens, uint256[] volumeUSD24h, uint256[] priceUSD, uint256[] liquidityUSD, uint256[] txCount24h)",
    "function compareTokens(address token1, address token2) view returns (address winner, uint256 score1, uint256 score2)",
    "function tokenMetrics(address) view returns (uint256 volumeUSD24h, uint256 priceUSD, uint256 liquidityUSD, uint256 txCount24h, uint256 timestamp)",
  ],
  ERC20: [
    "function balanceOf(address) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
  ],
};

export function getBattleManagerContract(provider: any) {
  return new Contract(ADDRESSES.BATTLE_MANAGER, ABIS.BattleManager, provider);
}

export function getBettingPoolContract(provider: any) {
  return new Contract(ADDRESSES.BETTING_POOL, ABIS.BettingPool, provider);
}

export function getStakingPoolContract(provider: any) {
  return new Contract(ADDRESSES.STAKING_POOL, ABIS.StakingPool, provider);
}

export function getOracleContract(provider: any) {
  return new Contract(ADDRESSES.ORACLE, ABIS.TokenMetricsOracle, provider);
}

export function getCOCTokenContract(provider: any) {
  return new Contract(ADDRESSES.COC_TOKEN, ABIS.ERC20, provider);
}

export function getERC20Contract(address: string, provider: any) {
  return new Contract(address, ABIS.ERC20, provider);
}

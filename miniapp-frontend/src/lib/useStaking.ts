import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useAccount, useSendCalls } from "wagmi";
import {
  getStakingPoolContract,
  getCOCTokenContract,
  ADDRESSES,
  ABIS,
} from "./contracts";

interface StakeInfo {
  amount: string;
  timestamp: bigint;
  lastClaimTime: bigint;
  votingPower: string;
}

interface NFTStakeInfo {
  tokenId: string;
  timestamp: bigint;
  lastClaimTime: bigint;
  votingPower: string;
}

interface StakingState {
  // COC staking
  cocStaked: string;
  pendingRewards: string;
  votingPower: string;

  // NFT staking
  nftStaked: NFTStakeInfo[];

  // Loading states
  loading: boolean;
  loadingRewards: boolean;
  loadingVotingPower: boolean;

  // Errors
  error: string | null;
}

export function useStaking() {
  const { address } = useAccount();
  const { sendCallsAsync } = useSendCalls();
  const [state, setState] = useState<StakingState>({
    cocStaked: "0",
    pendingRewards: "0",
    votingPower: "0",
    nftStaked: [],
    loading: true,
    loadingRewards: false,
    loadingVotingPower: false,
    error: null,
  });

  // Fetch staking data
  const fetchStakingData = useCallback(async () => {
    if (!address) return;

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
      const stakingContract = getStakingPoolContract(provider);

      // Get COC stake info
      const stakeInfo = await stakingContract.stakes(address);
      const cocAmount = ethers.formatEther(stakeInfo.amount);

      // Get pending rewards
      const rewards = await stakingContract.getPendingRewards(address);
      const rewardsAmount = ethers.formatEther(rewards);

      // Get voting power
      const vp = await stakingContract.getVotingPower(address);
      const vpAmount = vp.toString();

      setState((prev) => ({
        ...prev,
        cocStaked: cocAmount,
        pendingRewards: rewardsAmount,
        votingPower: vpAmount,
        loading: false,
      }));
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch staking data";
      setState((prev) => ({ ...prev, error: errorMsg, loading: false }));
      console.error("Staking fetch error:", err);
    }
  }, [address]);

  // Refresh data periodically
  useEffect(() => {
    fetchStakingData();
    const interval = setInterval(fetchStakingData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchStakingData]);

  // Stake COC tokens
  const stakeCOC = useCallback(
    async (amount: string) => {
      try {
        if (!address) throw new Error("Wallet not connected");
        if (!amount || parseFloat(amount) <= 0)
          throw new Error("Invalid amount");

        const amountWei = ethers.parseEther(amount);
        const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
        const cocContract = getCOCTokenContract(provider);
        const stakingContract = getStakingPoolContract(provider);

        // Check allowance
        const allowance = await cocContract.allowance(
          address,
          ADDRESSES.STAKING_POOL,
        );

        const calls = [];

        // Add approve call if needed
        if (allowance < amountWei) {
          calls.push({
            to: ADDRESSES.COC_TOKEN as `0x${string}`,
            data: cocContract.interface.encodeFunctionData("approve", [
              ADDRESSES.STAKING_POOL,
              amountWei,
            ]) as `0x${string}`,
          });
        }

        // Add stake call
        calls.push({
          to: ADDRESSES.STAKING_POOL as `0x${string}`,
          data: stakingContract.interface.encodeFunctionData("stakeCOC", [
            amountWei,
          ]) as `0x${string}`,
        });

        // Execute batch transaction
        await sendCallsAsync({ calls });

        // Refresh data
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await fetchStakingData();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to stake";
        setState((prev) => ({ ...prev, error: errorMsg }));
        console.error("Stake error:", err);
        throw err;
      }
    },
    [address, sendCallsAsync, fetchStakingData],
  );

  // Unstake COC tokens
  const unstakeCOC = useCallback(
    async (amount: string) => {
      try {
        if (!address) throw new Error("Wallet not connected");
        if (!amount || parseFloat(amount) <= 0)
          throw new Error("Invalid amount");

        const amountWei = ethers.parseEther(amount);
        const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
        const stakingContract = getStakingPoolContract(provider);

        const txData = stakingContract.interface.encodeFunctionData(
          "unstakeCOC",
          [amountWei],
        );

        await sendCallsAsync({
          calls: [
            {
              to: ADDRESSES.STAKING_POOL as `0x${string}`,
              data: txData as `0x${string}`,
            },
          ],
        });

        // Refresh data
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await fetchStakingData();
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to unstake";
        setState((prev) => ({ ...prev, error: errorMsg }));
        console.error("Unstake error:", err);
        throw err;
      }
    },
    [address, sendCallsAsync, fetchStakingData],
  );

  // Claim rewards
  const claimRewards = useCallback(async () => {
    try {
      if (!address) throw new Error("Wallet not connected");

      const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
      const stakingContract = getStakingPoolContract(provider);

      const txData = stakingContract.interface.encodeFunctionData(
        "claimRewards",
        [],
      );

      await sendCallsAsync({
        calls: [
          {
            to: ADDRESSES.STAKING_POOL as `0x${string}`,
            data: txData as `0x${string}`,
          },
        ],
      });

      // Refresh data
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await fetchStakingData();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to claim rewards";
      setState((prev) => ({ ...prev, error: errorMsg }));
      console.error("Claim error:", err);
      throw err;
    }
  }, [address, sendCallsAsync, fetchStakingData]);

  // Stake NFT
  const stakeNFT = useCallback(
    async (tokenId: string) => {
      try {
        if (!address) throw new Error("Wallet not connected");

        const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
        const stakingContract = getStakingPoolContract(provider);

        const nftContract = new ethers.Contract(
          ADDRESSES.COC_TOKEN, // TODO: Replace with actual NFT address
          ["function approve(address to, uint256 tokenId)"],
          provider,
        );

        const calls = [];

        // Add NFT approval
        calls.push({
          to: ADDRESSES.COC_TOKEN as `0x${string}`, // TODO: Replace with actual NFT address
          data: nftContract.interface.encodeFunctionData("approve", [
            ADDRESSES.STAKING_POOL,
            tokenId,
          ]) as `0x${string}`,
        });

        // Add stake NFT call
        calls.push({
          to: ADDRESSES.STAKING_POOL as `0x${string}`,
          data: stakingContract.interface.encodeFunctionData("stakeNFT", [
            tokenId,
          ]) as `0x${string}`,
        });

        await sendCallsAsync({ calls });

        // Refresh data
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await fetchStakingData();
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to stake NFT";
        setState((prev) => ({ ...prev, error: errorMsg }));
        console.error("NFT stake error:", err);
        throw err;
      }
    },
    [address, sendCallsAsync, fetchStakingData],
  );

  // Unstake NFT
  const unstakeNFT = useCallback(
    async (tokenId: string) => {
      try {
        if (!address) throw new Error("Wallet not connected");

        const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
        const stakingContract = getStakingPoolContract(provider);

        const txData = stakingContract.interface.encodeFunctionData(
          "unstakeNFT",
          [tokenId],
        );

        await sendCallsAsync({
          calls: [
            {
              to: ADDRESSES.STAKING_POOL as `0x${string}`,
              data: txData as `0x${string}`,
            },
          ],
        });

        // Refresh data
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await fetchStakingData();
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to unstake NFT";
        setState((prev) => ({ ...prev, error: errorMsg }));
        console.error("NFT unstake error:", err);
        throw err;
      }
    },
    [address, sendCallsAsync, fetchStakingData],
  );

  return {
    ...state,
    stakeCOC,
    unstakeCOC,
    claimRewards,
    stakeNFT,
    unstakeNFT,
    refreshData: fetchStakingData,
    clearError: () => setState((prev) => ({ ...prev, error: null })),
  };
}

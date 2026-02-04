import { useState, useCallback } from "react";
import { encodeFunctionData, parseUnits, formatUnits } from "viem";
import { useAccount, useSendCalls, useReadContract } from "wagmi";
import { ADDRESSES, ABIS } from "./contracts";

interface StakingState {
  loading: boolean;
  error: string | null;
}

export const useStaking = () => {
  const { address } = useAccount();
  const { sendCallsAsync } = useSendCalls();
  const [state, setState] = useState<StakingState>({
    loading: false,
    error: null,
  });

  // Read COC stake info
  const { data: stakeInfo, refetch: refetchStake } = useReadContract({
    address: ADDRESSES.STAKING_POOL as `0x${string}`,
    abi: ABIS.StakingPool,
    functionName: "stakes",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 30000, // 30s
    },
  });

  // Read pending rewards
  const { data: pendingRewards, refetch: refetchRewards } = useReadContract({
    address: ADDRESSES.STAKING_POOL as `0x${string}`,
    abi: ABIS.StakingPool,
    functionName: "getPendingRewards",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 30000,
    },
  });

  // Read voting power
  const { data: votingPower, refetch: refetchVotingPower } = useReadContract({
    address: ADDRESSES.STAKING_POOL as `0x${string}`,
    abi: ABIS.StakingPool,
    functionName: "getVotingPower",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 30000,
    },
  });

  // Read COC token allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: ADDRESSES.COC_TOKEN as `0x${string}`,
    abi: ABIS.ERC20,
    functionName: "allowance",
    args: address ? [address, ADDRESSES.STAKING_POOL] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const cocStaked = stakeInfo
    ? formatUnits((stakeInfo as any)[0] || 0n, 18)
    : "0";
  const rewards = pendingRewards
    ? formatUnits(pendingRewards as bigint, 18)
    : "0";
  const vp = votingPower ? (votingPower as bigint).toString() : "0";

  // Stake COC tokens
  const stakeCOC = useCallback(
    async (amount: string) => {
      try {
        if (!address) throw new Error("Wallet not connected");
        if (!amount || parseFloat(amount) <= 0)
          throw new Error("Invalid amount");

        setState({ loading: true, error: null });

        const amountWei = parseUnits(amount, 18);
        const currentAllowance = (allowance as bigint) || 0n;

        const calls = [];

        // Add approve call if needed
        if (currentAllowance < amountWei) {
          const approveData = encodeFunctionData({
            abi: ABIS.ERC20,
            functionName: "approve",
            args: [ADDRESSES.STAKING_POOL as `0x${string}`, amountWei],
          });

          calls.push({
            to: ADDRESSES.COC_TOKEN as `0x${string}`,
            data: approveData as `0x${string}`,
          });
        }

        // Add stake call
        const stakeData = encodeFunctionData({
          abi: ABIS.StakingPool,
          functionName: "stakeCOC",
          args: [amountWei],
        });

        calls.push({
          to: ADDRESSES.STAKING_POOL as `0x${string}`,
          data: stakeData as `0x${string}`,
        });

        await sendCallsAsync({ calls });

        // Refetch data
        await Promise.all([refetchStake(), refetchAllowance()]);

        setState({ loading: false, error: null });
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to stake COC";
        setState({ loading: false, error: errorMsg });
        throw err;
      }
    },
    [address, allowance, sendCallsAsync, refetchStake, refetchAllowance],
  );

  // Unstake COC tokens
  const unstakeCOC = useCallback(
    async (amount: string) => {
      try {
        if (!address) throw new Error("Wallet not connected");
        if (!amount || parseFloat(amount) <= 0)
          throw new Error("Invalid amount");

        setState({ loading: true, error: null });

        const amountWei = parseUnits(amount, 18);

        const unstakeData = encodeFunctionData({
          abi: ABIS.StakingPool,
          functionName: "unstakeCOC",
          args: [amountWei],
        });

        await sendCallsAsync({
          calls: [
            {
              to: ADDRESSES.STAKING_POOL as `0x${string}`,
              data: unstakeData as `0x${string}`,
            },
          ],
        });

        await refetchStake();
        setState({ loading: false, error: null });
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to unstake COC";
        setState({ loading: false, error: errorMsg });
        throw err;
      }
    },
    [address, sendCallsAsync, refetchStake],
  );

  // Claim rewards
  const claimRewards = useCallback(async () => {
    try {
      if (!address) throw new Error("Wallet not connected");

      setState({ loading: true, error: null });

      const claimData = encodeFunctionData({
        abi: ABIS.StakingPool,
        functionName: "claimRewards",
        args: [],
      });

      await sendCallsAsync({
        calls: [
          {
            to: ADDRESSES.STAKING_POOL as `0x${string}`,
            data: claimData as `0x${string}`,
          },
        ],
      });

      await Promise.all([refetchRewards(), refetchStake()]);
      setState({ loading: false, error: null });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to claim rewards";
      setState({ loading: false, error: errorMsg });
      throw err;
    }
  }, [address, sendCallsAsync, refetchRewards, refetchStake]);

  // Stake NFT
  const stakeNFT = useCallback(
    async (tokenId: string) => {
      try {
        if (!address) throw new Error("Wallet not connected");
        if (!tokenId) throw new Error("Invalid token ID");

        setState({ loading: true, error: null });

        // TODO: Check NFT approval and include approve call if needed
        const stakeNFTData = encodeFunctionData({
          abi: ABIS.StakingPool,
          functionName: "stakeNFT",
          args: [BigInt(tokenId)],
        });

        await sendCallsAsync({
          calls: [
            {
              to: ADDRESSES.STAKING_POOL as `0x${string}`,
              data: stakeNFTData as `0x${string}`,
            },
          ],
        });

        await refetchVotingPower();
        setState({ loading: false, error: null });
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to stake NFT";
        setState({ loading: false, error: errorMsg });
        throw err;
      }
    },
    [address, sendCallsAsync, refetchVotingPower],
  );

  // Unstake NFT
  const unstakeNFT = useCallback(
    async (tokenId: string) => {
      try {
        if (!address) throw new Error("Wallet not connected");
        if (!tokenId) throw new Error("Invalid token ID");

        setState({ loading: true, error: null });

        const unstakeNFTData = encodeFunctionData({
          abi: ABIS.StakingPool,
          functionName: "unstakeNFT",
          args: [BigInt(tokenId)],
        });

        await sendCallsAsync({
          calls: [
            {
              to: ADDRESSES.STAKING_POOL as `0x${string}`,
              data: unstakeNFTData as `0x${string}`,
            },
          ],
        });

        await refetchVotingPower();
        setState({ loading: false, error: null });
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to unstake NFT";
        setState({ loading: false, error: errorMsg });
        throw err;
      }
    },
    [address, sendCallsAsync, refetchVotingPower],
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    cocStaked,
    pendingRewards: rewards,
    votingPower: vp,
    loading: state.loading,
    error: state.error,
    stakeCOC,
    unstakeCOC,
    claimRewards,
    stakeNFT,
    unstakeNFT,
    clearError,
  };
};

# Batch Transaction Pattern (useSendCalls)

## Overview

This document describes the batch transaction pattern using wagmi's `useSendCalls` hook. This pattern eliminates the need for users to sign multiple transactions by batching them into a single atomic transaction.

## Why Use Batch Transactions?

### Problems with Sequential Transactions:

- ❌ Users must sign multiple transactions (poor UX)
- ❌ Gas inefficient (multiple transaction fees)
- ❌ Risk of partial execution (approve succeeds but stake fails)
- ❌ Slower execution time

### Benefits of Batch Transactions:

- ✅ Single transaction signature required
- ✅ Better gas efficiency
- ✅ Atomic execution (all or nothing)
- ✅ Improved user experience
- ✅ Faster overall execution

## Implementation Pattern

### 1. Import useSendCalls Hook

```typescript
import { useSendCalls } from "wagmi";

export function useContractInteraction() {
  const { sendCallsAsync } = useSendCalls();
  // ...
}
```

### 2. Basic Single Call Pattern

```typescript
const performAction = async () => {
  const contract = getContract(provider);

  const txData = contract.interface.encodeFunctionData("methodName", [
    param1,
    param2,
  ]);

  await sendCallsAsync({
    calls: [
      {
        to: CONTRACT_ADDRESS as `0x${string}`,
        data: txData as `0x${string}`,
      },
    ],
  });
};
```

### 3. Batch Multiple Calls Pattern

```typescript
const performBatchAction = async () => {
  const calls = [];

  // Call 1: Approve token
  calls.push({
    to: TOKEN_ADDRESS as `0x${string}`,
    data: tokenContract.interface.encodeFunctionData("approve", [
      SPENDER_ADDRESS,
      amount,
    ]) as `0x${string}`,
  });

  // Call 2: Execute main action
  calls.push({
    to: CONTRACT_ADDRESS as `0x${string}`,
    data: contract.interface.encodeFunctionData("stake", [
      amount,
    ]) as `0x${string}`,
  });

  // Execute all calls atomically
  await sendCallsAsync({ calls });
};
```

### 4. Conditional Batching Pattern

```typescript
const smartBatchAction = async (amount: string) => {
  const amountWei = ethers.parseEther(amount);
  const calls = [];

  // Check if approval is needed
  const currentAllowance = await tokenContract.allowance(
    userAddress,
    spenderAddress,
  );

  // Only add approval if necessary
  if (currentAllowance < amountWei) {
    calls.push({
      to: TOKEN_ADDRESS as `0x${string}`,
      data: tokenContract.interface.encodeFunctionData("approve", [
        SPENDER_ADDRESS,
        amountWei,
      ]) as `0x${string}`,
    });
  }

  // Always add the main action
  calls.push({
    to: CONTRACT_ADDRESS as `0x${string}`,
    data: contract.interface.encodeFunctionData("mainAction", [
      amountWei,
    ]) as `0x${string}`,
  });

  await sendCallsAsync({ calls });
};
```

## Real-World Examples

### Example 1: Staking with Approval

```typescript
// ❌ OLD WAY: Two separate transactions
const stakeOld = async (amount: string) => {
  // Transaction 1: User signs approve
  await sendTransaction({
    to: TOKEN_ADDRESS,
    data: encodeApprove(),
  });

  // Wait for confirmation...
  await waitForTransaction();

  // Transaction 2: User signs stake
  await sendTransaction({
    to: STAKING_ADDRESS,
    data: encodeStake(),
  });
};

// ✅ NEW WAY: Single batched transaction
const stakeNew = async (amount: string) => {
  await sendCallsAsync({
    calls: [
      { to: TOKEN_ADDRESS, data: encodeApprove() },
      { to: STAKING_ADDRESS, data: encodeStake() },
    ],
  });
};
```

### Example 2: Complex Multi-Step Operations

```typescript
// Compound action: Claim rewards + restake + vote
const claimAndRestake = async () => {
  await sendCallsAsync({
    calls: [
      // Step 1: Claim rewards
      {
        to: STAKING_ADDRESS as `0x${string}`,
        data: stakingContract.interface.encodeFunctionData("claimRewards", []),
      },
      // Step 2: Approve rewards for restaking
      {
        to: REWARD_TOKEN_ADDRESS as `0x${string}`,
        data: tokenContract.interface.encodeFunctionData("approve", [
          STAKING_ADDRESS,
          ethers.MaxUint256,
        ]),
      },
      // Step 3: Restake
      {
        to: STAKING_ADDRESS as `0x${string}`,
        data: stakingContract.interface.encodeFunctionData("stake", [
          claimedAmount,
        ]),
      },
      // Step 4: Vote on proposal
      {
        to: GOVERNANCE_ADDRESS as `0x${string}`,
        data: governanceContract.interface.encodeFunctionData("vote", [
          proposalId,
          voteChoice,
        ]),
      },
    ],
  });
};
```

### Example 3: NFT + Token Interactions

```typescript
// Stake NFT with token deposit
const stakeNFTWithTokens = async (nftId: string, tokenAmount: string) => {
  await sendCallsAsync({
    calls: [
      // Approve NFT
      {
        to: NFT_ADDRESS as `0x${string}`,
        data: nftContract.interface.encodeFunctionData("approve", [
          STAKING_ADDRESS,
          nftId,
        ]),
      },
      // Approve tokens
      {
        to: TOKEN_ADDRESS as `0x${string}`,
        data: tokenContract.interface.encodeFunctionData("approve", [
          STAKING_ADDRESS,
          ethers.parseEther(tokenAmount),
        ]),
      },
      // Stake both
      {
        to: STAKING_ADDRESS as `0x${string}`,
        data: stakingContract.interface.encodeFunctionData("stakeWithNFT", [
          nftId,
          ethers.parseEther(tokenAmount),
        ]),
      },
    ],
  });
};
```

## Common Use Cases

### 1. Token Operations

- Approve + Transfer
- Approve + Stake
- Approve + Swap
- Approve + Deposit
- Claim + Restake

### 2. NFT Operations

- Approve NFT + Stake
- Approve NFT + List for sale
- Approve multiple NFTs + Batch transfer

### 3. DeFi Operations

- Approve + Add Liquidity
- Approve + Borrow
- Repay + Withdraw
- Claim + Compound

### 4. Governance

- Stake + Delegate voting power
- Vote + Execute proposal
- Create proposal + Initial vote

## Best Practices

### 1. Check Allowances First

```typescript
const calls = [];
const allowance = await checkAllowance();

// Only add approval if needed
if (allowance < requiredAmount) {
  calls.push(approveCall);
}

calls.push(mainCall);
await sendCallsAsync({ calls });
```

### 2. Handle Errors Gracefully

```typescript
try {
  await sendCallsAsync({ calls });
  showSuccess("Transaction completed!");
} catch (err) {
  if (err.message.includes("rejected")) {
    showError("Transaction cancelled by user");
  } else {
    showError("Transaction failed: " + err.message);
  }
}
```

### 3. Provide Loading States

```typescript
const [isProcessing, setIsProcessing] = useState(false);

const executeBatch = async () => {
  setIsProcessing(true);
  try {
    await sendCallsAsync({ calls });
  } finally {
    setIsProcessing(false);
  }
};
```

### 4. Use Proper TypeScript Types

```typescript
// Always cast addresses and data to proper types
const call: { to: `0x${string}`; data: `0x${string}` } = {
  to: CONTRACT_ADDRESS as `0x${string}`,
  data: encodedData as `0x${string}`,
};
```

## Migration Checklist

When converting existing code to use batch transactions:

- [ ] Replace `import { useWallet }` with `import { useSendCalls }`
- [ ] Replace `const { sendTransaction }` with `const { sendCallsAsync }`
- [ ] Identify sequential transactions that can be batched
- [ ] Wrap each transaction in the calls array format
- [ ] Cast addresses and data to proper Hex types
- [ ] Remove intermediate `await` statements between related calls
- [ ] Update dependency arrays in useCallback
- [ ] Test with both single and multiple calls
- [ ] Verify error handling still works
- [ ] Update UI to show single transaction flow

## Performance Comparison

| Operation       | Old Method        | New Method    | Improvement       |
| --------------- | ----------------- | ------------- | ----------------- |
| Approve + Stake | 2 transactions    | 1 transaction | 50% fewer txs     |
| User signatures | 2 signatures      | 1 signature   | 50% less friction |
| Estimated time  | 30-60s            | 15-30s        | ~50% faster       |
| Gas efficiency  | 2x base fee       | 1x base fee   | ~50% gas savings  |
| Failure risk    | Partial execution | Atomic        | 100% safer        |

## Testing Recommendations

1. **Test with single calls** - Ensure basic functionality works
2. **Test with multiple calls** - Verify batching works correctly
3. **Test approval edge cases** - What if approval is already sufficient?
4. **Test error scenarios** - Insufficient balance, network issues, etc.
5. **Test user cancellation** - Verify proper cleanup when user rejects
6. **Test gas estimation** - Ensure batched calls don't exceed block gas limit

## Conclusion

The `useSendCalls` pattern should be the **default approach** for all contract interactions that involve:

- Token approvals
- Multiple related operations
- Sequential dependent transactions
- Operations requiring setup steps

This pattern provides a superior user experience and should be applied consistently across all contract interaction hooks in the application.

# Quick Reference: Using Batch Transactions

## Setup

```typescript
import { useSendCalls } from "wagmi";

const { sendCallsAsync } = useSendCalls();
```

## Single Transaction

```typescript
await sendCallsAsync({
  calls: [
    {
      to: CONTRACT_ADDRESS as `0x${string}`,
      data: contract.interface.encodeFunctionData("method", [
        args,
      ]) as `0x${string}`,
    },
  ],
});
```

## Batch Transaction (Approve + Action)

```typescript
const calls = [];

// Add approve if needed
if (needsApproval) {
  calls.push({
    to: TOKEN_ADDRESS as `0x${string}`,
    data: tokenContract.interface.encodeFunctionData("approve", [
      SPENDER_ADDRESS,
      amount,
    ]) as `0x${string}`,
  });
}

// Add main action
calls.push({
  to: CONTRACT_ADDRESS as `0x${string}`,
  data: contract.interface.encodeFunctionData("action", [
    amount,
  ]) as `0x${string}`,
});

// Execute atomically
await sendCallsAsync({ calls });
```

## Key Benefits

- ✅ Single user signature
- ✅ 50% faster execution
- ✅ Atomic (all-or-nothing)
- ✅ Better gas efficiency
- ✅ Superior UX

## Applied in Project

- `/lib/useStaking.ts` - All staking operations use batched calls
- See `/docs/BATCH_TRANSACTIONS.md` for comprehensive guide

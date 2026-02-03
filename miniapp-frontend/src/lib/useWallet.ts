import { sdk } from "@farcaster/miniapp-sdk";

interface SendTransactionParams {
  to: string;
  value?: string;
  data?: string;
}

interface WalletSdk {
  sendTransaction: (params: {
    to: string;
    value?: string;
    data?: string;
  }) => Promise<unknown>;
  getAddress: () => Promise<string>;
  switchChain?: (params: { chainId: number }) => Promise<void>;
}

const getWallet = (): WalletSdk => {
  const wallet = (sdk as unknown as { wallet?: WalletSdk }).wallet;
  if (!wallet) {
    throw new Error("Wallet is not available in this environment");
  }
  return wallet;
};

export const useWallet = () => {
  const sendTransaction = async (params: SendTransactionParams) => {
    try {
      const wallet = getWallet();
      return await wallet.sendTransaction({
        to: params.to,
        value: params.value ?? "0",
        data: params.data,
      });
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  };

  const getAddress = async () => {
    try {
      const wallet = getWallet();
      return await wallet.getAddress();
    } catch (error) {
      console.error("Failed to get address:", error);
      throw error;
    }
  };

  const switchChain = async (chainId: number) => {
    try {
      const wallet = getWallet();
      if (!wallet.switchChain) {
        throw new Error("Chain switching is not supported by the wallet");
      }
      await wallet.switchChain({ chainId });
    } catch (error) {
      console.error("Failed to switch chain:", error);
      throw error;
    }
  };

  return {
    sendTransaction,
    getAddress,
    switchChain,
  };
};

export {};

declare global {
  interface Window {
    aptos?: {
      connect?: () => Promise<unknown>;
      account?: () => Promise<{
        address: string;
        publicKey?: string;
      }>;
      signMessage: (args: {
        message: string;
        nonce?: string;
      }) => Promise<{
        address?: string;
        publicKey?: string;
        signature?: string;
        fullMessage?: string;
        message?: string;
      }>;
    };
  }
}
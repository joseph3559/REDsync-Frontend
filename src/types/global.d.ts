// Global type declarations for the frontend

interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    enable: () => Promise<any>;
    isMetaMask?: boolean;
    [key: string]: any;
  };
}


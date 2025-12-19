declare global {
  interface Window {
    pluginConfig: Record<string, any>;
    google: any;
  }
}

export {};

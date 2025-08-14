"use client";

import { useEffect } from 'react';

export default function MetaMaskErrorSuppressor() {
  useEffect(() => {
    // Override console.error to filter out MetaMask-related errors
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = function(...args: any[]) {
      const message = args.join(' ').toLowerCase();
      
      // Filter out MetaMask and Web3 related errors
      if (
        message.includes('metamask') ||
        message.includes('ethereum') ||
        message.includes('web3') ||
        message.includes('failed to connect to metamask') ||
        message.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn') ||
        message.includes('inpage.js')
      ) {
        return; // Suppress these errors
      }
      
      originalError.apply(console, args);
    };

    console.warn = function(...args: any[]) {
      const message = args.join(' ').toLowerCase();
      
      // Filter out MetaMask and Web3 related warnings
      if (
        message.includes('metamask') ||
        message.includes('ethereum') ||
        message.includes('web3')
      ) {
        return; // Suppress these warnings
      }
      
      originalWarn.apply(console, args);
    };

    // Prevent MetaMask from auto-injecting if it exists
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // Override the ethereum object to prevent automatic connections
        Object.defineProperty(window, 'ethereum', {
          value: {
            ...window.ethereum,
            request: () => Promise.reject(new Error('MetaMask not supported on this platform')),
            enable: () => Promise.reject(new Error('MetaMask not supported on this platform')),
            isMetaMask: false,
          },
          writable: false,
          configurable: false
        });
      } catch (error) {
        // Silently handle any errors in overriding ethereum object
      }
    }

    // Add error event listener to catch unhandled errors
    const handleError = (event: ErrorEvent) => {
      const message = event.message?.toLowerCase() || '';
      
      if (
        message.includes('metamask') ||
        message.includes('ethereum') ||
        message.includes('web3') ||
        event.filename?.includes('chrome-extension') ||
        event.filename?.includes('inpage.js')
      ) {
        event.preventDefault();
        return true; // Prevent the error from being logged
      }
    };

    window.addEventListener('error', handleError);

    // Cleanup function
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null; // This component doesn't render anything
}

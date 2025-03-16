import React, { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';

// Create context
const Web3Context = createContext();

// Provider component
export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize web3
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        // Check if MetaMask is installed
        if (window.ethereum) {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          
          // Get network ID
          const networkId = await web3Instance.eth.net.getId();
          setNetworkId(networkId);
          
          // Check if already connected
          const accounts = await web3Instance.eth.getAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            setAccount(accounts[0] || null);
          });
          
          // Listen for network changes
          window.ethereum.on('chainChanged', () => {
            window.location.reload();
          });
        } else {
          setError('Please install MetaMask to use this application');
        }
      } catch (error) {
        console.error('Error initializing web3:', error);
        setError('Failed to initialize web3');
      } finally {
        setLoading(false);
      }
    };
    
    initWeb3();
    
    // Cleanup listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);
  
  // Connect wallet
  const connectWallet = async () => {
    if (!web3) {
      setError('Web3 not initialized');
      return false;
    }
    
    try {
      setLoading(true);
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      
      return true;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Failed to connect wallet');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
  };
  
  // Get short address
  const getShortAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Check if connected to the correct network
  const isCorrectNetwork = () => {
    // Replace with your desired network ID (e.g., 1 for Ethereum Mainnet, 5 for Goerli)
    const desiredNetworkId = process.env.REACT_APP_NETWORK_ID || '1';
    return networkId && networkId.toString() === desiredNetworkId;
  };
  
  // Switch network
  const switchNetwork = async () => {
    if (!web3) {
      setError('Web3 not initialized');
      return false;
    }
    
    try {
      // Replace with your desired network parameters
      const desiredNetworkId = process.env.REACT_APP_NETWORK_ID || '1';
      const desiredNetworkHex = `0x${parseInt(desiredNetworkId).toString(16)}`;
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: desiredNetworkHex }],
      });
      
      return true;
    } catch (error) {
      console.error('Error switching network:', error);
      setError('Failed to switch network');
      return false;
    }
  };
  
  // Context value
  const value = {
    web3,
    account,
    networkId,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    getShortAddress,
    isCorrectNetwork,
    switchNetwork,
  };
  
  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

// Custom hook to use the web3 context
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export default Web3Context; 
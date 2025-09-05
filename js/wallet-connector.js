// Bitcoin Pepe Wallet Connector - Diamond Hands Authentication 💎
// Connects to Stacks wallets for meme voting and submission

class StacksWalletConnector {
    constructor() {
        this.isConnected = false;
        this.userAddress = null;
        this.userData = null;
        this.isHolder = false;
        this.nftCount = 0;
        this.tokenBalance = 0;
        this.contractId = 'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.tokensoft-token-v4k68639zxz';
        this.nftContractId = 'SP16SRR777TVB1WS5XSS9QT3YEZEC9JQFKYZENRAJ.bitcoin-pepe';
        this.init();
    }

    async init() {
        this.checkForExistingConnection();
        this.setupEventListeners();
        console.log("🔌 Stacks Wallet Connector initialized! Ready for diamond hands! 💎");
    }

    // Check if user is already connected
    checkForExistingConnection() {
        const savedAddress = localStorage.getItem('pepe_wallet_address');
        if (savedAddress) {
            this.userAddress = savedAddress;
            this.isConnected = true;
            this.updateUI();
            this.verifyHoldings();
        }
    }

    // Setup event listeners
    setupEventListeners() {
        const connectBtn = document.getElementById('connect-wallet');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => this.connectWallet());
        }

        // Listen for wallet events
        window.addEventListener('message', (event) => {
            if (event.data.type === 'wallet_connected') {
                this.handleWalletConnection(event.data);
            }
        });
    }

    // Connect to Stacks wallet
    async connectWallet() {
        try {
            // Check if Stacks Connect is available
            if (typeof window.StacksConnect === 'undefined') {
                await this.loadStacksConnect();
            }

            // Show connection UI
            this.showConnectingState();

            // Try multiple wallet connection methods
            await this.tryConnectWithHiro();
            
        } catch (error) {
            console.error('Wallet connection failed:', error);
            this.showError('Failed to connect wallet. Make sure you have a Stacks wallet installed!');
        }
    }

    // Load Stacks Connect library
    async loadStacksConnect() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@stacks/connect@7.3.0/dist/index.umd.js';
            script.onload = () => {
                console.log('📚 Stacks Connect loaded!');
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Try connecting with Hiro wallet
    async tryConnectWithHiro() {
        try {
            // Use Stacks Connect
            const authOptions = {
                userSession: new window.StacksConnect.UserSession(),
                onFinish: (authData) => {
                    this.handleSuccessfulConnection(authData);
                },
                onCancel: () => {
                    this.showError('Connection cancelled by user');
                }
            };

            window.StacksConnect.showConnect(authOptions);
            
        } catch (error) {
            // Fallback: Try window.stacks API (newer wallets)
            if (typeof window.stacks !== 'undefined') {
                try {
                    const response = await window.stacks.request('stx_getAddresses');
                    if (response && response.addresses && response.addresses.length > 0) {
                        this.handleSuccessfulConnection({
                            userSession: { 
                                loadUserData: () => ({ 
                                    profile: { stxAddress: { mainnet: response.addresses[0] } }
                                })
                            }
                        });
                    }
                } catch (stacksError) {
                    throw new Error('No Stacks wallet found');
                }
            } else {
                throw error;
            }
        }
    }

    // Handle successful wallet connection
    async handleSuccessfulConnection(authData) {
        try {
            this.userData = authData.userSession.loadUserData();
            this.userAddress = this.userData.profile.stxAddress.mainnet;
            this.isConnected = true;

            // Save to localStorage
            localStorage.setItem('pepe_wallet_address', this.userAddress);
            
            console.log('💎 Wallet connected:', this.userAddress);
            
            // Update UI and verify holdings
            this.updateUI();
            await this.verifyHoldings();
            
            // Show success message
            this.showSuccess('Wallet connected! Checking your diamond hands status... 💎');
            
        } catch (error) {
            console.error('Error processing wallet connection:', error);
            this.showError('Error processing wallet connection');
        }
    }

    // Show connecting state
    showConnectingState() {
        const connectBtn = document.getElementById('connect-wallet');
        const walletInfo = document.getElementById('wallet-info');
        
        if (connectBtn) {
            connectBtn.textContent = '🔄 CONNECTING...';
            connectBtn.disabled = true;
        }
        
        if (walletInfo) {
            walletInfo.style.display = 'none';
        }
    }

    // Update UI after connection
    updateUI() {
        const connectBtn = document.getElementById('connect-wallet');
        const walletInfo = document.getElementById('wallet-info');
        const walletAddress = document.getElementById('wallet-address');
        const holderStatus = document.getElementById('holder-status');
        const submitBtn = document.getElementById('submit-meme');

        if (this.isConnected && connectBtn) {
            connectBtn.style.display = 'none';
        }

        if (this.isConnected && walletInfo) {
            walletInfo.style.display = 'block';
            
            if (walletAddress) {
                walletAddress.textContent = `${this.userAddress.slice(0, 8)}...${this.userAddress.slice(-8)}`;
            }
            
            if (holderStatus) {
                holderStatus.textContent = 'Verifying holdings...';
            }
        }

        // Enable/disable meme submission
        if (submitBtn) {
            submitBtn.disabled = !this.isConnected || !this.isHolder;
            if (this.isConnected && this.isHolder) {
                submitBtn.textContent = '🚀 SUBMIT DANK MEME 🚀';
            }
        }
    }

    // Verify if user holds Bitcoin Pepe tokens or NFTs
    async verifyHoldings() {
        if (!this.userAddress) return;

        try {
            console.log('🔍 Verifying holdings for:', this.userAddress);
            
            // Check token balance
            await this.checkTokenBalance();
            
            // Check NFT holdings
            await this.checkNFTHoldings();
            
            // Update holder status
            this.isHolder = this.tokenBalance > 0 || this.nftCount > 0;
            
            this.updateHolderStatus();
            
        } catch (error) {
            console.error('Error verifying holdings:', error);
            this.showHoldingsError();
        }
    }

    // Check Bitcoin Pepe token balance
    async checkTokenBalance() {
        try {
            // For now, simulate checking balance (replace with actual API call)
            // In a real implementation, you'd call the Stacks API
            const mockBalance = Math.random() > 0.5 ? Math.floor(Math.random() * 1000000) : 0;
            this.tokenBalance = mockBalance;
            
            console.log('💰 Token balance:', this.tokenBalance);
            
        } catch (error) {
            console.error('Error checking token balance:', error);
            this.tokenBalance = 0;
        }
    }

    // Check Bitcoin Pepe NFT holdings
    async checkNFTHoldings() {
        try {
            // For now, simulate checking NFTs (replace with actual API call)
            // In a real implementation, you'd call the Stacks API or Gamma API
            const mockNFTCount = Math.random() > 0.3 ? Math.floor(Math.random() * 5) + 1 : 0;
            this.nftCount = mockNFTCount;
            
            console.log('🖼️ NFT count:', this.nftCount);
            
        } catch (error) {
            console.error('Error checking NFT holdings:', error);
            this.nftCount = 0;
        }
    }

    // Update holder status in UI
    updateHolderStatus() {
        const holderStatus = document.getElementById('holder-status');
        const submitBtn = document.getElementById('submit-meme');
        
        if (!holderStatus) return;

        if (this.isHolder) {
            let statusText = '💎 DIAMOND HANDS VERIFIED! 💎\n';
            
            if (this.tokenBalance > 0) {
                statusText += `🪙 PEPE Balance: ${this.formatNumber(this.tokenBalance)}\n`;
            }
            
            if (this.nftCount > 0) {
                statusText += `🖼️ Bitcoin Pepe NFTs: ${this.nftCount}`;
            }
            
            holderStatus.innerHTML = statusText.replace(/\n/g, '<br/>');
            holderStatus.style.color = 'var(--primary-orange)';
            
            // Enable voting and meme submission
            this.enableFeatures();
            
        } else {
            holderStatus.innerHTML = '❌ NOT A HOLDER<br/>You need Bitcoin Pepe tokens or NFTs to participate!';
            holderStatus.style.color = 'var(--degen-red)';
            
            // Disable features
            this.disableFeatures();
        }
        
        // Update submit button
        if (submitBtn) {
            submitBtn.disabled = !this.isHolder;
            if (this.isHolder) {
                submitBtn.textContent = '🚀 SUBMIT DANK MEME 🚀';
                submitBtn.classList.remove('disabled');
            } else {
                submitBtn.textContent = '❌ NEED PEPE TO SUBMIT';
                submitBtn.classList.add('disabled');
            }
        }
    }

    // Enable features for verified holders
    enableFeatures() {
        // Enable voting buttons
        document.querySelectorAll('.vote-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('disabled');
        });
        
        // Enable meme submission
        const form = document.getElementById('meme-form');
        if (form) {
            form.classList.remove('disabled');
        }
        
        console.log('✅ Features enabled for verified holder!');
    }

    // Disable features for non-holders
    disableFeatures() {
        // Disable voting buttons
        document.querySelectorAll('.vote-btn').forEach(btn => {
            btn.disabled = true;
            btn.classList.add('disabled');
        });
        
        // Disable meme submission
        const form = document.getElementById('meme-form');
        if (form) {
            form.classList.add('disabled');
        }
        
        console.log('❌ Features disabled for non-holder');
    }

    // Show holdings verification error
    showHoldingsError() {
        const holderStatus = document.getElementById('holder-status');
        if (holderStatus) {
            holderStatus.innerHTML = '⚠️ ERROR VERIFYING HOLDINGS<br/>Please try reconnecting your wallet';
            holderStatus.style.color = 'var(--text-medium)';
        }
    }

    // Disconnect wallet
    disconnect() {
        this.isConnected = false;
        this.userAddress = null;
        this.userData = null;
        this.isHolder = false;
        this.nftCount = 0;
        this.tokenBalance = 0;
        
        localStorage.removeItem('pepe_wallet_address');
        
        // Reset UI
        const connectBtn = document.getElementById('connect-wallet');
        const walletInfo = document.getElementById('wallet-info');
        
        if (connectBtn) {
            connectBtn.style.display = 'block';
            connectBtn.textContent = '🔌 CONNECT STACKS WALLET 🔌';
            connectBtn.disabled = false;
        }
        
        if (walletInfo) {
            walletInfo.style.display = 'none';
        }
        
        this.disableFeatures();
        
        console.log('👋 Wallet disconnected');
    }

    // Utility functions
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? 'var(--primary-orange)' : type === 'error' ? '#e74c3c' : 'var(--text-medium)'};
            color: ${type === 'success' ? '#000' : '#fff'};
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 700;
            z-index: 9999;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Public methods for other scripts
    isWalletConnected() {
        return this.isConnected;
    }

    isVerifiedHolder() {
        return this.isHolder;
    }

    getUserAddress() {
        return this.userAddress;
    }

    getHoldingsInfo() {
        return {
            tokenBalance: this.tokenBalance,
            nftCount: this.nftCount,
            isHolder: this.isHolder
        };
    }
}

// Initialize wallet connector when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.walletConnector = new StacksWalletConnector();
    console.log('💎 Wallet connector ready for diamond hands! 💎');
});

// Add notification animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .disabled {
        opacity: 0.5;
        pointer-events: none;
        cursor: not-allowed;
    }
    
    .wallet-status {
        margin: 20px 0;
    }
    
    .wallet-info {
        background: rgba(255, 102, 0, 0.1);
        border: 1px solid var(--primary-orange);
        border-radius: 12px;
        padding: 20px;
        margin-top: 20px;
    }
`;
document.head.appendChild(style);
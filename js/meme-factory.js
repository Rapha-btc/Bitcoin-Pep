// Bitcoin Pepe Meme Factory - Diamond Hands Only! 💎
// Handles meme submission, voting, and gallery management

class MemeFactory {
    constructor() {
        this.memes = [];
        this.currentFilter = 'hot';
        this.votingEnabled = false;
        this.submissionEnabled = false;
        this.currentPage = 1;
        this.memesPerPage = 12;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadMockMemes();
        this.updateUI();
        console.log('🐸 Meme Factory initialized! Ready for dank submissions! 🚀');
    }

    setupEventListeners() {
        // File upload handlers
        const fileUpload = document.getElementById('file-upload');
        const fileInput = document.getElementById('meme-file');
        
        if (fileUpload && fileInput) {
            fileUpload.addEventListener('click', () => fileInput.click());
            fileUpload.addEventListener('dragover', (e) => this.handleDragOver(e));
            fileUpload.addEventListener('drop', (e) => this.handleDrop(e));
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Form submission
        const memeForm = document.getElementById('meme-form');
        if (memeForm) {
            memeForm.addEventListener('submit', (e) => this.handleMemeSubmission(e));
        }

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e));
        });

        // Load more button
        const loadMoreBtn = document.getElementById('load-more');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreMemes());
        }

        // Listen for wallet connection changes
        window.addEventListener('walletConnectionChanged', (e) => {
            this.updateSubmissionStatus(e.detail);
        });
    }

    // File handling methods
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.style.borderColor = 'var(--primary-orange)';
        e.currentTarget.style.background = 'rgba(255, 102, 0, 0.05)';
    }

    handleDrop(e) {
        e.preventDefault();
        const fileUpload = e.currentTarget;
        fileUpload.style.borderColor = 'var(--primary-orange)';
        fileUpload.style.background = '';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    processFile(file) {
        // Validate file
        if (!this.validateFile(file)) return;

        // Show preview
        this.showFilePreview(file);
        
        // Update upload area
        const fileUpload = document.getElementById('file-upload');
        if (fileUpload) {
            fileUpload.style.borderColor = 'var(--primary-orange)';
            fileUpload.innerHTML = `
                <div class="upload-icon" style="font-size: 48px; margin-bottom: 16px;">✅</div>
                <p style="color: var(--primary-orange); margin-bottom: 8px; font-weight: 700;">DANK MEME LOADED!</p>
                <p style="color: var(--text-tertiary); font-size: 12px;">${file.name} (${this.formatFileSize(file.size)})</p>
            `;
        }
    }

    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

        if (!allowedTypes.includes(file.type)) {
            this.showError('Invalid file type! Only PNG, JPG, GIF, and WEBP allowed.');
            return false;
        }

        if (file.size > maxSize) {
            this.showError('File too large! Maximum size is 10MB.');
            return false;
        }

        return true;
    }

    showFilePreview(file) {
        const preview = document.getElementById('file-preview');
        const previewImage = document.getElementById('preview-image');
        
        if (preview && previewImage) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.src = e.target.result;
                preview.style.display = 'block';
                
                // Add preview animation
                previewImage.style.opacity = '0';
                previewImage.style.transform = 'scale(0.9)';
                
                setTimeout(() => {
                    previewImage.style.transition = 'all 0.3s ease';
                    previewImage.style.opacity = '1';
                    previewImage.style.transform = 'scale(1)';
                }, 100);
            };
            reader.readAsDataURL(file);
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Meme submission
    async handleMemeSubmission(e) {
        e.preventDefault();
        
        // Check if wallet is connected and user is holder
        if (!window.walletConnector || !window.walletConnector.isVerifiedHolder()) {
            this.showError('You must connect your wallet and own Bitcoin Pepe tokens/NFTs to submit memes!');
            return;
        }

        const formData = new FormData(e.target);
        const title = formData.get('meme-title') || document.getElementById('meme-title').value;
        const description = formData.get('meme-description') || document.getElementById('meme-description').value;
        const file = document.getElementById('meme-file').files[0];

        if (!title || !file) {
            this.showError('Please provide a title and upload a meme!');
            return;
        }

        try {
            // Show submitting state
            const submitBtn = document.getElementById('submit-meme');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '🚀 SUBMITTING DANK MEME...';
            submitBtn.disabled = true;

            // Simulate meme submission (in real app, would upload to IPFS/server)
            await this.submitMeme({
                title,
                description,
                file,
                author: window.walletConnector.getUserAddress(),
                timestamp: Date.now()
            });

            // Reset form
            e.target.reset();
            document.getElementById('file-preview').style.display = 'none';
            document.getElementById('file-upload').innerHTML = `
                <div class="upload-icon" style="font-size: 48px; margin-bottom: 16px;">📁</div>
                <p style="color: var(--text-secondary); margin-bottom: 8px;">Drag & drop your dank meme here or click to browse</p>
                <p style="color: var(--text-tertiary); font-size: 12px;">PNG, JPG, GIF, WEBP (Max 10MB)</p>
            `;

            this.showSuccess('🚀 MEME SUBMITTED! Your dank creation is now live!');
            
            // Refresh gallery
            this.refreshGallery();

        } catch (error) {
            console.error('Meme submission error:', error);
            this.showError('Failed to submit meme! Please try again.');
        } finally {
            const submitBtn = document.getElementById('submit-meme');
            submitBtn.textContent = originalText;
            submitBtn.disabled = !window.walletConnector?.isVerifiedHolder();
        }
    }

    async submitMeme(memeData) {
        // Simulate API call with delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create meme object
        const meme = {
            id: Date.now().toString(),
            title: memeData.title,
            description: memeData.description,
            image: URL.createObjectURL(memeData.file), // In real app, would be IPFS hash
            author: memeData.author,
            authorShort: `${memeData.author.slice(0, 6)}...${memeData.author.slice(-4)}`,
            timestamp: memeData.timestamp,
            votes: Math.floor(Math.random() * 10), // Start with some random votes
            upvotes: Math.floor(Math.random() * 8),
            downvotes: Math.floor(Math.random() * 3),
            rarity: this.calculateMemeRarity(),
            tags: this.generateMemeTags(memeData.title, memeData.description)
        };

        // Add to memes array (beginning for newest first)
        this.memes.unshift(meme);
        
        console.log('✅ Meme submitted successfully:', meme);
        return meme;
    }

    calculateMemeRarity() {
        const rarities = [
            { level: 'legendary', chance: 0.01, label: '🔥 LEGENDARY' },
            { level: 'diamond', chance: 0.05, label: '💎 DIAMOND' },
            { level: 'rare', chance: 0.15, label: '⚡ RARE' },
            { level: 'moon', chance: 0.25, label: '🌙 MOON' },
            { level: 'based', chance: 1, label: '🐸 BASED' }
        ];

        const random = Math.random();
        let cumulative = 0;

        for (const rarity of rarities) {
            cumulative += rarity.chance;
            if (random <= cumulative) {
                return rarity;
            }
        }

        return rarities[rarities.length - 1]; // Fallback to most common
    }

    generateMemeTags(title, description) {
        const text = `${title} ${description}`.toLowerCase();
        const possibleTags = [
            'hodl', 'moon', 'diamond-hands', 'based', 'degen', 'ape', 'wagmi',
            'lfg', 'pepe', 'frog', 'bitcoin', 'stacks', 'nft', 'meme', 'fire'
        ];

        return possibleTags.filter(tag => 
            text.includes(tag) || text.includes(tag.replace('-', ' '))
        );
    }

    // Gallery management
    loadMockMemes() {
        // Load some mock memes for demonstration
        this.memes = [
            {
                id: '1',
                title: '💎 DIAMOND HANDS PEPE 💎',
                description: 'When you HODL through every dip and your bags are still intact!',
                image: 'img/0aca6b9f-8ed8-4f27-9173-463e1c0200c4-1.png',
                author: 'SP1ABC...DEF123',
                authorShort: 'SP1ABC...DEF123',
                timestamp: Date.now() - 3600000,
                votes: 69,
                upvotes: 65,
                downvotes: 4,
                rarity: { level: 'legendary', label: '🔥 LEGENDARY' },
                tags: ['diamond-hands', 'hodl', 'moon']
            },
            {
                id: '2',
                title: '🚀 TO THE MOON PEPE 🚀',
                description: 'This meme is literally going to the moon in 2025!',
                image: 'img/dall-e-2024-04-16-19-59-10---a-cartoon-style-depiction-of-a-frog.png',
                author: 'SP2XYZ...ABC789',
                authorShort: 'SP2XYZ...ABC789',
                timestamp: Date.now() - 7200000,
                votes: 42,
                upvotes: 40,
                downvotes: 2,
                rarity: { level: 'diamond', label: '💎 DIAMOND' },
                tags: ['moon', 'rocket', 'space']
            },
            {
                id: '3',
                title: '🐸 BASED BITCOIN PEPE 🐸',
                description: 'The original Bitcoin Layer 2 Pepe. Accept no substitutes!',
                image: 'img/bitcoin-is-king--5--1.png',
                author: 'SP3DEF...GHI456',
                authorShort: 'SP3DEF...GHI456',
                timestamp: Date.now() - 10800000,
                votes: 1337,
                upvotes: 1300,
                downvotes: 37,
                rarity: { level: 'rare', label: '⚡ RARE' },
                tags: ['based', 'bitcoin', 'original']
            },
            {
                id: '4',
                title: '🦍 APE TOGETHER STRONG 🦍',
                description: 'When the Bitcoin Pepe community stands united!',
                image: 'img/52aa708e19d541f9a9786e1b164fad82-removebg-preview-1.png',
                author: 'SP4GHI...JKL789',
                authorShort: 'SP4GHI...JKL789',
                timestamp: Date.now() - 14400000,
                votes: 420,
                upvotes: 400,
                downvotes: 20,
                rarity: { level: 'moon', label: '🌙 MOON' },
                tags: ['ape', 'community', 'strong']
            }
        ];

        this.updateStats();
    }

    handleFilterChange(e) {
        e.preventDefault();
        
        // Update active filter
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        this.currentFilter = e.target.dataset.filter;
        this.currentPage = 1;
        
        this.renderMemes();
    }

    renderMemes() {
        const gallery = document.getElementById('meme-gallery');
        if (!gallery) return;

        const filteredMemes = this.filterMemes();
        const startIndex = (this.currentPage - 1) * this.memesPerPage;
        const endIndex = startIndex + this.memesPerPage;
        const pageMemes = filteredMemes.slice(startIndex, endIndex);

        if (pageMemes.length === 0) {
            gallery.innerHTML = `
                <div class="empty-memes" style="grid-column: 1 / -1; text-align: center; padding: 60px;">
                    <div style="font-size: 64px; margin-bottom: 24px;">🐸</div>
                    <h3 style="color: var(--text-secondary); margin-bottom: 16px;">No Memes Found</h3>
                    <p style="color: var(--text-tertiary);">Be the first to submit a dank meme!</p>
                </div>
            `;
            return;
        }

        gallery.innerHTML = pageMemes.map(meme => this.createMemeCard(meme)).join('');
        
        // Add intersection observer for animations
        this.setupMemeAnimations();
        
        // Update load more button
        this.updateLoadMoreButton(filteredMemes.length);
    }

    filterMemes() {
        let filtered = [...this.memes];

        switch (this.currentFilter) {
            case 'hot':
                // Sort by votes and recency
                filtered.sort((a, b) => {
                    const aScore = a.votes * 0.7 + (Date.now() - a.timestamp) / 3600000 * 0.3;
                    const bScore = b.votes * 0.7 + (Date.now() - b.timestamp) / 3600000 * 0.3;
                    return bScore - aScore;
                });
                break;
            case 'new':
                filtered.sort((a, b) => b.timestamp - a.timestamp);
                break;
            case 'top':
                filtered.sort((a, b) => b.votes - a.votes);
                break;
            case 'legendary':
                filtered = filtered.filter(meme => meme.rarity.level === 'legendary');
                break;
        }

        return filtered;
    }

    createMemeCard(meme) {
        const timeAgo = this.formatTimeAgo(meme.timestamp);
        const canVote = window.walletConnector?.isVerifiedHolder() || false;

        return `
            <div class="meme-card card-glass degen-tooltip fade-in" data-meme-id="${meme.id}" data-meme="DANK MEME! 🔥">
                <div class="meme-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <div class="degen-badge ${meme.rarity.level}">${meme.rarity.label}</div>
                    <div style="color: var(--text-tertiary); font-size: 12px;">${timeAgo}</div>
                </div>
                
                <img 
                    src="${meme.image}" 
                    alt="${meme.title}"
                    class="meme-image"
                    style="width: 100%; height: 250px; object-fit: cover; border-radius: var(--radius-md); margin-bottom: 16px; cursor: pointer;"
                    loading="lazy"
                    onclick="this.parentElement.querySelector('.meme-modal').style.display = 'flex'"
                />
                
                <h3 class="meme-title" style="color: var(--text-primary); margin-bottom: 8px; font-weight: 700; font-size: 16px;">${meme.title}</h3>
                
                ${meme.description ? `<p class="meme-description" style="color: var(--text-secondary); margin-bottom: 16px; font-size: 14px; line-height: 1.4;">${meme.description}</p>` : ''}
                
                <div class="meme-tags" style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px;">
                    ${meme.tags.slice(0, 3).map(tag => `<span class="tag" style="background: var(--glass-white); padding: 4px 8px; border-radius: var(--radius-sm); font-size: 10px; color: var(--text-tertiary);">#${tag}</span>`).join('')}
                </div>
                
                <div class="meme-footer" style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="meme-author" style="color: var(--text-tertiary); font-size: 12px;">
                        👤 ${meme.authorShort}
                    </div>
                    <div class="meme-voting" style="display: flex; gap: 8px; align-items: center;">
                        <button 
                            class="vote-btn upvote" 
                            data-meme-id="${meme.id}" 
                            data-vote="up"
                            ${!canVote ? 'disabled' : ''}
                            style="background: none; border: 1px solid var(--primary-orange); color: var(--primary-orange); padding: 6px 10px; border-radius: var(--radius-sm); font-size: 12px; cursor: pointer; transition: all 0.3s ease;"
                        >
                            🚀 ${meme.upvotes}
                        </button>
                        <button 
                            class="vote-btn downvote" 
                            data-meme-id="${meme.id}" 
                            data-vote="down"
                            ${!canVote ? 'disabled' : ''}
                            style="background: none; border: 1px solid #e74c3c; color: #e74c3c; padding: 6px 10px; border-radius: var(--radius-sm); font-size: 12px; cursor: pointer; transition: all 0.3s ease;"
                        >
                            💩 ${meme.downvotes}
                        </button>
                    </div>
                </div>
                
                <!-- Meme Modal -->
                <div class="meme-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10000; align-items: center; justify-content: center; backdrop-filter: var(--blur-xl);" onclick="this.style.display = 'none'">
                    <div style="max-width: 90vw; max-height: 90vh; text-align: center;" onclick="event.stopPropagation()">
                        <img src="${meme.image}" alt="${meme.title}" style="max-width: 100%; max-height: 80vh; object-fit: contain; border-radius: var(--radius-lg);" />
                        <div style="color: white; margin-top: 20px; font-size: 18px; font-weight: 700;">${meme.title}</div>
                        <button onclick="this.closest('.meme-modal').style.display = 'none'" style="margin-top: 16px; padding: 8px 16px; background: var(--primary-orange); color: #000; border: none; border-radius: var(--radius-sm); cursor: pointer;">Close</button>
                    </div>
                </div>
            </div>
        `;
    }

    setupMemeAnimations() {
        const cards = document.querySelectorAll('.meme-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                }
            });
        }, { threshold: 0.1 });

        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            observer.observe(card);
        });

        // Add voting handlers
        this.setupVotingHandlers();
    }

    setupVotingHandlers() {
        document.querySelectorAll('.vote-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleVote(e));
        });
    }

    async handleVote(e) {
        e.preventDefault();
        
        if (!window.walletConnector?.isVerifiedHolder()) {
            this.showError('Connect your wallet and verify Bitcoin Pepe holdings to vote!');
            return;
        }

        const button = e.currentTarget;
        const memeId = button.dataset.memeId;
        const voteType = button.dataset.vote;
        
        // Prevent double voting
        if (button.classList.contains('voted')) {
            this.showError('You can only vote once per meme!');
            return;
        }

        try {
            // Simulate voting API call
            await this.submitVote(memeId, voteType);
            
            // Update meme data
            const meme = this.memes.find(m => m.id === memeId);
            if (meme) {
                if (voteType === 'up') {
                    meme.upvotes++;
                    meme.votes++;
                } else {
                    meme.downvotes++;
                }
            }

            // Update button states
            const memeCard = button.closest('.meme-card');
            memeCard.querySelectorAll('.vote-btn').forEach(btn => {
                btn.classList.add('voted');
                btn.disabled = true;
            });

            // Update button text
            button.textContent = voteType === 'up' ? `🚀 ${meme.upvotes}` : `💩 ${meme.downvotes}`;
            button.style.background = voteType === 'up' ? 'var(--primary-orange)' : '#e74c3c';
            button.style.color = '#000';

            this.showSuccess(`Vote cast! ${voteType === 'up' ? 'Meme to the moon! 🚀' : 'Not based! 💩'}`);
            
            // Update stats
            this.updateStats();

        } catch (error) {
            console.error('Voting error:', error);
            this.showError('Failed to cast vote! Please try again.');
        }
    }

    async submitVote(memeId, voteType) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`Vote submitted: ${memeId} - ${voteType}`);
    }

    loadMoreMemes() {
        this.currentPage++;
        const filteredMemes = this.filterMemes();
        const startIndex = (this.currentPage - 1) * this.memesPerPage;
        const pageMemes = filteredMemes.slice(startIndex, startIndex + this.memesPerPage);

        if (pageMemes.length > 0) {
            const gallery = document.getElementById('meme-gallery');
            const newCards = pageMemes.map(meme => this.createMemeCard(meme)).join('');
            gallery.insertAdjacentHTML('beforeend', newCards);
            
            this.setupMemeAnimations();
        }

        this.updateLoadMoreButton(filteredMemes.length);
    }

    updateLoadMoreButton(totalMemes) {
        const loadMoreBtn = document.getElementById('load-more');
        if (!loadMoreBtn) return;

        const hasMore = (this.currentPage * this.memesPerPage) < totalMemes;
        loadMoreBtn.style.display = hasMore ? 'block' : 'none';
    }

    updateStats() {
        // Update meme statistics
        const totalMemes = document.getElementById('total-memes');
        const totalVotes = document.getElementById('total-votes');
        const activeVoters = document.getElementById('active-voters');
        const legendaryMemes = document.getElementById('legendary-memes');

        if (totalMemes) totalMemes.textContent = this.memes.length;
        if (totalVotes) totalVotes.textContent = this.memes.reduce((sum, meme) => sum + meme.votes, 0);
        if (activeVoters) activeVoters.textContent = Math.floor(this.memes.length * 0.3); // Simulate active voters
        if (legendaryMemes) legendaryMemes.textContent = this.memes.filter(m => m.rarity.level === 'legendary').length;
    }

    refreshGallery() {
        this.currentPage = 1;
        this.renderMemes();
        this.updateStats();
    }

    updateUI() {
        this.renderMemes();
    }

    updateSubmissionStatus(walletData) {
        this.submissionEnabled = walletData.isHolder;
        this.votingEnabled = walletData.isHolder;
        
        // Enable/disable form elements
        const submitBtn = document.getElementById('submit-meme');
        const memeForm = document.getElementById('meme-form');
        
        if (submitBtn) {
            submitBtn.disabled = !this.submissionEnabled;
        }
        
        if (memeForm) {
            memeForm.classList.toggle('disabled', !this.submissionEnabled);
        }
        
        // Update vote buttons
        document.querySelectorAll('.vote-btn').forEach(btn => {
            btn.disabled = !this.votingEnabled || btn.classList.contains('voted');
        });
    }

    formatTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }

    // Utility methods
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
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
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Initialize meme factory when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.memeFactory = new MemeFactory();
});

// Add CSS for meme cards
const memeStyle = document.createElement('style');
memeStyle.textContent = `
    .meme-gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 30px;
        margin-top: 40px;
    }
    
    .meme-card {
        padding: 20px;
        transition: all 0.3s ease;
        cursor: pointer;
        position: relative;
    }
    
    .meme-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .filter-btn {
        background: var(--surface-primary);
        border: 2px solid var(--glass-white);
        color: var(--text-secondary);
        padding: 12px 24px;
        border-radius: var(--radius-md);
        margin: 0 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    
    .filter-btn:hover {
        border-color: var(--primary-orange);
        color: var(--primary-orange);
    }
    
    .filter-btn.active {
        background: var(--primary-orange);
        border-color: var(--primary-orange);
        color: #000;
        box-shadow: 0 0 20px var(--primary-orange);
    }
    
    .vote-btn {
        transition: all 0.3s ease;
    }
    
    .vote-btn:not(:disabled):hover {
        transform: scale(1.05);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
    
    .vote-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .meme-loading {
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px;
    }
    
    .degen-loading {
        width: 60px;
        height: 60px;
        border: 4px solid var(--glass-white);
        border-top: 4px solid var(--primary-orange);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
        .meme-gallery {
            grid-template-columns: 1fr;
            gap: 20px;
        }
        
        .filter-btn {
            padding: 8px 16px;
            margin: 4px;
            font-size: 14px;
        }
    }
`;
document.head.appendChild(memeStyle);
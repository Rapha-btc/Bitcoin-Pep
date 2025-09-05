// DEGEN CHAOS ENGINE - Maximum Meme Energy 🐸💎🚀
// WARNING: May cause excessive hopium and diamond hands

class DegenChaosEngine {
    constructor() {
        this.chaosLevel = 0;
        this.soundEnabled = true;
        this.konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
        this.konamiIndex = 0;
        this.memeQuotes = [
            "HODL TO THE MOON! 🚀",
            "DIAMOND HANDS ONLY! 💎🙌",
            "WEN LAMBO? 🏎️",
            "NUMBER GO UP! 📈",
            "THIS IS THE WAY! 🐸",
            "HAVE FUN STAYING POOR! 😎",
            "NGMI VS WAGMI! ⚔️",
            "TO THE MOON AND BEYOND! 🌙",
            "APE TOGETHER STRONG! 🦍",
            "BITCOIN FIXES THIS! ₿"
        ];
        this.init();
    }

    init() {
        this.addChaosBackground();
        this.initSoundEffects();
        this.initMemeInteractions();
        this.initKonamiCode();
        this.initChaosMode();
        this.addDegenLabels();
        this.initRandomMemeQuotes();
        console.log("🐸 DEGEN CHAOS ENGINE ACTIVATED! LFG! 🚀💎");
    }

    // Add animated chaos background
    addChaosBackground() {
        const chaosDiv = document.createElement('div');
        chaosDiv.className = 'chaos-bg';
        document.body.appendChild(chaosDiv);
    }

    // Initialize sound effects (disabled)
    initSoundEffects() {
        // Sound effects disabled for better user experience
        this.soundEnabled = false;
        
        // Keep the meme text effects on interactions
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-glass, .btn-degen, .nft-card-glass, .nft-card-degen')) {
                this.showRandomMeme(e.target);
            }
        });
    }

    // Play meme-appropriate sounds (disabled for better UX)
    playMemeSound(type) {
        // Sound effects disabled - users can enjoy the music links instead
        return;
    }

    // Initialize meme interactions
    initMemeInteractions() {
        // Add subtle scroll effects (removed hue rotation)
        let chaosTimeout;
        window.addEventListener('scroll', () => {
            // Keep scroll tracking without color changes
            this.chaosLevel = Math.min(this.chaosLevel + 1, 100);
            
            clearTimeout(chaosTimeout);
            chaosTimeout = setTimeout(() => {
                this.chaosLevel = Math.max(this.chaosLevel - 2, 0);
            }, 100);
        });

        // Rage click detection
        let clickCount = 0;
        let clickTimeout;
        document.addEventListener('click', () => {
            clickCount++;
            if (clickCount > 10) {
                this.activateChaosMode();
                clickCount = 0;
            }
            
            clearTimeout(clickTimeout);
            clickTimeout = setTimeout(() => {
                clickCount = 0;
            }, 2000);
        });
    }

    // Konami Code Easter Egg
    initKonamiCode() {
        document.addEventListener('keydown', (e) => {
            if (e.keyCode === this.konamiCode[this.konamiIndex]) {
                this.konamiIndex++;
                if (this.konamiIndex === this.konamiCode.length) {
                    this.activateUltimateDegenMode();
                    this.konamiIndex = 0;
                }
            } else {
                this.konamiIndex = 0;
            }
        });
    }

    // Chaos Mode Activation
    initChaosMode() {
        // Auto-activate chaos mode randomly
        setInterval(() => {
            if (Math.random() < 0.01) { // 1% chance every interval
                this.miniChaosMode();
            }
        }, 5000);
    }

    // Add degen labels to elements
    addDegenLabels() {
        // Add labels to trading cards
        setTimeout(() => {
            const exchangeCards = document.querySelectorAll('a[href*="swap"], a[href*="trade"]');
            exchangeCards.forEach(card => {
                card.classList.add('sound-trigger', 'degen-tooltip');
                card.setAttribute('data-meme', 'SEND IT! 🚀');
            });
        }, 1000);
    }

    // Initialize Twitter/X timeline programmatically with fallback
    initTwitterTimeline() {
        const container = document.getElementById('twitter-container');
        if (!container) return;

        const create = () => {
            if (window.twttr && window.twttr.widgets && window.twttr.widgets.createTimeline) {
                window.twttr.widgets.createTimeline(
                    {
                        sourceType: 'profile',
                        screenName: 'PepeCoinSTX'
                    },
                    container,
                    {
                        theme: 'dark',
                        chrome: 'noborders transparent',
                        height: 600
                    }
                ).catch(() => this.renderTwitterFallback(container));
            } else {
                this.renderTwitterFallback(container);
            }
        };

        if (!window.twttr) {
            const script = document.createElement('script');
            script.src = 'https://platform.twitter.com/widgets.js';
            script.async = true;
            script.onload = () => setTimeout(create, 0);
            script.onerror = () => this.renderTwitterFallback(container);
            document.body.appendChild(script);
        } else {
            setTimeout(create, 0);
        }
    }

    renderTwitterFallback(container) {
        container.innerHTML = `
            <div style="text-align: center;">
                <p style="color: var(--text-secondary); margin-bottom: 12px;">Unable to load tweets right now.</p>
                <a href="https://twitter.com/PepeCoinSTX" target="_blank" rel="noopener noreferrer" class="btn-glass">Open on X</a>
            </div>
        `;
    }

    // Get degen rarity for NFTs
    getDegenRarity(index) {
        const rarities = [
            { class: 'legendary', label: '🔥 LEGENDARY' },
            { class: 'diamond', label: '💎 DIAMOND' },
            { class: 'rare', label: '⚡ RARE' },
            { class: 'moon', label: '🌙 MOON' },
            { class: '', label: '🐸 BASED' }
        ];
        
        if (index === 0) return rarities[0]; // First NFT is legendary
        if (index < 3) return rarities[1]; // Next 2 are diamond
        if (index < 6) return rarities[2]; // Next 3 are rare
        return rarities[Math.floor(Math.random() * rarities.length)];
    }

    // Random meme quotes
    initRandomMemeQuotes() {
        setInterval(() => {
            this.showFloatingMeme();
        }, 15000); // Every 15 seconds
    }

    showFloatingMeme() {
        const meme = document.createElement('div');
        meme.textContent = this.memeQuotes[Math.floor(Math.random() * this.memeQuotes.length)];
        meme.style.cssText = `
            position: fixed;
            top: ${Math.random() * 80 + 10}%;
            left: ${Math.random() * 80 + 10}%;
            color: var(--primary-orange);
            font-weight: 900;
            font-size: 14px;
            z-index: 1000;
            pointer-events: none;
            text-shadow: 0 0 10px var(--primary-orange);
            animation: moon-bounce 2s ease-out;
        `;
        
        document.body.appendChild(meme);
        
        setTimeout(() => {
            meme.remove();
        }, 2000);
    }

    showRandomMeme(element) {
        const meme = document.createElement('div');
        meme.textContent = this.getRandomMeme();
        meme.style.cssText = `
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            color: var(--toxic-yellow);
            font-weight: 900;
            font-size: 12px;
            z-index: 1000;
            pointer-events: none;
            animation: moon-bounce 1s ease-out;
        `;
        
        element.style.position = 'relative';
        element.appendChild(meme);
        
        setTimeout(() => {
            meme.remove();
        }, 1000);
    }

    getRandomMeme() {
        const memes = [
            "GM FRENS! ☀️",
            "LFG! 🚀",
            "WAGMI! 💎",
            "BASED! 🐸",
            "MOON SOON! 🌙",
            "DIAMOND HANDS! 💎🙌",
            "HODL! 📈",
            "TO THE MOON! 🚀",
            "NUMBER GO UP! ⬆️",
            "PEPE ENERGY! ⚡"
        ];
        return memes[Math.floor(Math.random() * memes.length)];
    }

    // Mini chaos mode
    miniChaosMode() {
        document.body.style.animation = 'chaos-shake 0.5s ease-in-out';
        this.playMemeSound('chaos');
        
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
    }

    // Full chaos mode
    activateChaosMode() {
        document.body.classList.add('chaos-mode');
        
        // Show chaos message
        this.showChaosMessage("🔥 CHAOS MODE ACTIVATED! 🔥");
        
        // Add glitch effects to everything
        const elements = document.querySelectorAll('.card-glass, .nft-card-glass, h1, h2, h3');
        elements.forEach(el => {
            el.style.animation = 'glitch 0.1s infinite';
        });
        
        // Reset after 5 seconds
        setTimeout(() => {
            document.body.classList.remove('chaos-mode');
            elements.forEach(el => {
                el.style.animation = '';
            });
        }, 5000);
    }

    // Ultimate degen mode (Konami code)
    activateUltimateDegenMode() {
        // Show konami message
        const konami = document.createElement('div');
        konami.className = 'konami-code active';
        konami.innerHTML = `
            <h2>🎉 ULTIMATE DEGEN MODE! 🎉</h2>
            <p>🐸💎🚀 MAXIMUM PEPE ENERGY UNLOCKED! 🚀💎🐸</p>
            <p>YOU ARE NOW A TRUE BITCOIN PEPE DEGEN!</p>
        `;
        document.body.appendChild(konami);
        
        // Ultimate chaos
        this.activateChaosMode();
        
        // Add orange glow effect instead of rainbow
        document.body.style.boxShadow = 'inset 0 0 50px rgba(255, 102, 0, 0.2)';
        let intensity = 0.2;
        let increasing = true;
        const glowInterval = setInterval(() => {
            if (increasing) {
                intensity += 0.1;
                if (intensity >= 0.5) increasing = false;
            } else {
                intensity -= 0.1;
                if (intensity <= 0.2) increasing = true;
            }
            document.body.style.boxShadow = `inset 0 0 50px rgba(255, 102, 0, ${intensity})`;
        }, 200);
        
        // Remove after 10 seconds
        setTimeout(() => {
            konami.remove();
            clearInterval(glowInterval);
            document.body.style.boxShadow = '';
        }, 10000);
    }

    showChaosMessage(message) {
        const msg = document.createElement('div');
        msg.textContent = message;
        msg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--text-medium);
            color: #fff;
            padding: 20px 40px;
            border-radius: 20px;
            font-family: Impact, sans-serif;
            font-weight: 900;
            font-size: 24px;
            z-index: 9999;
            animation: laser-pulse 0.5s infinite, chaos-shake 0.5s ease-in-out;
        `;
        
        document.body.appendChild(msg);
        
        setTimeout(() => {
            msg.remove();
        }, 2000);
    }

    // Update page titles with degen energy
    updateDegenTitles() {
        const sections = [
            { selector: '#about h2', text: '💎 FIRST PEPE ON BITCOIN L2 💎' },
            { selector: '#nfts h2', text: '🐸 DEGEN NFT COLLECTION 🐸' },
            { selector: '#music h2', text: '🎵 PEPE BEATS & VIBES 🎵' },
            { selector: '#merch h2', text: '👕 BASED MERCH STORE 👕' },
            { selector: '#trade h2', text: '🚀 MOON MISSION TRADING 🚀' }
        ];
        
        sections.forEach(section => {
            const element = document.querySelector(section.selector);
            if (element) {
                element.textContent = section.text;
                element.classList.add('degen-title');
                element.setAttribute('data-text', section.text);
            }
        });
    }

    // Initialize click counters and achievements
    initAchievements() {
        let achievements = {
            clicks: 0,
            scrolls: 0,
            hovers: 0
        };
        
        // Click counter
        document.addEventListener('click', () => {
            achievements.clicks++;
            if (achievements.clicks === 50) {
                this.showAchievement("🖱️ CLICK MASTER!", "50 clicks achieved!");
            } else if (achievements.clicks === 100) {
                this.showAchievement("💎 DIAMOND CLICKER!", "100 clicks! You're addicted!");
            }
        });
        
        // Scroll counter
        let scrollCount = 0;
        window.addEventListener('scroll', () => {
            scrollCount++;
            if (scrollCount === 100) {
                achievements.scrolls++;
                scrollCount = 0;
                if (achievements.scrolls === 10) {
                    this.showAchievement("📜 SCROLL WARRIOR!", "Master of the infinite scroll!");
                }
            }
        });
    }

    showAchievement(title, description) {
        const achievement = document.createElement('div');
        achievement.innerHTML = `
            <h3>${title}</h3>
            <p>${description}</p>
        `;
        achievement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-orange);
            color: #000;
            padding: 15px;
            border-radius: 10px;
            font-weight: 700;
            z-index: 9999;
            animation: moon-bounce 2s ease-in-out;
        `;
        
        document.body.appendChild(achievement);
        
        setTimeout(() => {
            achievement.remove();
        }, 3000);
    }
}

// Initialize the chaos when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.degenChaos = new DegenChaosEngine();
    
    // Update titles after a brief delay to ensure elements exist
    setTimeout(() => {
        window.degenChaos.updateDegenTitles();
        window.degenChaos.initAchievements();
    }, 2000);
});

// Export for manual chaos activation
window.activateChaos = () => {
    if (window.degenChaos) {
        window.degenChaos.activateChaosMode();
    }
};

window.ultimateDegen = () => {
    if (window.degenChaos) {
        window.degenChaos.activateUltimateDegenMode();
    }
};

console.log("🚀 DEGEN CHAOS LOADED! Type 'ultimateDegen()' for maximum chaos! 💎🐸");
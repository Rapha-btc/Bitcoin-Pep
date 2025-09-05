// Bitcoin Pepe Timeline Animations - From Meme to Moon! 🚀
// Interactive timeline with scroll-triggered animations and degen effects

class TimelineAnimations {
    constructor() {
        this.timeline = null;
        this.timelineItems = [];
        this.currentMilestone = 0;
        this.isPlaying = false;
        this.scrollOffset = 100;
        this.animationDelay = 800;
        this.observer = null;
        this.init();
    }

    init() {
        this.setupElements();
        this.setupIntersectionObserver();
        this.setupEventListeners();
        this.setupScrollAnimations();
        console.log('🚀 Timeline animations initialized! Ready for moon mission! 🌙');
    }

    setupElements() {
        this.timeline = document.querySelector('.timeline-section');
        this.timelineItems = Array.from(document.querySelectorAll('.timeline-item'));
        this.playButton = document.getElementById('play-timeline');
        this.resetButton = document.getElementById('reset-timeline');
        
        // Add timeline progress bar
        this.createProgressBar();
        
        // Add milestone connections
        this.createMilestoneConnections();
    }

    createProgressBar() {
        if (!this.timeline) return;
        
        const progressBar = document.createElement('div');
        progressBar.className = 'timeline-progress';
        progressBar.style.cssText = `
            position: absolute;
            left: 50%;
            top: 0;
            width: 4px;
            height: 0%;
            background: linear-gradient(to bottom, 
                var(--primary-orange) 0%, 
                var(--light-orange) 50%, 
                gold 100%);
            transform: translateX(-50%);
            z-index: 10;
            transition: height 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 0 20px var(--primary-orange);
            border-radius: 2px;
        `;
        
        const wrapper = document.querySelector('.timeline-wrapper');
        if (wrapper) {
            wrapper.style.position = 'relative';
            wrapper.appendChild(progressBar);
            this.progressBar = progressBar;
        }
    }

    createMilestoneConnections() {
        // Add connecting lines between milestones
        const style = document.createElement('style');
        style.textContent = `
            .timeline-wrapper::before {
                content: '';
                position: absolute;
                left: 50%;
                top: 0;
                width: 2px;
                height: 100%;
                background: var(--glass-white);
                transform: translateX(-50%);
                z-index: 1;
                opacity: 0.3;
            }
            
            .timeline-item {
                position: relative;
                margin-bottom: 80px;
                opacity: 0;
                transform: translateY(50px);
                transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
            }
            
            .timeline-item.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .timeline-item:nth-child(odd) .timeline-content {
                margin-left: auto;
                margin-right: 60px;
                max-width: 500px;
            }
            
            .timeline-item:nth-child(even) .timeline-content {
                margin-left: 60px;
                margin-right: auto;
                max-width: 500px;
            }
            
            .timeline-marker {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                z-index: 20;
                width: 80px;
                height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .timeline-icon {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: var(--surface-primary);
                backdrop-filter: var(--blur-xl);
                border: 3px solid var(--primary-orange);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                position: relative;
                z-index: 2;
                transition: all 0.4s ease;
                box-shadow: 0 0 30px rgba(255, 102, 0, 0.3);
            }
            
            .timeline-pulse {
                position: absolute;
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: var(--primary-orange);
                opacity: 0.2;
                animation: timeline-pulse 2s infinite;
                z-index: 1;
            }
            
            .timeline-pulse.gold {
                background: gold;
                animation: timeline-pulse-gold 2s infinite;
            }
            
            @keyframes timeline-pulse {
                0% {
                    transform: scale(0.8);
                    opacity: 0.4;
                }
                50% {
                    transform: scale(1.2);
                    opacity: 0.1;
                }
                100% {
                    transform: scale(1.4);
                    opacity: 0;
                }
            }
            
            @keyframes timeline-pulse-gold {
                0% {
                    transform: scale(0.8);
                    opacity: 0.6;
                    box-shadow: 0 0 0 0 gold;
                }
                50% {
                    transform: scale(1.2);
                    opacity: 0.3;
                    box-shadow: 0 0 20px 10px rgba(255, 215, 0, 0.1);
                }
                100% {
                    transform: scale(1.4);
                    opacity: 0;
                    box-shadow: 0 0 40px 20px rgba(255, 215, 0, 0);
                }
            }
            
            .timeline-item.active .timeline-icon {
                border-color: var(--light-orange);
                box-shadow: 0 0 40px var(--light-orange);
                transform: scale(1.1);
            }
            
            .timeline-item.completed .timeline-icon {
                border-color: var(--primary-orange);
                background: var(--primary-orange);
                color: #000;
                font-weight: 900;
                box-shadow: 0 0 50px var(--primary-orange);
            }
            
            .timeline-content {
                background: var(--surface-primary);
                backdrop-filter: var(--blur-xl);
                border: 1px solid var(--glass-white);
                border-radius: var(--radius-lg);
                padding: 30px;
                position: relative;
                transition: all 0.4s ease;
            }
            
            .timeline-content:hover {
                transform: translateY(-5px);
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                border-color: var(--primary-orange);
            }
            
            .timeline-stats {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                margin-top: 16px;
            }
            
            .timeline-stats span {
                background: var(--glass-white);
                padding: 6px 12px;
                border-radius: var(--radius-sm);
                font-size: 12px;
                font-weight: 600;
                color: var(--text-primary);
            }
            
            .timeline-controls {
                display: flex;
                gap: 20px;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            @media (max-width: 768px) {
                .timeline-item:nth-child(odd) .timeline-content,
                .timeline-item:nth-child(even) .timeline-content {
                    margin-left: 60px;
                    margin-right: 20px;
                    max-width: calc(100vw - 100px);
                }
                
                .timeline-marker {
                    left: 30px;
                    transform: translate(-50%, -50%);
                }
                
                .timeline-wrapper::before {
                    left: 30px;
                }
                
                .timeline-progress {
                    left: 30px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const item = entry.target;
                    const index = this.timelineItems.indexOf(item);
                    
                    // Animate in with delay based on position
                    setTimeout(() => {
                        item.classList.add('animate-in');
                        this.updateProgressBar(index + 1);
                        
                        // Add completed state after animation
                        setTimeout(() => {
                            item.classList.add('completed');
                        }, 600);
                        
                        // Trigger chaos effect for special milestones
                        if (item.dataset.milestone === 'moon') {
                            this.triggerMoonLandingEffect();
                        } else if (item.dataset.milestone === 'hack') {
                            this.triggerBattleEffect();
                        }
                        
                    }, index * 200);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-50px'
        });

        // Observe all timeline items
        this.timelineItems.forEach(item => {
            this.observer.observe(item);
        });
    }

    setupEventListeners() {
        if (this.playButton) {
            this.playButton.addEventListener('click', () => this.playTimeline());
        }
        
        if (this.resetButton) {
            this.resetButton.addEventListener('click', () => this.resetTimeline());
        }
        
        // Add click handlers to timeline items
        this.timelineItems.forEach((item, index) => {
            item.addEventListener('click', () => this.jumpToMilestone(index));
        });
        
        // Smooth scroll for timeline navigation
        this.setupSmoothScroll();
    }

    setupSmoothScroll() {
        // Add navigation links
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId) || 
                                   document.querySelector(`[data-milestone="${targetId}"]`);
                
                if (targetElement) {
                    e.preventDefault();
                    this.scrollToElement(targetElement);
                }
            });
        });
    }

    setupScrollAnimations() {
        // Add scroll-based hue rotation
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateOnScroll = () => {
            const scrollY = window.scrollY;
            const scrollPercent = Math.min(scrollY / (document.body.scrollHeight - window.innerHeight), 1);
            
            // Update timeline progress based on scroll
            if (this.timeline) {
                const timelineRect = this.timeline.getBoundingClientRect();
                const timelineProgress = Math.max(0, Math.min(1, 
                    (window.innerHeight - timelineRect.top) / timelineRect.height
                ));
                this.updateProgressBar(Math.floor(timelineProgress * this.timelineItems.length));
            }
            
            // Add subtle parallax effect to timeline icons
            this.timelineItems.forEach((item, index) => {
                const icon = item.querySelector('.timeline-icon');
                if (icon) {
                    const rect = item.getBoundingClientRect();
                    const itemCenter = rect.top + rect.height / 2;
                    const screenCenter = window.innerHeight / 2;
                    const distance = (itemCenter - screenCenter) / screenCenter;
                    
                    icon.style.transform = `translateY(${distance * 10}px) scale(${1 + Math.abs(distance) * 0.05})`;
                }
            });
            
            lastScrollY = scrollY;
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateOnScroll);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    updateProgressBar(completedMilestones) {
        if (!this.progressBar) return;
        
        const progress = Math.min(100, (completedMilestones / this.timelineItems.length) * 100);
        this.progressBar.style.height = `${progress}%`;
        
        // Change color based on progress
        if (progress >= 100) {
            this.progressBar.style.background = 'linear-gradient(to bottom, gold 0%, gold 100%)';
            this.progressBar.style.boxShadow = '0 0 30px gold';
        } else if (progress >= 75) {
            this.progressBar.style.background = 'linear-gradient(to bottom, var(--primary-orange) 0%, var(--light-orange) 50%, gold 100%)';
        }
    }

    async playTimeline() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.playButton.textContent = '⏸️ PAUSE TIMELINE';
        this.playButton.disabled = true;
        
        try {
            // Reset all items first
            this.resetTimeline(false);
            
            // Scroll to timeline start
            this.scrollToElement(this.timeline);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Animate each milestone
            for (let i = 0; i < this.timelineItems.length; i++) {
                const item = this.timelineItems[i];
                
                // Scroll to current item
                this.scrollToElement(item, -200);
                
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Animate in
                item.classList.add('animate-in', 'active');
                
                // Update progress
                this.updateProgressBar(i + 1);
                
                // Special effects for certain milestones
                if (item.dataset.milestone === 'genesis') {
                    this.triggerGenesisEffect();
                } else if (item.dataset.milestone === 'hack') {
                    this.triggerBattleEffect();
                } else if (item.dataset.milestone === 'moon') {
                    this.triggerMoonLandingEffect();
                }
                
                await new Promise(resolve => setTimeout(resolve, this.animationDelay));
                
                // Mark as completed
                item.classList.add('completed');
                item.classList.remove('active');
                
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            // Final celebration
            this.triggerTimelineComplete();
            
        } catch (error) {
            console.error('Timeline animation error:', error);
        } finally {
            this.isPlaying = false;
            this.playButton.textContent = '▶️ PLAY TIMELINE';
            this.playButton.disabled = false;
        }
    }

    resetTimeline(smooth = true) {
        this.timelineItems.forEach(item => {
            item.classList.remove('animate-in', 'active', 'completed');
        });
        
        this.updateProgressBar(0);
        this.currentMilestone = 0;
        
        if (smooth) {
            this.scrollToElement(this.timeline);
        }
        
        console.log('🔄 Timeline reset!');
    }

    jumpToMilestone(index) {
        if (index < 0 || index >= this.timelineItems.length) return;
        
        const item = this.timelineItems[index];
        this.scrollToElement(item);
        
        // Highlight the selected milestone
        this.timelineItems.forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
        
        this.currentMilestone = index;
    }

    scrollToElement(element, offset = -100) {
        if (!element) return;
        
        const elementTop = element.getBoundingClientRect().top + window.scrollY;
        const targetPosition = elementTop + offset;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    // Special effects for milestones
    triggerGenesisEffect() {
        // Create particle effect for genesis
        this.createParticleEffect('🐸', 'var(--primary-orange)');
        console.log('🐸 Genesis effect triggered!');
    }

    triggerBattleEffect() {
        // Create battle effect for hack survival
        this.createShakeEffect();
        this.createParticleEffect('⚔️', 'var(--degen-red)');
        console.log('⚔️ Battle tested effect triggered!');
    }

    triggerMoonLandingEffect() {
        // Epic moon landing celebration
        this.createParticleEffect('🚀', 'gold');
        this.createParticleEffect('🌙', 'gold');
        this.createParticleEffect('⭐', 'gold');
        
        // Add golden glow to entire page
        document.body.style.boxShadow = 'inset 0 0 100px rgba(255, 215, 0, 0.1)';
        setTimeout(() => {
            document.body.style.boxShadow = '';
        }, 3000);
        
        console.log('🌙 MOON LANDING EFFECT! We made it!');
    }

    triggerTimelineComplete() {
        // Final celebration when timeline is complete
        this.createParticleEffect('💎', 'var(--diamond-blue)');
        this.createParticleEffect('🚀', 'var(--light-orange)');
        
        // Show completion message
        this.showCompletionMessage();
        
        console.log('🎉 Timeline complete! From meme to moon! 🚀');
    }

    createParticleEffect(emoji, color) {
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.textContent = emoji;
            particle.style.cssText = `
                position: fixed;
                font-size: 24px;
                pointer-events: none;
                z-index: 9999;
                left: ${Math.random() * window.innerWidth}px;
                top: ${window.innerHeight}px;
                color: ${color};
                animation: particle-float 3s ease-out forwards;
            `;
            
            document.body.appendChild(particle);
            
            // Remove after animation
            setTimeout(() => {
                particle.remove();
            }, 3000);
        }
    }

    createShakeEffect() {
        document.body.style.animation = 'chaos-shake 0.5s ease-in-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
    }

    showCompletionMessage() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--surface-primary);
            backdrop-filter: var(--blur-xl);
            border: 2px solid gold;
            border-radius: var(--radius-lg);
            padding: 40px;
            text-align: center;
            z-index: 10000;
            animation: completion-popup 0.5s ease-out;
            box-shadow: 0 0 50px gold;
        `;
        
        message.innerHTML = `
            <h2 style="color: gold; margin-bottom: 16px; font-family: Impact, sans-serif;">
                🚀 TIMELINE COMPLETE! 🚀
            </h2>
            <p style="color: var(--primary-orange); font-weight: 700; margin-bottom: 24px;">
                From humble meme to literal moon landing!<br/>
                The legend of Bitcoin Pepe continues... 🌙
            </p>
            <button onclick="this.parentElement.remove()" class="btn-degen" style="font-size: 14px; padding: 12px 24px;">
                💎 DIAMOND HANDS FOREVER 💎
            </button>
        `;
        
        document.body.appendChild(message);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (message.parentElement) {
                message.remove();
            }
        }, 10000);
    }
}

// Initialize timeline animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.timelineAnimations = new TimelineAnimations();
});

// Add particle animation CSS
const particleStyle = document.createElement('style');
particleStyle.textContent = `
    @keyframes particle-float {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
    
    @keyframes completion-popup {
        0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
`;
document.head.appendChild(particleStyle);
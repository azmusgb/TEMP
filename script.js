// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    // Core elements
    const body = document.body;
    const loadingScreen = document.getElementById('loadingScreen');
    const forceLoadBtn = document.getElementById('forceLoadBtn');
    const storybookCover = document.getElementById('storybookCover');
    const openBookBtn = document.getElementById('openBookBtn');
    const storybook = document.getElementById('storybook');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Safety timeout
    const safetyTimeout = setTimeout(hideLoadingScreen, 5000);
    
    // Force load button
    forceLoadBtn.addEventListener('click', () => {
        clearTimeout(safetyTimeout);
        hideLoadingScreen();
    });
    
    function hideLoadingScreen() {
        loadingScreen.classList.add('hidden');
        if (storybookCover) {
            setTimeout(openStorybook, 500);
        }
    }
    
    function openStorybook() {
        storybookCover.classList.add('closed');
        setTimeout(() => {
            storybook.classList.add('visible');
            contentSections.forEach(section => {
                section.classList.add('visible');
            });
        }, 800);
    }
    
    // Initialize core functionality
    initNavigation();
    initScrollEffects();
    initControls();
    initCharacterModal();
    initRSVP();
    initGames();
    
    // Auto-hide loading screen
    setTimeout(hideLoadingScreen, 2000);
});

// Navigation
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navItems = document.querySelectorAll('.nav-item');
    
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });
    }
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navMenu.classList.remove('open');
        });
    });
    
    // Update active nav on scroll
    window.addEventListener('scroll', updateActiveNav);
}

function updateActiveNav() {
    const scrollPosition = window.pageYOffset + 110;
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const sectionId = item.getAttribute('data-section');
        if (sectionId) {
            const section = document.getElementById(sectionId);
            if (section) {
                const rect = section.getBoundingClientRect();
                const sectionTop = rect.top + window.pageYOffset;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            }
        }
    });
}

// Scroll effects
function initScrollEffects() {
    const readingProgress = document.getElementById('readingProgress');
    const scrollAnimateElements = document.querySelectorAll('.scroll-animate');
    
    window.addEventListener('scroll', () => {
        updateReadingProgress();
        checkScrollAnimations();
    });
    
    function updateReadingProgress() {
        const doc = document.documentElement;
        const scrollTop = doc.scrollTop || document.body.scrollTop;
        const scrollHeight = doc.scrollHeight - doc.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        readingProgress.style.width = progress + '%';
    }
    
    function checkScrollAnimations() {
        const windowHeight = window.innerHeight;
        const triggerBottom = windowHeight * 0.8;
        
        scrollAnimateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < triggerBottom) {
                element.classList.add('visible');
            }
        });
    }
    
    // Scroll to top FAB
    const scrollTopFab = document.getElementById('scrollTopFab');
    if (scrollTopFab) {
        scrollTopFab.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Scroll to RSVP FAB
    const scrollRsvpFab = document.getElementById('scrollRsvpFab');
    if (scrollRsvpFab) {
        scrollRsvpFab.addEventListener('click', () => {
            const rsvp = document.getElementById('rsvp');
            if (rsvp) {
                rsvp.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

// Controls
function initControls() {
    const musicToggle = document.getElementById('musicToggle');
    const motionToggle = document.getElementById('motionToggle');
    const bgMusic = document.getElementById('bgMusic');
    
    // Music toggle
    if (musicToggle && bgMusic) {
        musicToggle.addEventListener('click', () => {
            const icon = musicToggle.querySelector('i');
            if (bgMusic.paused) {
                bgMusic.volume = 0.35;
                bgMusic.play().catch(() => {});
                icon.classList.remove('fa-volume-xmark');
                icon.classList.add('fa-music');
            } else {
                bgMusic.pause();
                icon.classList.remove('fa-music');
                icon.classList.add('fa-volume-xmark');
            }
        });
    }
    
    // Motion toggle
    if (motionToggle) {
        motionToggle.addEventListener('click', () => {
            body.classList.toggle('reduce-motion');
        });
    }
}

// Character modal
function initCharacterModal() {
    const characterModal = document.getElementById('characterModal');
    const closeCharacterModalBtn = document.getElementById('closeCharacterModal');
    
    if (closeCharacterModalBtn) {
        closeCharacterModalBtn.addEventListener('click', () => {
            characterModal.classList.remove('active');
        });
    }
    
    if (characterModal) {
        characterModal.addEventListener('click', (e) => {
            if (e.target === characterModal) {
                characterModal.classList.remove('active');
            }
        });
    }
}

const characterData = {
    pooh: {
        name: 'Winnie the Pooh',
        quote: '"A little Consideration, a little Thought for Others, makes all the difference."',
        image: 'Images/Characters/honey-bear.png',
        bio: 'Pooh has volunteered to be in charge of honey jars, hugs, and quiet snuggles. He is quite certain Baby Gunner will need all three in generous amounts.'
    },
    piglet: {
        name: 'Piglet',
        quote: '"It is hard to be brave, when you\'re only a Very Small Animal — but I\'ll do it for Baby Gunner."',
        image: 'Images/Characters/piglet.png',
        bio: 'Piglet has carefully arranged the soft blankets and tiny clothes, making sure everything feels cozy, safe, and just right for someone very small.'
    },
    tigger: {
        name: 'Tigger',
        quote: '"The wonderful thing about babies is that babies are wonderful things!"',
        image: 'Images/Characters/tigger.png',
        bio: 'Tigger is in charge of games, giggles, and any moment that calls for a bounce. He\'s especially excited about showing everyone how to make Baby Gunner smile.'
    },
    eeyore: {
        name: 'Eeyore',
        quote: '"Not much of a tail, but it\'s my tail. And this is our baby, and that\'s rather special."',
        image: 'Images/Characters/eeyore.png',
        bio: 'Eeyore has quietly found the best spot for photos and moments of quiet. He is making sure there\'s always a comfortable place to sit and simply be together.'
    }
};

window.showCharacterModal = function(character) {
    const data = characterData[character];
    if (!data) return;
    
    const modalCharacterIcon = document.getElementById('modalCharacterIcon');
    const modalCharacterTitle = document.getElementById('characterModalTitle');
    const modalCharacterQuote = document.getElementById('modalCharacterQuote');
    const modalCharacterBio = document.getElementById('modalCharacterBio');
    const characterModal = document.getElementById('characterModal');
    
    if (modalCharacterIcon && modalCharacterTitle && modalCharacterQuote && modalCharacterBio && characterModal) {
        modalCharacterIcon.innerHTML = `<img src="${data.image}" alt="${data.name}" onerror="this.style.display='none'">`;
        modalCharacterTitle.textContent = data.name;
        modalCharacterQuote.textContent = data.quote;
        modalCharacterBio.textContent = data.bio;
        characterModal.classList.add('active');
    }
};

// RSVP form
function initRSVP() {
    const rsvpForm = document.getElementById('rsvpForm');
    const rsvpStatus = document.getElementById('rsvpStatus');
    
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            rsvpStatus.textContent = 'Thank you! Your RSVP has been noted.';
            rsvpForm.reset();
        });
    }
}

// Games
function initGames() {
    const gameCards = document.querySelectorAll('.game-card');
    const playGameButtons = document.querySelectorAll('.play-game-btn');
    const gameContainer = document.getElementById('gameContainer');
    
    gameCards.forEach(card => {
        card.addEventListener('click', function() {
            const gameType = this.getAttribute('data-game');
            gameCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    playGameButtons.forEach(button => {
        button.addEventListener('click', function() {
            const gameType = this.getAttribute('data-game');
            loadGame(gameType);
        });
    });
    
    function loadGame(gameType) {
        // Simple game loading - you can expand this with actual game implementations
        const gameHTML = `
            <div class="game-container">
                <div class="game-header">
                    <h1>${gameType === 'honey' ? 'Honey Collector' : 'Honey Harvest Defense'}</h1>
                    <p>${gameType === 'honey' ? 'Help Pooh collect honey pots!' : 'Defend the Hundred Acre Wood!'}</p>
                </div>
                <div class="message-box">
                    <span class="pooh-face">🐻</span>
                    <span>Game loading soon! This feature is being prepared.</span>
                </div>
                <button class="back-btn game-back-btn">
                    <i class="fas fa-arrow-left"></i>Back to Game Selection
                </button>
            </div>
        `;
        
        gameContainer.innerHTML = gameHTML;
        
        // Add back button functionality
        const backBtn = gameContainer.querySelector('.game-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                gameContainer.innerHTML = '';
            });
        }
        
        // Scroll to games section
        document.getElementById('section4').scrollIntoView({ behavior: 'smooth' });
    }
}

// Woodland sound effect
window.playWoodlandSound = function(ev) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.8);
    } catch (e) {
        console.log("Web Audio API not supported");
    }
    
    const sign = ev.target.closest('.woodland-sign');
    if (sign) {
        sign.style.transform = 'scale(1.08) rotate(-1deg)';
        setTimeout(() => {
            sign.style.transform = '';
        }, 300);
    }
};

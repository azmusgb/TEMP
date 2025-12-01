// script.js - Enhanced and Evolved JavaScript for Hundred Acre Celebration

class HundredAcreGame {
    constructor() {
        this.init();
    }

    init() {
        try {
            this.cacheElements();
            this.setupEventListeners();
            this.setupIntersectionObservers();
            this.initPreferences();
            this.checkExistingRSVP();
            this.startLoadingSequence();
        } catch (error) {
            console.error('Game initialization failed:', error);
            this.safeHideLoading();
        }
    }

    cacheElements() {
        // Base elements
        this.elements = {
            body: document.body,
            storybookCover: document.getElementById('storybookCover'),
            openBookBtn: document.getElementById('openBookBtn'),
            storybook: document.getElementById('storybook'),
            contentSections: document.querySelectorAll('.content-section'),
            scrollAnimateElements: document.querySelectorAll('.scroll-animate'),
            navItems: document.querySelectorAll('.nav-item'),
            navMenu: document.getElementById('navMenu'),
            navToggle: document.getElementById('navToggle'),
            loadingScreen: document.getElementById('loadingScreen'),
            readingProgress: document.getElementById('readingProgress'),
            scrollTopFab: document.getElementById('scrollTopFab'),
            scrollRsvpFab: document.getElementById('scrollRsvpFab'),
            musicToggle: document.getElementById('musicToggle'),
            motionToggle: document.getElementById('motionToggle'),
            rsvpForm: document.getElementById('rsvpForm'),
            rsvpStatus: document.getElementById('rsvpStatus'),
            bgMusic: document.getElementById('bgMusic'),
            persistentRsvpBtn: document.getElementById('persistentRsvpBtn')
        };

        // Character modal
        this.modal = {
            character: document.getElementById('characterModal'),
            closeCharacter: document.getElementById('closeCharacterModal'),
            characterIcon: document.getElementById('modalCharacterIcon'),
            characterTitle: document.getElementById('characterModalTitle'),
            characterQuote: document.getElementById('modalCharacterQuote'),
            characterBio: document.getElementById('modalCharacterBio')
        };

        // Game instruction modal
        this.gameModal = {
            instruction: document.getElementById('gameInstructionModal'),
            close: document.getElementById('closeGameModal'),
            title: document.getElementById('gameInstructionTitle'),
            list: document.getElementById('gameInstructionList')
        };

        // Game canvases
        this.canvases = {
            honey: document.getElementById('honey-game'),
            defense: document.getElementById('defense-game')
        };

        // Initialize games if canvases exist
        if (this.canvases.honey) this.initHoneyCatchGame();
        if (this.canvases.defense) this.initTowerDefenseGame();
    }

    setupEventListeners() {
        const { elements, modal, gameModal } = this;

        // Storybook controls
        elements.openBookBtn?.addEventListener('click', () => this.openStorybook());

        // Navigation
        elements.navToggle?.addEventListener('click', () => this.toggleNavigation());
        elements.navItems?.forEach(item => {
            item.addEventListener('click', () => this.closeNavigation());
        });

        // Scroll events
        window.addEventListener('scroll', () => {
            this.throttle(this.checkScrollAnimations, 100)();
            this.throttle(this.updateReadingProgress, 50)();
        });

        // FAB controls
        elements.scrollTopFab?.addEventListener('click', () => this.scrollToTop());
        elements.scrollRsvpFab?.addEventListener('click', () => this.scrollToRSVP());

        // Persistent RSVP
        elements.persistentRsvpBtn?.addEventListener('click', () => this.scrollToRSVP());

        // Preferences
        elements.musicToggle?.addEventListener('click', () => this.toggleMusic());
        elements.motionToggle?.addEventListener('click', () => this.toggleReduceMotion());

        // RSVP Form
        elements.rsvpForm?.addEventListener('submit', (e) => this.handleRsvpSubmit(e));

        // Modals
        modal.closeCharacter?.addEventListener('click', () => this.closeModal(modal.character));
        modal.character?.addEventListener('click', (e) => {
            if (e.target === modal.character) this.closeModal(modal.character);
        });

        gameModal.close?.addEventListener('click', () => this.closeModal(gameModal.instruction));
        gameModal.instruction?.addEventListener('click', (e) => {
            if (e.target === gameModal.instruction) this.closeModal(gameModal.instruction);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Window resize
        window.addEventListener('resize', () => this.throttle(this.handleResize, 250)());
    }

    // Throttle function for performance
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Storybook Functions
    openStorybook() {
        const { elements } = this;
        elements.storybookCover.classList.add('closed');

        setTimeout(() => {
            elements.storybook.classList.add('visible');
            elements.contentSections.forEach(section => {
                section.classList.add('visible');
            });
            
            // Scroll to the first section
            document.getElementById('section1')?.scrollIntoView({
                behavior: 'smooth'
            });
        }, 800);
    }

    // Navigation Functions
    toggleNavigation() {
        this.elements.navMenu.classList.toggle('open');
    }

    closeNavigation() {
        this.elements.navMenu.classList.remove('open');
    }

    setupIntersectionObservers() {
        const sections = document.querySelectorAll('.content-section');
        const options = {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0.1
        };

        this.sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                const navItem = document.querySelector(`.nav-item[data-section="${id}"]`);
                
                if (entry.isIntersecting) {
                    this.elements.navItems.forEach(item => item.classList.remove('active'));
                    if (navItem) navItem.classList.add('active');
                    
                    // Handle persistent RSVP button visibility
                    this.handlePersistentRsvpVisibility(id);
                }
            });
        }, options);

        sections.forEach(section => {
            this.sectionObserver.observe(section);
        });
    }

    handlePersistentRsvpVisibility(sectionId) {
        if (!this.elements.persistentRsvpBtn) return;
        
        if (sectionId === 'section2') {
            this.elements.persistentRsvpBtn.classList.remove('hidden');
        } else if (sectionId === 'section1') {
            this.elements.persistentRsvpBtn.classList.add('hidden');
        }
    }

    // Scroll Animation Functions
    checkScrollAnimations() {
        const windowHeight = window.innerHeight;
        const triggerBottom = windowHeight * 0.8;

        this.elements.scrollAnimateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < triggerBottom) {
                element.classList.add('visible');
            }
        });
    }

    updateReadingProgress() {
        const doc = document.documentElement;
        const scrollTop = doc.scrollTop || document.body.scrollTop;
        const scrollHeight = doc.scrollHeight - doc.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        this.elements.readingProgress.style.width = `${progress}%`;
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    scrollToRSVP() {
        const rsvpSection = document.getElementById('rsvp');
        if (rsvpSection) {
            rsvpSection.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }

    // Accessibility & Preferences
    initPreferences() {
        this.initReduceMotionPreference();
        this.initMusicPreference();
    }

    initReduceMotionPreference() {
        const stored = localStorage.getItem('reduce-motion');
        if (stored === 'true') {
            this.elements.body.classList.add('reduce-motion');
        }
    }

    toggleReduceMotion() {
        const enabled = this.elements.body.classList.toggle('reduce-motion');
        localStorage.setItem('reduce-motion', enabled ? 'true' : 'false');
    }

    initMusicPreference() {
        if (!this.elements.bgMusic) return;
        
        const stored = localStorage.getItem('bg-music');
        const icon = this.elements.musicToggle.querySelector('i');
        
        if (stored === 'on') {
            this.elements.bgMusic.volume = 0.35;
            this.playBackgroundMusic();
            icon?.classList.replace('fa-volume-xmark', 'fa-music');
        } else {
            icon?.classList.replace('fa-music', 'fa-volume-xmark');
        }
    }

    async playBackgroundMusic() {
        try {
            await this.elements.bgMusic.play();
        } catch (error) {
            console.log('Autoplay prevented:', error);
        }
    }

    toggleMusic() {
        if (!this.elements.bgMusic) return;
        
        const icon = this.elements.musicToggle.querySelector('i');
        if (this.elements.bgMusic.paused) {
            this.elements.bgMusic.volume = 0.35;
            this.playBackgroundMusic();
            icon?.classList.replace('fa-volume-xmark', 'fa-music');
            localStorage.setItem('bg-music', 'on');
        } else {
            this.elements.bgMusic.pause();
            icon?.classList.replace('fa-music', 'fa-volume-xmark');
            localStorage.setItem('bg-music', 'off');
        }
    }

    // Modal Functions
    showCharacterModal(character) {
        const characterData = {
            pooh: {
                name: 'Winnie the Pooh',
                quote: '"A little Consideration, a little Thought for Others, makes all the difference."',
                icon: 'fas fa-bear',
                bio: 'Pooh has volunteered to be in charge of honey jars, hugs, and quiet snuggles. He is quite certain Baby Gunner will need all three in generous amounts.'
            },
            piglet: {
                name: 'Piglet',
                quote: '"It is hard to be brave, when you\'re only a Very Small Animal — but I\'ll do it for Baby Gunner."',
                icon: 'fas fa-heart',
                bio: 'Piglet has carefully arranged the soft blankets and tiny clothes, making sure everything feels cozy, safe, and just right for someone very small.'
            },
            tigger: {
                name: 'Tigger',
                quote: '"The wonderful thing about babies is that babies are wonderful things!"',
                icon: 'fas fa-paw',
                bio: 'Tigger is in charge of games, giggles, and any moment that calls for a bounce. He\'s especially excited about showing everyone how to make Baby Gunner smile.'
            },
            eeyore: {
                name: 'Eeyore',
                quote: '"Not much of a tail, but it\'s my tail. And this is our baby, and that\'s rather special."',
                icon: 'fas fa-cloud',
                bio: 'Eeyore has quietly found the best spot for photos and moments of quiet. He is making sure there\'s always a comfortable place to sit and simply be together.'
            }
        };

        const data = characterData[character];
        if (!data) return;

        const { modal } = this;
        modal.characterIcon.innerHTML = `<i class="${data.icon}"></i>`;
        modal.characterIcon.className = `modal-character-icon ${character}-icon-modal`;
        modal.characterTitle.textContent = data.name;
        modal.characterQuote.textContent = data.quote;
        modal.characterBio.textContent = data.bio;
        modal.character.classList.add('active');
    }

    showGameInstructions(gameType) {
        const gameInstructions = {
            catch: {
                title: "Honey Pot Catch - How to Play",
                instructions: [
                    "Use LEFT and RIGHT arrow keys to move Pooh",
                    "Catch falling honey pots to earn points (+10 points each)",
                    "Avoid the bees! Each bee sting costs one life",
                    "You start with 3 lives - don't lose them all!",
                    "Game lasts 60 seconds - catch as much honey as you can!",
                    "On mobile: Use the left/right buttons below the game"
                ]
            },
            defense: {
                title: "Honey Hive Defense - How to Play",
                instructions: [
                    "Select a tower type by clicking on the character icons",
                    "Click on empty grass areas to place towers (costs honey)",
                    "Towers automatically attack Heffalumps, Woozles, and Bees",
                    "Each enemy type has different health and speed",
                    "Upgrade towers to increase damage and range",
                    "Start waves manually - enemies get tougher each wave",
                    "Protect your honey pot at the end of the path!",
                    "Game over if you lose all 10 lives"
                ]
            }
        };

        const instructions = gameInstructions[gameType];
        if (!instructions) return;

        const { gameModal } = this;
        gameModal.title.textContent = instructions.title;
        gameModal.list.innerHTML = '';
        
        instructions.instructions.forEach(instruction => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-honey-pot"></i>${instruction}`;
            gameModal.list.appendChild(li);
        });
        
        gameModal.instruction.classList.add('active');
    }

    closeModal(modalElement) {
        modalElement.classList.remove('active');
    }

    // RSVP Functions
    handleRsvpSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.elements.rsvpForm);
        const guestName = formData.get('guestName')?.trim();
        const guestCount = formData.get('guestCount');
        const guestNote = formData.get('guestNote')?.trim();

        if (!guestName) {
            this.showRsvpStatus('Please enter your name', 'error');
            return;
        }

        this.processSuccessfulRSVP(guestName, guestCount, guestNote);
    }

    processSuccessfulRSVP(name, count, note) {
        const { elements } = this;
        
        elements.rsvpForm.style.display = 'none';
        elements.rsvpStatus.innerHTML = this.createRsvpSuccessHTML(name, count, note);
        elements.rsvpStatus.style.color = 'inherit';
        
        // Celebration effects
        this.createConfetti();
        this.createHoneyAnimation();
        
        // Hide persistent RSVP button
        elements.persistentRsvpBtn?.classList.add('hidden');
        
        // Store RSVP data
        this.storeRsvpData(name, count, note);
    }

    createRsvpSuccessHTML(name, count, note) {
        return `
            <div class="form-success">
                <div class="success-icon">🎉</div>
                <div class="success-message">Thank you, ${name}!</div>
                <div class="success-submessage">
                    We're excited to celebrate with ${count === '1' ? 'you' : `your party of ${count}`}!
                    ${note ? '<br>We appreciate your note!' : ''}
                </div>
            </div>
        `;
    }

    storeRsvpData(name, count, note) {
        const rsvpData = {
            name: name,
            count: count,
            note: note,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('babyGunnerRSVP', JSON.stringify(rsvpData));
    }

    checkExistingRSVP() {
        const existingRSVP = localStorage.getItem('babyGunnerRSVP');
        if (!existingRSVP || !this.elements.rsvpForm) return;

        const rsvpData = JSON.parse(existingRSVP);
        this.populateRsvpForm(rsvpData);
        this.showExistingRsvpConfirmation(rsvpData);
    }

    populateRsvpForm(rsvpData) {
        document.getElementById('guestName').value = rsvpData.name;
        document.getElementById('guestCount').value = rsvpData.count;
        document.getElementById('guestNote').value = rsvpData.note || '';
    }

    showExistingRsvpConfirmation(rsvpData) {
        this.elements.rsvpForm.style.display = 'none';
        this.elements.rsvpStatus.innerHTML = `
            <div class="form-success">
                <div class="success-icon">✅</div>
                <div class="success-message">RSVP Confirmed!</div>
                <div class="success-submessage">
                    We have your RSVP for ${rsvpData.name} and ${rsvpData.count} guest${rsvpData.count === '1' ? '' : 's'}.
                    <br><button onclick="game.editRSVP()" class="back-btn" style="margin-top: 10px;">Edit RSVP</button>
                </div>
            </div>
        `;
        this.elements.persistentRsvpBtn?.classList.add('hidden');
    }

    editRSVP() {
        localStorage.removeItem('babyGunnerRSVP');
        if (this.elements.rsvpForm && this.elements.rsvpStatus) {
            this.elements.rsvpForm.style.display = 'block';
            this.elements.rsvpStatus.innerHTML = '';
            this.elements.persistentRsvpBtn?.classList.remove('hidden');
        }
    }

    showRsvpStatus(message, type = 'info') {
        this.elements.rsvpStatus.textContent = message;
        this.elements.rsvpStatus.style.color = type === 'error' ? '#dc3545' : 'inherit';
    }

    // Celebration Effects
    createConfetti() {
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);
        
        const colors = ['#FFC42B', '#D62E2E', '#E6B86A', '#B0D0E3', '#9CAD90'];
        
        for (let i = 0; i < 150; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = this.generateConfettiStyle(colors);
            container.appendChild(confetti);
        }
        
        setTimeout(() => container.remove(), 3000);
    }

    generateConfettiStyle(colors) {
        const isCircle = Math.random() > 0.7;
        const isRectangle = Math.random() > 0.5 && !isCircle;
        
        return `
            left: ${Math.random() * 100}vw;
            animation-delay: ${Math.random() * 2}s;
            background-color: ${colors[Math.floor(Math.random() * colors.length)]};
            transform: rotate(${Math.random() * 360}deg);
            ${isCircle ? 'border-radius: 50%; width: 8px; height: 8px;' : ''}
            ${isRectangle ? 'width: 12px; height: 4px;' : 'width: 10px; height: 10px;'}
        `;
    }

    createHoneyAnimation() {
        const honeyIcon = document.createElement('div');
        honeyIcon.innerHTML = '🍯';
        honeyIcon.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            font-size: 4rem;
            transform: translate(-50%, -50%) scale(0);
            animation: honeyPop 1s ease-out forwards;
            z-index: 10005;
        `;
        document.body.appendChild(honeyIcon);
        
        setTimeout(() => honeyIcon.remove(), 1000);
    }

    // Woodland Sound Function
    playWoodlandSound(event) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createWoodlandSound(audioContext);
        } catch (error) {
            console.log("Web Audio API not supported");
        }

        this.animateWoodlandSign(event);
    }

    createWoodlandSound(audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        const times = [0, 0.1, 0.2];
        const frequencies = [523.25, 659.25, 783.99];
        
        times.forEach((time, index) => {
            oscillator.frequency.setValueAtTime(frequencies[index], audioContext.currentTime + time);
        });

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.8);
    }

    animateWoodlandSign(event) {
        const sign = event.target.closest('.woodland-sign');
        if (sign) {
            sign.style.transform = 'scale(1.08) rotate(-1deg)';
            setTimeout(() => {
                sign.style.transform = '';
            }, 300);
        }
    }

    // Keyboard Shortcuts
    handleKeyboardShortcuts(e) {
        // Escape key closes modals
        if (e.key === 'Escape') {
            this.closeModal(this.modal.character);
            this.closeModal(this.gameModal.instruction);
        }
        
        // Space key toggles music (when not in input fields)
        if (e.key === ' ' && !this.isInputElement(e.target)) {
            e.preventDefault();
            this.toggleMusic();
        }
    }

    isInputElement(element) {
        return element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.isContentEditable;
    }

    // Resize Handler
    handleResize() {
        // Reinitialize games if needed
        if (this.honeyGame) this.honeyGame.handleResize();
        if (this.defenseGame) this.defenseGame.handleResize();
    }

    // Loading Functions
    startLoadingSequence() {
        setTimeout(() => {
            this.safeHideLoading();
            this.animateContentSections();
        }, 1000);
    }

    safeHideLoading() {
        if (this.elements.loadingScreen && !this.elements.loadingScreen.classList.contains('hidden')) {
            this.elements.loadingScreen.classList.add('hidden');
        }
    }

    animateContentSections() {
        this.elements.contentSections.forEach((section, index) => {
            setTimeout(() => {
                section.classList.add('animate-in');
            }, index * 200);
        });
    }

    // Game Initialization
    initHoneyCatchGame() {
        this.honeyGame = new HoneyCatchGame(this.canvases.honey);
    }

    initTowerDefenseGame() {
        this.defenseGame = new TowerDefenseGame(this.canvases.defense);
    }
}

// Honey Catch Game Class
class HoneyCatchGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.init();
    }

    init() {
        this.resetGame();
        this.setupEventListeners();
        this.draw();
    }

    resetGame() {
        this.score = 0;
        this.timeLeft = 60;
        this.lives = 3;
        this.poohX = this.canvas.width / 2;
        this.honeyPots = [];
        this.bees = [];
        this.gameRunning = false;
        this.gameInterval = null;
        this.timerInterval = null;
        
        this.updateUI();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Mobile controls
        const leftBtn = document.getElementById('mobileLeftBtn');
        const rightBtn = document.getElementById('mobileRightBtn');
        
        if (leftBtn && rightBtn) {
            leftBtn.addEventListener('touchstart', (e) => this.handleMobileInput('left', e));
            rightBtn.addEventListener('touchstart', (e) => this.handleMobileInput('right', e));
            
            // Prevent context menu
            [leftBtn, rightBtn].forEach(btn => {
                btn.addEventListener('contextmenu', (e) => e.preventDefault());
            });
        }

        // Game controls
        document.getElementById('start-catch')?.addEventListener('click', () => this.start());
        document.getElementById('pause-catch')?.addEventListener('click', () => this.togglePause());
    }

    handleKeyPress(e) {
        if (!this.gameRunning) return;

        if (e.key === 'ArrowLeft' && this.poohX > 40) {
            this.poohX -= 20;
        } else if (e.key === 'ArrowRight' && this.poohX < this.canvas.width - 40) {
            this.poohX += 20;
        }
    }

    handleMobileInput(direction, e) {
        e.preventDefault();
        if (!this.gameRunning) return;

        if (direction === 'left' && this.poohX > 40) {
            this.poohX -= 20;
        } else if (direction === 'right' && this.poohX < this.canvas.width - 40) {
            this.poohX += 20;
        }
    }

    start() {
        if (this.gameRunning) return;

        this.resetGame();
        this.gameRunning = true;

        this.gameInterval = setInterval(() => this.gameLoop(), 16);
        this.startTimer();
    }

    togglePause() {
        if (!this.gameRunning && this.timeLeft > 0 && this.lives > 0) {
            this.gameRunning = true;
            this.gameInterval = setInterval(() => this.gameLoop(), 16);
            this.startTimer();
        } else if (this.gameRunning) {
            this.gameRunning = false;
            clearInterval(this.gameInterval);
            clearInterval(this.timerInterval);
        }
    }

    startTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateUI();

            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    gameLoop() {
        this.update();
        this.draw();
    }

    update() {
        this.moveHoneyPots();
        this.moveBees();
        this.spawnObjects();
    }

    moveHoneyPots() {
        this.honeyPots.forEach((pot, index) => {
            pot.y += pot.speed;

            if (this.checkCatch(pot)) {
                this.score += 10;
                this.honeyPots.splice(index, 1);
                this.showCatchEffect();
            } else if (pot.y > this.canvas.height) {
                this.honeyPots.splice(index, 1);
            }
        });
    }

    moveBees() {
        this.bees.forEach((bee, index) => {
            bee.y += bee.speed;

            if (this.checkCollision(bee)) {
                this.lives--;
                this.bees.splice(index, 1);
                this.showCollisionEffect();

                if (this.lives <= 0) {
                    this.endGame();
                }
            } else if (bee.y > this.canvas.height) {
                this.bees.splice(index, 1);
            }
        });
    }

    checkCatch(pot) {
        return pot.y > this.canvas.height - 100 &&
               pot.x > this.poohX - 40 &&
               pot.x < this.poohX + 40;
    }

    checkCollision(bee) {
        return bee.y > this.canvas.height - 100 &&
               bee.x > this.poohX - 40 &&
               bee.x < this.poohX + 40;
    }

    spawnObjects() {
        if (Math.random() < 0.05) {
            this.honeyPots.push({
                x: Math.random() * (this.canvas.width - 30) + 15,
                y: 0,
                speed: 2 + Math.random() * 2
            });
        }

        if (Math.random() < 0.02) {
            this.bees.push({
                x: Math.random() * (this.canvas.width - 30) + 15,
                y: 0,
                speed: 3 + Math.random() * 2
            });
        }
    }

    showCatchEffect() {
        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    showCollisionEffect() {
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw() {
        this.drawBackground();
        this.drawPooh();
        this.drawHoneyPots();
        this.drawBees();
        this.drawUI();
    }

    drawBackground() {
        // Sky
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Clouds
        this.drawClouds();
        
        // Ground
        this.ctx.fillStyle = '#8FBC8F';
        this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
        
        // Grass and trees
        this.drawEnvironment();
    }

    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // Cloud 1
        this.ctx.beginPath();
        this.ctx.arc(100, 80, 30, 0, Math.PI * 2);
        this.ctx.arc(130, 70, 35, 0, Math.PI * 2);
        this.ctx.arc(160, 80, 30, 0, Math.PI * 2);
        this.ctx.fill();

        // Cloud 2
        this.ctx.beginPath();
        this.ctx.arc(400, 60, 25, 0, Math.PI * 2);
        this.ctx.arc(430, 50, 30, 0, Math.PI * 2);
        this.ctx.arc(460, 60, 25, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawEnvironment() {
        // Grass
        this.ctx.fillStyle = '#7CFC00';
        for (let i = 0; i < this.canvas.width; i += 10) {
            this.ctx.fillRect(i, this.canvas.height - 50, 3, -10 - Math.random() * 10);
        }

        // Trees
        this.drawTree(100, 150, 30, 200);
        this.drawTree(400, 180, 30, 170);
    }

    drawTree(x, y, width, height) {
        // Trunk
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x, y, width, height);
        
        // Leaves
        this.ctx.fillStyle = '#228B22';
        this.ctx.beginPath();
        this.ctx.arc(x + width/2, y - 30, 50, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawPooh() {
        // Body
        this.ctx.fillStyle = '#FFB347';
        this.ctx.beginPath();
        this.ctx.arc(this.poohX, this.canvas.height - 70, 30, 0, Math.PI * 2);
        this.ctx.fill();

        // Shirt
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.poohX - 25, this.canvas.height - 70, 50, 30);

        // Face and details
        this.drawPoohFace();
        this.drawPoohDetails();
    }

    drawPoohFace() {
        // Face
        this.ctx.fillStyle = '#FFB347';
        this.ctx.beginPath();
        this.ctx.arc(this.poohX, this.canvas.height - 100, 25, 0, Math.PI * 2);
        this.ctx.fill();

        // Eyes
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(this.poohX - 10, this.canvas.height - 105, 5, 0, Math.PI * 2);
        this.ctx.arc(this.poohX + 10, this.canvas.height - 105, 5, 0, Math.PI * 2);
        this.ctx.fill();

        // Nose
        this.ctx.beginPath();
        this.ctx.arc(this.poohX, this.canvas.height - 95, 8, 0, Math.PI * 2);
        this.ctx.fill();

        // Smile
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.poohX, this.canvas.height - 90, 10, 0.2, Math.PI - 0.2, false);
        this.ctx.stroke();

        // Ears
        this.ctx.fillStyle = '#FFB347';
        this.ctx.beginPath();
        this.ctx.arc(this.poohX - 20, this.canvas.height - 120, 10, 0, Math.PI * 2);
        this.ctx.arc(this.poohX + 20, this.canvas.height - 120, 10, 0, Math.PI * 2);
        this.ctx.fill();

        // Arms
        this.ctx.fillRect(this.poohX - 40, this.canvas.height - 80, 15, 10);
        this.ctx.fillRect(this.poohX + 25, this.canvas.height - 80, 15, 10);
    }

    drawPoohDetails() {
        // Shirt detail
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.poohX, this.canvas.height - 70);
        this.ctx.lineTo(this.poohX, this.canvas.height - 40);
        this.ctx.stroke();
    }

    drawHoneyPots() {
        this.honeyPots.forEach(pot => {
            // Pot body
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(pot.x, pot.y, 15, 0, Math.PI * 2);
            this.ctx.fill();

            // Outline
            this.ctx.strokeStyle = '#8B4513';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();

            // Handle
            this.ctx.beginPath();
            this.ctx.arc(pot.x, pot.y - 15, 5, 0, Math.PI, false);
            this.ctx.stroke();

            // Honey drip
            this.ctx.fillStyle = '#FFA500';
            this.ctx.beginPath();
            this.ctx.moveTo(pot.x - 5, pot.y + 10);
            this.ctx.bezierCurveTo(
                pot.x - 2, pot.y + 15,
                pot.x + 2, pot.y + 15,
                pot.x + 5, pot.y + 10
            );
            this.ctx.fill();
        });
    }

    drawBees() {
        this.bees.forEach(bee => {
            // Body
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(bee.x, bee.y, 10, 0, Math.PI * 2);
            this.ctx.fill();

            // Stripes
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(bee.x - 10, bee.y - 3, 5, 6);
            this.ctx.fillRect(bee.x, bee.y - 3, 5, 6);

            // Wings
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.beginPath();
            this.ctx.arc(bee.x - 5, bee.y - 10, 8, 0, Math.PI * 2);
            this.ctx.arc(bee.x + 5, bee.y - 10, 8, 0, Math.PI * 2);
            this.ctx.fill();

            // Stinger
            this.ctx.fillStyle = 'black';
            this.ctx.beginPath();
            this.ctx.moveTo(bee.x + 10, bee.y);
            this.ctx.lineTo(bee.x + 15, bee.y);
            this.ctx.lineTo(bee.x + 10, bee.y - 3);
            this.ctx.fill();
        });
    }

    drawUI() {
        this.ctx.fillStyle = '#5c3d0a';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 20, 30);
        this.ctx.fillText(`Time: ${this.timeLeft}s`, this.canvas.width - 100, 30);
        this.ctx.fillText(`Lives: ${this.lives}`, this.canvas.width / 2 - 40, 30);
    }

    updateUI() {
        document.getElementById('score-count').textContent = this.score;
        document.getElementById('time-count').textContent = this.timeLeft;
        document.getElementById('catch-lives').textContent = this.lives;
    }

    endGame() {
        this.gameRunning = false;
        clearInterval(this.gameInterval);
        clearInterval(this.timerInterval);

        const message = this.lives <= 0 ? 
            `Oh bother! You got stung too many times! Final score: ${this.score}` :
            `Time's up! You collected ${this.score} honey points!`;
        
        alert(message);
    }

    handleResize() {
        // Handle canvas resize if needed
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.draw();
    }
}

// Tower Defense Game Class
class TowerDefenseGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.init();
    }

    init() {
        this.gameState = {
            honey: 100,
            lives: 10,
            wave: 1,
            selectedTower: 'pooh',
            towers: [],
            enemies: [],
            projectiles: [],
            isWaveActive: false,
            lastSpawnTime: 0
        };

        this.towerTypes = this.createTowerTypes();
        this.enemyTypes = this.createEnemyTypes();
        this.path = this.createPath();

        this.setupEventListeners();
        this.draw();
        this.gameInterval = setInterval(() => this.gameLoop(), 16);
    }

    createTowerTypes() {
        return {
            pooh: { cost: 20, damage: 10, range: 100, fireRate: 1000, color: '#FFB347', character: '🐻' },
            tigger: { cost: 30, damage: 15, range: 80, fireRate: 800, color: '#FF8C42', character: '🐯' },
            rabbit: { cost: 40, damage: 20, range: 120, fireRate: 1500, color: '#C1E1C1', character: '🐰' },
            piglet: { cost: 25, damage: 8, range: 90, fireRate: 600, color: '#FFB6C1', character: '🐷' },
            eeyore: { cost: 35, damage: 25, range: 110, fireRate: 2000, color: '#C0C0C0', character: '🐴' }
        };
    }

    createEnemyTypes() {
        return {
            heffalump: { health: 50, speed: 1, color: '#8A2BE2', points: 10, character: '🐘' },
            woozle: { health: 30, speed: 2, color: '#FF4500', points: 15, character: '🐺' },
            bee: { health: 20, speed: 3, color: '#FFD700', points: 5, character: '🐝' }
        };
    }

    createPath() {
        return [
            { x: 0, y: 200 },
            { x: 200, y: 200 },
            { x: 200, y: 100 },
            { x: 400, y: 100 },
            { x: 400, y: 300 },
            { x: 520, y: 300 }
        ];
    }

    setupEventListeners() {
        // Tower placement
        this.canvas.addEventListener('click', (e) => this.placeTower(e));

        // Tower selection
        document.querySelectorAll('.tower-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.tower-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                this.gameState.selectedTower = option.getAttribute('data-tower');
            });
        });

        // Game controls
        document.getElementById('start-defense')?.addEventListener('click', () => this.startWave());
        document.getElementById('upgrade-tower')?.addEventListener('click', () => this.upgradeTowers());
    }

    gameLoop() {
        this.update();
        this.draw();
    }

    update() {
        if (!this.gameState.isWaveActive) return;

        this.moveEnemies();
        this.handleTowerShooting();
        this.moveProjectiles();
        this.spawnEnemies();
        this.checkWaveComplete();
        this.checkGameOver();
    }

    moveEnemies() {
        this.gameState.enemies.forEach((enemy, index) => {
            const nextPoint = this.path[enemy.pathIndex];
            const dx = nextPoint.x - enemy.x;
            const dy = nextPoint.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 1) {
                enemy.pathIndex++;
                if (enemy.pathIndex >= this.path.length) {
                    this.gameState.lives--;
                    this.updateUI();
                    this.gameState.enemies.splice(index, 1);
                    return;
                }
            } else {
                enemy.x += (dx / distance) * enemy.speed;
                enemy.y += (dy / distance) * enemy.speed;
            }
        });
    }

    handleTowerShooting() {
        this.gameState.towers.forEach(tower => {
            if (tower.cooldown > 0) {
                tower.cooldown -= 16;
                return;
            }

            const target = this.findTarget(tower);
            if (target) {
                this.createProjectile(tower, target);
                tower.cooldown = tower.fireRate;
            }
        });
    }

    findTarget(tower) {
        let target = null;
        let minDistance = tower.range;

        this.gameState.enemies.forEach(enemy => {
            const dx = enemy.x - tower.x;
            const dy = enemy.y - tower.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                minDistance = distance;
                target = enemy;
            }
        });

        return target;
    }

    createProjectile(tower, target) {
        this.gameState.projectiles.push({
            x: tower.x,
            y: tower.y,
            startX: tower.x,
            startY: tower.y,
            target: target,
            damage: tower.damage,
            color: tower.color,
            speed: 5
        });
    }

    moveProjectiles() {
        this.gameState.projectiles.forEach((projectile, index) => {
            if (!projectile.target || projectile.target.health <= 0) {
                this.gameState.projectiles.splice(index, 1);
                return;
            }

            const dx = projectile.target.x - projectile.x;
            const dy = projectile.target.y - projectile.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 10) {
                this.handleProjectileHit(projectile, index);
            } else {
                projectile.x += (dx / distance) * projectile.speed;
                projectile.y += (dy / distance) * projectile.speed;
            }
        });
    }

    handleProjectileHit(projectile, index) {
        projectile.target.health -= projectile.damage;

        if (projectile.target.health <= 0) {
            this.gameState.honey += projectile.target.points;
            this.updateUI();
            const enemyIndex = this.gameState.enemies.indexOf(projectile.target);
            if (enemyIndex > -1) {
                this.gameState.enemies.splice(enemyIndex, 1);
            }
        }

        this.gameState.projectiles.splice(index, 1);
    }

    spawnEnemies() {
        const currentTime = Date.now();
        if (currentTime - this.gameState.lastSpawnTime > 1000 && 
            this.gameState.enemies.length < 5 + this.gameState.wave * 2) {
            
            this.gameState.lastSpawnTime = currentTime;
            this.createRandomEnemy();
        }
    }

    createRandomEnemy() {
        const enemyTypesArray = ['heffalump', 'woozle', 'bee'];
        const randomType = enemyTypesArray[Math.floor(Math.random() * enemyTypesArray.length)];
        const enemyProps = this.enemyTypes[randomType];

        this.gameState.enemies.push({
            x: this.path[0].x,
            y: this.path[0].y,
            pathIndex: 1,
            health: enemyProps.health,
            maxHealth: enemyProps.health,
            speed: enemyProps.speed,
            color: enemyProps.color,
            points: enemyProps.points,
            character: enemyProps.character
        });
    }

    checkWaveComplete() {
        const currentTime = Date.now();
        if (this.gameState.enemies.length === 0 && currentTime - this.gameState.lastSpawnTime > 3000) {
            this.gameState.isWaveActive = false;
            this.gameState.wave++;
            this.gameState.honey += 30;
            this.updateUI();
        }
    }

    checkGameOver() {
        if (this.gameState.lives <= 0) {
            clearInterval(this.gameInterval);
            alert("Oh bother! The Heffalumps and Woozles got all your honey! Game Over!");
            this.reset();
        }
    }

    placeTower(event) {
        if (this.gameState.isWaveActive) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (this.isValidPosition(x, y) && this.canAffordTower()) {
            this.gameState.honey -= this.towerTypes[this.gameState.selectedTower].cost;
            this.updateUI();

            this.gameState.towers.push({
                x: x,
                y: y,
                type: this.gameState.selectedTower,
                damage: this.towerTypes[this.gameState.selectedTower].damage,
                range: this.towerTypes[this.gameState.selectedTower].range,
                fireRate: this.towerTypes[this.gameState.selectedTower].fireRate,
                color: this.towerTypes[this.gameState.selectedTower].color,
                character: this.towerTypes[this.gameState.selectedTower].character,
                cooldown: 0,
                level: 1,
                selected: false
            });
        }
    }

    isValidPosition(x, y) {
        // Check if position is not on path
        for (let i = 0; i < this.path.length - 1; i++) {
            const p1 = this.path[i];
            if (Math.abs(x - p1.x) < 30 && Math.abs(y - p1.y) < 30) {
                return false;
            }
        }
        return true;
    }

    canAffordTower() {
        return this.gameState.honey >= this.towerTypes[this.gameState.selectedTower].cost;
    }

    startWave() {
        if (this.gameState.isWaveActive) return;

        this.gameState.isWaveActive = true;
        this.gameState.lastSpawnTime = Date.now();
    }

    upgradeTowers() {
        if (this.gameState.honey >= 50) {
            this.gameState.honey -= 50;
            this.updateUI();

            this.gameState.towers.forEach(tower => {
                tower.damage += 5;
                tower.range += 10;
                tower.level++;
            });
        }
    }

    reset() {
        this.gameState = {
            honey: 100,
            lives: 10,
            wave: 1,
            selectedTower: 'pooh',
            towers: [],
            enemies: [],
            projectiles: [],
            isWaveActive: false,
            lastSpawnTime: 0
        };

        this.updateUI();
        this.gameInterval = setInterval(() => this.gameLoop(), 16);
    }

    updateUI() {
        document.getElementById('honey-count').textContent = this.gameState.honey;
        document.getElementById('lives-count').textContent = this.gameState.lives;
        document.getElementById('wave-count').textContent = this.gameState.wave;
    }

    draw() {
        this.drawBackground();
        this.drawTowers();
        this.drawEnemies();
        this.drawProjectiles();
    }

    drawBackground() {
        // Sky
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Clouds
        this.drawClouds();
        
        // Ground
        this.ctx.fillStyle = '#8FBC8F';
        this.ctx.fillRect(0, this.canvas.height - 100, this.canvas.width, 100);
        
        // Path
        this.drawPath();
        
        // Trees and honey pot
        this.drawEnvironment();
    }

    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // Cloud 1
        this.ctx.beginPath();
        this.ctx.arc(100, 80, 30, 0, Math.PI * 2);
        this.ctx.arc(130, 70, 35, 0, Math.PI * 2);
        this.ctx.arc(160, 80, 30, 0, Math.PI * 2);
        this.ctx.fill();

        // Cloud 2
        this.ctx.beginPath();
        this.ctx.arc(400, 60, 25, 0, Math.PI * 2);
        this.ctx.arc(430, 50, 30, 0, Math.PI * 2);
        this.ctx.arc(460, 60, 25, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawPath() {
        // Main path
        this.ctx.strokeStyle = '#D2B48C';
        this.ctx.lineWidth = 40;
        this.ctx.beginPath();
        this.ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) {
            this.ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        this.ctx.stroke();

        // Path border
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) {
            this.ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        this.ctx.stroke();
    }

    drawEnvironment() {
        // Trees
        this.drawTree(50, 50, 20, 100);
        this.drawTree(350, 250, 20, 100);

        // Honey pot
        this.drawHoneyPot();
    }

    drawTree(x, y, width, height) {
        // Trunk
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x, y, width, height);
        
        // Leaves
        this.ctx.fillStyle = '#228B22';
        this.ctx.beginPath();
        this.ctx.arc(x + width/2, y - 10, 40, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawHoneyPot() {
        const endX = this.canvas.width - 30;
        const endY = this.path[this.path.length - 1].y;

        // Honey pot
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(endX, endY, 20, 0, Math.PI * 2);
        this.ctx.fill();

        // Outline
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Honey drip
        this.ctx.fillStyle = '#FFA500';
        this.ctx.beginPath();
        this.ctx.moveTo(endX, endY + 20);
        this.ctx.bezierCurveTo(
            endX - 5, endY + 30,
            endX + 5, endY + 40,
            endX, endY + 50
        );
        this.ctx.fill();
    }

    drawTowers() {
        this.gameState.towers.forEach(tower => {
            // Base
            this.ctx.fillStyle = tower.color;
            this.ctx.beginPath();
            this.ctx.arc(tower.x, tower.y, 20, 0, Math.PI * 2);
            this.ctx.fill();

            // Border
            this.ctx.strokeStyle = '#8B4513';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Character
            this.ctx.font = '24px Arial';
            this.ctx.fillStyle = '#000';
            this.ctx.fillText(tower.character, tower.x - 10, tower.y + 8);

            // Level
            this.ctx.fillStyle = '#8B4513';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(`Lv.${tower.level}`, tower.x - 10, tower.y - 25);

            // Range indicator
            if (tower.selected) {
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                this.ctx.beginPath();
                this.ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        });
    }

    drawEnemies() {
        this.gameState.enemies.forEach(enemy => {
            // Body
            this.ctx.fillStyle = enemy.color;
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, 15, 0, Math.PI * 2);
            this.ctx.fill();

            // Border
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            // Character
            this.ctx.font = '16px Arial';
            this.ctx.fillStyle = '#000';
            this.ctx.fillText(enemy.character, enemy.x - 8, enemy.y + 5);

            // Health bar
            this.drawHealthBar(enemy);
        });
    }

    drawHealthBar(enemy) {
        // Background
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(enemy.x - 15, enemy.y - 25, 30, 5);

        // Health
        this.ctx.fillStyle = 'green';
        const healthWidth = 30 * (enemy.health / enemy.maxHealth);
        this.ctx.fillRect(enemy.x - 15, enemy.y - 25, healthWidth, 5);
    }

    drawProjectiles() {
        this.gameState.projectiles.forEach(projectile => {
            // Projectile
            this.ctx.fillStyle = projectile.color;
            this.ctx.beginPath();
            this.ctx.arc(projectile.x, projectile.y, 5, 0, Math.PI * 2);
            this.ctx.fill();

            // Trail
            this.ctx.strokeStyle = projectile.color;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(projectile.startX, projectile.startY);
            this.ctx.lineTo(projectile.x, projectile.y);
            this.ctx.stroke();
        });
    }

    handleResize() {
        // Handle canvas resize if needed
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.draw();
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new HundredAcreGame();
});

// Global functions for inline event handlers
window.showCharacterModal = function(character) {
    if (window.game) {
        window.game.showCharacterModal(character);
    }
};

window.showGameInstructions = function(gameType) {
    if (window.game) {
        window.game.showGameInstructions(gameType);
    }
};

window.playWoodlandSound = function(event) {
    if (window.game) {
        window.game.playWoodlandSound(event);
    }
};

window.editRSVP = function() {
    if (window.game) {
        window.game.editRSVP();
    }
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes honeyPop {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }
    
    @keyframes bounce {
        0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
        40%, 43% { transform: translate3d(0,-20px,0); }
        70% { transform: translate3d(0,-10px,0); }
        90% { transform: translate3d(0,-4px,0); }
    }
    
    @keyframes confetti-fall {
        0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
    }
    
    .confetti {
        animation: confetti-fall 3s ease-in forwards;
        position: absolute;
    }
`;
document.head.appendChild(style);

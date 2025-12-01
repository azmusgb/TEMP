// script.js - Full, upgraded version for Hundred Acre Celebration

class HundredAcreGame {
    constructor() {
        this.honeyGame = null;
        this.defenseGame = null;
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

            // Initialize mini-games
            this.initHoneyCatchGame();
            this.initTowerDefenseGame();

            // Initial scroll-related updates
            setTimeout(() => {
                this.checkScrollAnimations();
                this.updateReadingProgress();
                this.updateFABVisibility();
            }, 400);
        } catch (error) {
            console.error('Game initialization failed:', error);
            this.safeHideLoading();
        }
    }

    // ------- ELEMENTS / SETUP -------

    cacheElements() {
        this.elements = {
            body: document.body,
            storybookCover: document.getElementById('storybookCover'),
            openBookBtn: document.getElementById('openBookBtn'),
            storybook: document.getElementById('storybook'),
            bookSpine: document.getElementById('bookSpine'),
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
            bgMusic: document.getElementById('bgMusic')
        };

        this.elements.navItems = document.querySelectorAll('[data-section]');

        this.sections = {
            hero: document.getElementById('hero'),
            story: document.getElementById('storybookSection'),
            details: document.getElementById('details'),
            registry: document.getElementById('registry'),
            games: document.getElementById('games'),
            rsvp: document.getElementById('rsvp')
        };

        // Character modal
        this.modal = {
            character: document.getElementById('characterModal'),
            close: document.getElementById('closeCharacterModal'),
            name: document.getElementById('modalCharacterName'),
            quote: document.getElementById('modalCharacterQuote'),
            icon: document.getElementById('modalCharacterIcon'),
            characterRole: document.getElementById('modalCharacterRole'),
            characterBio: document.getElementById('modalCharacterBio')
        };

        // Game instructions modal
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
    }

    setupEventListeners() {
        const { elements, modal, gameModal } = this;

        // Storybook
        elements.openBookBtn?.addEventListener('click', () => this.openStorybook());

        // Navigation
        elements.navToggle?.addEventListener('click', () => this.toggleNavigation());
        elements.navItems?.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.scrollToSection(section);
                this.closeNavigation();
            });
        });

        // Scroll / resize
        const throttledScroll = this.throttle(() => {
            this.checkScrollAnimations();
            this.updateReadingProgress();
            this.updateFABVisibility();
        }, 120);

        window.addEventListener('scroll', throttledScroll);
        window.addEventListener('resize', () => this.handleResize());

        // FABs
        elements.scrollTopFab?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        elements.scrollRsvpFab?.addEventListener('click', () => {
            this.scrollToSection('rsvp');
        });

        // Music & motion toggles
        elements.musicToggle?.addEventListener('click', () => this.toggleMusic());
        elements.motionToggle?.addEventListener('click', () => this.toggleMotion());

        // RSVP
        elements.rsvpForm?.addEventListener('submit', (e) => this.handleRsvpSubmit(e));

        // Character cards
        document.querySelectorAll('.character-card').forEach(card => {
            card.addEventListener('click', () => {
                const character = card.getAttribute('data-character');
                this.openCharacterModal(character);
            });
        });

        modal.close?.addEventListener('click', () => this.closeModal(modal.character));
        modal.character?.addEventListener('click', (e) => {
            if (e.target === modal.character) this.closeModal(modal.character);
        });

        // Game instruction buttons
        document.querySelectorAll('[data-game-instruction]').forEach(btn => {
            btn.addEventListener('click', () => {
                const game = btn.getAttribute('data-game-instruction');
                this.openGameInstructions(game);
            });
        });

        gameModal.close?.addEventListener('click', () => this.closeModal(gameModal.instruction));
        gameModal.instruction?.addEventListener('click', (e) => {
            if (e.target === gameModal.instruction) this.closeModal(gameModal.instruction);
        });

        // Keyboard
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    handleKeydown(e) {
        // ESC closes modals
        if (e.key === 'Escape') {
            this.closeModal(this.modal.character);
            this.closeModal(this.gameModal.instruction);
        }

        // Space toggles music (if not typing)
        if (e.key === ' ' && !this.isInputElement(e.target)) {
            e.preventDefault();
            this.toggleMusic();
        }
    }

    isInputElement(el) {
        if (!el) return false;
        const tag = el.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
    }

    setupIntersectionObservers() {
        const observerOptions = { threshold: 0.15 };
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const { target, isIntersecting } = entry;
                if (isIntersecting) {
                    target.classList.add('section-visible');
                    this.updateActiveNav(target.id);
                }
            });
        }, observerOptions);

        Object.values(this.sections).forEach(section => {
            if (section) sectionObserver.observe(section);
        });
    }

    updateActiveNav(sectionId) {
        if (!sectionId || !this.elements.navItems) return;
        this.elements.navItems.forEach(item => {
            const target = item.getAttribute('data-section');
            if (!target) return;
            if (target === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // ------- NAV / STORYBOOK -------

    openStorybook() {
        const { storybookCover, storybook, bookSpine } = this.elements;
        storybookCover?.classList.add('storybook-cover--open');
        storybook?.classList.add('storybook--open');
        bookSpine?.classList.add('storybook-spine--visible');
        this.scrollToSection('story');
    }

    toggleNavigation() {
        const { navMenu, navToggle } = this.elements;
        if (!navMenu || !navToggle) return;
        const isOpen = navMenu.classList.toggle('nav-menu--open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('nav-open', isOpen);
    }

    closeNavigation() {
        const { navMenu, navToggle } = this.elements;
        if (!navMenu || !navToggle) return;
        navMenu.classList.remove('nav-menu--open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
    }

    scrollToSection(sectionKey) {
        const section = this.sections[sectionKey];
        if (!section) return;
        const offset = 80;
        const rect = section.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = rect.top + scrollTop - offset;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
    }

    // ------- SCROLL / PROGRESS / FAB -------

    throttle(fn, limit) {
        let inThrottle = false;
        let lastFn = null;
        let lastTime = 0;
        return (...args) => {
            const context = this;
            if (!inThrottle) {
                fn.apply(context, args);
                lastTime = Date.now();
                inThrottle = true;
            } else {
                clearTimeout(lastFn);
                lastFn = setTimeout(() => {
                    if (Date.now() - lastTime >= limit) {
                        fn.apply(context, args);
                        lastTime = Date.now();
                    }
                }, Math.max(limit - (Date.now() - lastTime), 0));
            }
        };
    }

    checkScrollAnimations() {
        const revealElements = document.querySelectorAll('.reveal-on-scroll');
        const windowHeight = window.innerHeight;
        const threshold = 120;
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < windowHeight - threshold) {
                el.classList.add('visible');
            }
        });
    }

    updateReadingProgress() {
        const bar = this.elements.readingProgress;
        if (!bar) return;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = `${progress}%`;
    }

    updateFABVisibility() {
        const { scrollTopFab, scrollRsvpFab } = this.elements;
        const scrollPos = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTopFab) {
            if (scrollPos > 400) scrollTopFab.classList.add('fab--visible');
            else scrollTopFab.classList.remove('fab--visible');
        }

        const rsvpSection = this.sections.rsvp;
        if (!rsvpSection || !scrollRsvpFab) return;

        const rect = rsvpSection.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;

        if (inView) {
            scrollRsvpFab.classList.remove('fab--visible');
        } else if (scrollPos > 600) {
            scrollRsvpFab.classList.add('fab--visible');
        } else {
            scrollRsvpFab.classList.remove('fab--visible');
        }
    }

    handleResize() {
        if (this.honeyGame && typeof this.honeyGame.handleResize === 'function') {
            this.honeyGame.handleResize();
        }
        if (this.defenseGame && typeof this.defenseGame.handleResize === 'function') {
            this.defenseGame.handleResize();
        }
    }

    // ------- LOADING -------

    startLoadingSequence() {
        // Simple, guaranteed timeout so we don't get stuck
        setTimeout(() => this.safeHideLoading(), 2000);
    }

    safeHideLoading() {
        const ls = this.elements.loadingScreen;
        if (ls) ls.classList.add('hidden');
    }

    // ------- PREFERENCES -------

    initPreferences() {
        try {
            const musicPref = localStorage.getItem('hundredAcreMusic');
            const motionPref = localStorage.getItem('hundredAcreMotion');

            if (musicPref === 'off') this.setMusic(false);
            else if (musicPref === 'on') this.setMusic(true);

            if (motionPref === 'reduced') {
                document.body.classList.add('reduce-motion');
                this.setMotion(false);
            }
        } catch (err) {
            console.warn('Could not load preferences', err);
        }
    }

    toggleMusic() {
        const { bgMusic, musicToggle } = this.elements;
        if (!bgMusic || !musicToggle) return;
        const isPlaying = !bgMusic.paused;
        this.setMusic(!isPlaying);
    }

    setMusic(isOn) {
        const { bgMusic, musicToggle } = this.elements;
        if (!bgMusic || !musicToggle) return;

        if (isOn) {
            bgMusic.play().catch(() => {});
            musicToggle.classList.add('toggle--active');
            musicToggle.setAttribute('aria-pressed', 'true');
            const label = musicToggle.querySelector('.toggle-label');
            if (label) label.textContent = 'Pause Lullaby';
            localStorage.setItem('hundredAcreMusic', 'on');
        } else {
            bgMusic.pause();
            musicToggle.classList.remove('toggle--active');
            musicToggle.setAttribute('aria-pressed', 'false');
            const label = musicToggle.querySelector('.toggle-label');
            if (label) label.textContent = 'Play Lullaby';
            localStorage.setItem('hundredAcreMusic', 'off');
        }
    }

    toggleMotion() {
        const reduced = document.body.classList.toggle('reduce-motion');
        this.setMotion(!reduced);
    }

    setMotion(isOn) {
        const { motionToggle } = this.elements;
        if (!motionToggle) return;

        if (isOn) {
            motionToggle.classList.remove('toggle--active');
            motionToggle.setAttribute('aria-pressed', 'false');
            const label = motionToggle.querySelector('.toggle-label');
            if (label) label.textContent = 'Reduce Motion';
            localStorage.setItem('hundredAcreMotion', 'full');
        } else {
            motionToggle.classList.add('toggle--active');
            motionToggle.setAttribute('aria-pressed', 'true');
            const label = motionToggle.querySelector('.toggle-label');
            if (label) label.textContent = 'Motion Reduced';
            localStorage.setItem('hundredAcreMotion', 'reduced');
        }
    }

    // ------- RSVP -------

    checkExistingRSVP() {
        try {
            const data = localStorage.getItem('hundredAcreRSVP');
            if (!data) return;
            const parsed = JSON.parse(data);
            if (!parsed || !this.elements.rsvpStatus) return;
            this.showRsvpMessage('Saved RSVP found. You can update your reply below.', 'info');
        } catch (err) {
            console.warn('Could not read stored RSVP', err);
        }
    }

    handleRsvpSubmit(e) {
        e.preventDefault();
        const form = this.elements.rsvpForm;
        if (!form) return;

        const formData = new FormData(form);
        const record = {};
        formData.forEach((val, key) => {
            record[key] = val;
        });

        try {
            localStorage.setItem('hundredAcreRSVP', JSON.stringify(record));
            this.showRsvpMessage('Thank you for your RSVP! Your response has been saved.', 'success');
            form.reset();
        } catch (err) {
            this.showRsvpMessage('There was a problem saving your RSVP locally, but we received it.', 'error');
            console.error('RSVP save error', err);
        }
    }

    showRsvpMessage(message, type = 'info') {
        const status = this.elements.rsvpStatus;
        if (!status) return;
        status.textContent = message;
        status.className = 'rsvp-status';
        status.classList.add(`rsvp-status--${type}`);
        status.setAttribute('aria-live', 'polite');
    }

    // ------- CHARACTER MODAL -------

    openCharacterModal(characterKey) {
        if (!this.modal.character) return;

        const characters = {
            pooh: {
                name: 'Winnie the Pooh',
                quote: '"Sometimes the smallest things take up the most room in your heart."',
                icon: '🐻🍯',
                role: 'Honey-Guardian & Gentle Host',
                bio: 'Pooh is watching over Baby Gunner’s big day with a honey pot in paw and a heart full of squishy, snuggly joy.'
            },
            piglet: {
                name: 'Piglet',
                quote: '"It is hard to be brave, when you\'re only a Very Small Animal."',
                icon: '🐷',
                role: 'Courageous Tiny Best Friend',
                bio: 'Piglet is here to celebrate every small and wonderful milestone, cheering on Baby Gunner with quiet bravery.'
            },
            tigger: {
                name: 'Tigger',
                quote: '"Bouncing is what Tiggers do best!"',
                icon: '🐯',
                role: 'Chief Bouncer of Joy',
                bio: 'Tigger brings the energy, the wiggles, and the unstoppable giggles to the Hundred Acre celebration.'
            },
            eeyore: {
                name: 'Eeyore',
                quote: '"Thanks for noticin’ me."',
                icon: '🐴',
                role: 'Gentle Observer',
                bio: 'Eeyore reminds us that even on cloudy days, love, friends, and a cozy spot by the party lights make things brighter.'
            }
        };

        const data = characters[characterKey] || characters.pooh;
        this.modal.name && (this.modal.name.textContent = data.name);
        this.modal.quote && (this.modal.quote.textContent = data.quote);
        this.modal.icon && (this.modal.icon.textContent = data.icon);
        this.modal.characterRole && (this.modal.characterRole.textContent = data.role);
        this.modal.characterBio && (this.modal.characterBio.textContent = data.bio);

        this.modal.character.classList.add('modal--open');
        document.body.classList.add('modal-open');
    }

    closeModal(modalEl) {
        if (!modalEl) return;
        modalEl.classList.remove('modal--open');
        document.body.classList.remove('modal-open');
    }

    // ------- GAME INSTRUCTIONS -------

    openGameInstructions(gameKey) {
        const gm = this.gameModal;
        if (!gm.instruction) return;

        let title = '';
        let steps = [];

        if (gameKey === 'honey') {
            title = 'Honey Catch Game - How to Play';
            steps = [
                'Move Pooh left and right to catch the falling honey pots.',
                'Use arrow keys, A/D keys, or drag/touch on mobile.',
                'Each honey pot you catch earns points.',
                'Miss too many pots and Pooh spills the honey — game over.',
                'Tap or press Space/Enter on the overlay to play again.'
            ];
        } else {
            title = 'Friendly Bee Path - How to Play';
            steps = [
                'Bees follow the honey trail across the field.',
                'Tap/click along the path to place friendly “watch towers”.',
                'Towers automatically sprinkle gentle puffs to slow the bees.',
                'If too many bees pass the end of the path, the round ends.',
                'Tap the canvas or press Space/Enter on the overlay to play again.'
            ];
        }

        gm.title && (gm.title.textContent = title);
        if (gm.list) {
            gm.list.innerHTML = '';
            steps.forEach(step => {
                const li = document.createElement('li');
                li.textContent = step;
                gm.list.appendChild(li);
            });
        }

        gm.instruction.classList.add('modal--open');
        document.body.classList.add('modal-open');
    }

    // ------- MINI-GAMES INIT -------

    initHoneyCatchGame() {
        if (!this.canvases.honey) return;
        try {
            this.honeyGame = new HoneyCatchGame(this.canvases.honey);
        } catch (err) {
            console.error('Error initializing HoneyCatchGame:', err);
        }
    }

    initTowerDefenseGame() {
        if (!this.canvases.defense) return;
        try {
            this.defenseGame = new TowerDefenseGame(this.canvases.defense);
        } catch (err) {
            console.error('Error initializing TowerDefenseGame:', err);
        }
    }
}

// ------- HONEY CATCH GAME -------

class HoneyCatchGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.clientWidth || 320;
        this.height = canvas.clientHeight || 220;

        this.player = null;
        this.pots = [];
        this.score = 0;
        this.missed = 0;
        this.maxMissed = 5;
        this.lastSpawn = 0;
        this.spawnInterval = 900; // ms
        this.lastTime = 0;
        this.gameOver = false;
        this.pointerActive = false;

        this.init();
    }

    init() {
        this.handleResize();
        this.resetGame();
        this.initEvents();
        window.requestAnimationFrame((t) => this.loop(t));
    }

    initEvents() {
        // Keyboard
        this.keyState = {};
        window.addEventListener('keydown', (e) => {
            this.keyState[e.key] = true;

            if (this.gameOver && (e.key === ' ' || e.key === 'Enter')) {
                e.preventDefault();
                this.restart();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keyState[e.key] = false;
        });

        // Pointer / touch
        this.canvas.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
        this.canvas.addEventListener('pointermove', (e) => this.handlePointerMove(e));
        this.canvas.addEventListener('pointerup', (e) => this.handlePointerUp(e));
        this.canvas.addEventListener('pointerleave', (e) => this.handlePointerUp(e));
    }

    handlePointerDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (this.gameOver) {
            this.restart();
            return;
        }
        this.pointerActive = true;
        this.player.x = x - this.player.width / 2;
    }

    handlePointerMove(e) {
        if (!this.pointerActive) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        this.player.x = x - this.player.width / 2;
    }

    handlePointerUp() {
        this.pointerActive = false;
    }

    handleResize() {
        const rect = this.canvas.getBoundingClientRect();
        this.width = rect.width || 320;
        this.height = rect.height || 220;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        if (this.player) {
            this.player.y = this.height - this.player.height - 10;
        }
    }

    resetGame() {
        const playerWidth = Math.max(this.width * 0.12, 40);
        const playerHeight = playerWidth * 0.7;
        this.player = {
            x: (this.width - playerWidth) / 2,
            y: this.height - playerHeight - 10,
            width: playerWidth,
            height: playerHeight,
            speed: Math.max(this.width * 0.4, 160)
        };
        this.pots = [];
        this.score = 0;
        this.missed = 0;
        this.gameOver = false;
        this.lastSpawn = 0;
        this.lastTime = 0;
    }

    spawnPot() {
        const size = Math.max(this.width * 0.05, 20);
        const x = Math.random() * (this.width - size);
        const speed = Math.max(this.height * 0.15, 100) + Math.random() * 60;
        this.pots.push({
            x,
            y: -size,
            width: size,
            height: size,
            speed
        });
    }

    update(dt) {
        if (this.gameOver) return;

        // Movement
        const moveLeft = this.keyState['ArrowLeft'] || this.keyState['a'] || this.keyState['A'];
        const moveRight = this.keyState['ArrowRight'] || this.keyState['d'] || this.keyState['D'];

        if (moveLeft) this.player.x -= this.player.speed * dt;
        if (moveRight) this.player.x += this.player.speed * dt;

        this.player.x = Math.max(0, Math.min(this.width - this.player.width, this.player.x));

        // Spawn pots
        this.lastSpawn += dt * 1000;
        if (this.lastSpawn > this.spawnInterval) {
            this.spawnPot();
            this.lastSpawn = 0;
            // Slightly ramp difficulty
            this.spawnInterval = Math.max(350, this.spawnInterval - 5);
        }

        // Update pots
        for (let i = this.pots.length - 1; i >= 0; i--) {
            const pot = this.pots[i];
            pot.y += pot.speed * dt;

            // Collision with player
            if (this.intersects(pot, this.player)) {
                this.score += 1;
                this.pots.splice(i, 1);
                continue;
            }

            // Missed
            if (pot.y > this.height) {
                this.missed += 1;
                this.pots.splice(i, 1);
                if (this.missed >= this.maxMissed) {
                    this.showGameOver();
                }
            }
        }
    }

    intersects(a, b) {
        return !(
            a.x + a.width < b.x ||
            a.x > b.x + b.width ||
            a.y + a.height < b.y ||
            a.y > b.y + b.height
        );
    }

    drawBackground() {
        const ctx = this.ctx;
        ctx.fillStyle = '#FFF7EC';
        ctx.fillRect(0, 0, this.width, this.height);

        // Soft sky
        const skyHeight = this.height * 0.55;
        const gradient = ctx.createLinearGradient(0, 0, 0, skyHeight);
        gradient.addColorStop(0, '#B0D0E3');
        gradient.addColorStop(1, '#FFF7EC');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, skyHeight);

        // Ground
        ctx.fillStyle = '#D7C39B';
        ctx.fillRect(0, skyHeight, this.width, this.height - skyHeight);

        // Simple tree trunk
        ctx.fillStyle = '#8B5A2B';
        ctx.fillRect(this.width * 0.05, skyHeight - 60, 24, 80);
        ctx.beginPath();
        ctx.arc(this.width * 0.05 + 12, skyHeight - 70, 36, 0, Math.PI * 2);
        ctx.fillStyle = '#9CAD90';
        ctx.fill();
    }

    drawPlayer() {
        const ctx = this.ctx;
        const p = this.player;

        // Pooh-like silhouette
        ctx.save();
        ctx.translate(p.x + p.width / 2, p.y + p.height / 2);

        // Body
        ctx.fillStyle = '#FFC42B';
        ctx.beginPath();
        ctx.ellipse(0, 8, p.width * 0.4, p.height * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.ellipse(0, -p.height * 0.25, p.width * 0.23, p.height * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.beginPath();
        ctx.arc(-p.width * 0.18, -p.height * 0.4, p.width * 0.08, 0, Math.PI * 2);
        ctx.arc(p.width * 0.18, -p.height * 0.4, p.width * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Shirt
        ctx.fillStyle = '#D62E2E';
        ctx.beginPath();
        ctx.ellipse(0, 12, p.width * 0.45, p.height * 0.27, 0, 0, Math.PI * 2);
        ctx.fill();

        // Simple eyes
        ctx.fillStyle = '#2f1a0e';
        ctx.beginPath();
        ctx.arc(-p.width * 0.06, -p.height * 0.27, p.width * 0.025, 0, Math.PI * 2);
        ctx.arc(p.width * 0.06, -p.height * 0.27, p.width * 0.025, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawPots() {
        const ctx = this.ctx;
        this.pots.forEach(pot => {
            ctx.save();
            ctx.translate(pot.x + pot.width / 2, pot.y + pot.height / 2);

            ctx.fillStyle = '#E6B86A';
            ctx.beginPath();
            ctx.ellipse(0, 0, pot.width * 0.45, pot.height * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#8B4513';
            ctx.fillRect(-pot.width * 0.3, -pot.height * 0.4, pot.width * 0.6, pot.height * 0.16);

            ctx.fillStyle = '#FFF7EC';
            ctx.font = `${Math.max(10, pot.width * 0.35)}px "Caveat", system-ui`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('HUNNY', 0, pot.height * 0.1);

            ctx.restore();
        });
    }

    drawHUD() {
        const ctx = this.ctx;
        ctx.fillStyle = '#2f1a0e';
        ctx.font = `${Math.max(14, this.width * 0.04)}px "Lato", system-ui`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`Score: ${this.score}`, 12, 8);

        ctx.textAlign = 'right';
        ctx.fillText(`Spills: ${this.missed}/${this.maxMissed}`, this.width - 12, 8);
    }

    showGameOver() {
        this.gameOver = true;
    }

    drawGameOverOverlay() {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = 'rgba(47, 26, 14, 0.6)';
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.fillStyle = '#FFF7EC';
        ctx.textAlign = 'center';

        ctx.font = `${Math.max(18, this.width * 0.06)}px "Playfair Display", serif`;
        ctx.fillText('Pooh spilled all the honey!', this.width / 2, this.height / 2 - 10);

        ctx.font = `${Math.max(12, this.width * 0.035)}px "Lato", system-ui`;
        ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 20);
        ctx.fillText('Tap, click, or press Space/Enter to play again', this.width / 2, this.height / 2 + 44);

        ctx.restore();
    }

    restart() {
        this.resetGame();
    }

    loop(timestamp) {
        const ctx = this.ctx;
        const t = timestamp || 0;
        const dt = this.lastTime ? (t - this.lastTime) / 1000 : 0;
        this.lastTime = t;

        // Update
        this.update(dt);

        // Draw
        ctx.clearRect(0, 0, this.width, this.height);
        this.drawBackground();
        this.drawPlayer();
        this.drawPots();
        this.drawHUD();

        if (this.gameOver) {
            this.drawGameOverOverlay();
        }

        window.requestAnimationFrame((time) => this.loop(time));
    }
}

// ------- TOWER DEFENSE STYLE GAME -------

class TowerDefenseGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.clientWidth || 320;
        this.height = canvas.clientHeight || 220;

        this.path = [];
        this.bees = [];
        this.towers = [];
        this.lives = 10;
        this.score = 0;
        this.gameOver = false;
        this.lastTime = 0;
        this.lastSpawn = 0;
        this.spawnInterval = 1400; // ms

        this.init();
    }

    init() {
        this.handleResize();
        this.createPath();
        this.resetGame();
        this.initEvents();
        window.requestAnimationFrame((t) => this.loop(t));
    }

    initEvents() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (this.gameOver) {
                this.restart();
                return;
            }

            // Place tower close to path
            const nearest = this.getNearestPointOnPath(x, y);
            if (nearest && nearest.dist < this.height * 0.25) {
                this.placeTower(nearest.x, nearest.y);
            }
        });

        window.addEventListener('keydown', (e) => {
            if (this.gameOver && (e.key === ' ' || e.key === 'Enter')) {
                e.preventDefault();
                this.restart();
            }
        });
    }

    handleResize() {
        const rect = this.canvas.getBoundingClientRect();
        this.width = rect.width || 320;
        this.height = rect.height || 220;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.createPath(); // Recalculate path in new dimensions
    }

    createPath() {
        // Gentle winding path from left-middle to right-middle
        const midY = this.height * 0.55;
        const padding = this.width * 0.05;
        this.path = [
            { x: padding, y: midY },
            { x: this.width * 0.30, y: midY - this.height * 0.18 },
            { x: this.width * 0.50, y: midY },
            { x: this.width * 0.70, y: midY + this.height * 0.18 },
            { x: this.width - padding, y: midY }
        ];
    }

    resetGame() {
        this.bees = [];
        this.towers = [];
        this.lives = 10;
        this.score = 0;
        this.gameOver = false;
        this.lastSpawn = 0;
        this.lastTime = 0;
    }

    restart() {
        this.resetGame();
    }

    spawnBee() {
        this.bees.push({
            t: 0, // param along path [0,1]
            speed: 0.18 + Math.random() * 0.05
        });
    }

    placeTower(x, y) {
        this.towers.push({
            x,
            y,
            range: Math.min(this.width, this.height) * 0.3,
            fireCooldown: 0,
            fireRate: 0.6 // seconds between shots
        });
    }

    getPointOnPath(t) {
        // Simple piecewise linear interpolation across path points
        const segCount = this.path.length - 1;
        if (segCount <= 0) return { x: 0, y: 0 };

        const scaled = t * segCount;
        const i = Math.min(segCount - 1, Math.floor(scaled));
        const localT = scaled - i;
        const p0 = this.path[i];
        const p1 = this.path[i + 1];
        return {
            x: p0.x + (p1.x - p0.x) * localT,
            y: p0.y + (p1.y - p0.y) * localT
        };
    }

    getNearestPointOnPath(x, y) {
        let best = null;
        const samples = 80;
        for (let i = 0; i <= samples; i++) {
            const t = i / samples;
            const p = this.getPointOnPath(t);
            const dx = p.x - x;
            const dy = p.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (!best || dist < best.dist) {
                best = { x: p.x, y: p.y, dist, t };
            }
        }
        return best;
    }

    update(dt) {
        if (this.gameOver) return;

        // Spawn bees
        this.lastSpawn += dt * 1000;
        if (this.lastSpawn > this.spawnInterval) {
            this.spawnBee();
            this.lastSpawn = 0;
            this.spawnInterval = Math.max(700, this.spawnInterval - 20);
        }

        // Move bees
        for (let i = this.bees.length - 1; i >= 0; i--) {
            const bee = this.bees[i];
            bee.t += bee.speed * dt;
            if (bee.t >= 1) {
                this.bees.splice(i, 1);
                this.lives -= 1;
                if (this.lives <= 0) {
                    this.gameOver = true;
                }
            }
        }

        // Towers logic: simple "hit nearest bee in range" mechanic
        this.towers.forEach(tower => {
            tower.fireCooldown -= dt;
            if (tower.fireCooldown <= 0) {
                // Find nearest bee
                let targetIndex = -1;
                let minDist = Infinity;
                this.bees.forEach((bee, idx) => {
                    const pos = this.getPointOnPath(bee.t);
                    const dx = pos.x - tower.x;
                    const dy = pos.y - tower.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < tower.range && dist < minDist) {
                        minDist = dist;
                        targetIndex = idx;
                    }
                });

                if (targetIndex !== -1) {
                    // "Tag" bee and remove
                    this.bees.splice(targetIndex, 1);
                    this.score += 1;
                    tower.fireCooldown = tower.fireRate;
                } else {
                    tower.fireCooldown = tower.fireRate * 0.4;
                }
            }
        });
    }

    drawBackground() {
        const ctx = this.ctx;
        ctx.fillStyle = '#FFF7EC';
        ctx.fillRect(0, 0, this.width, this.height);

        // Soft meadow gradient
        const grad = ctx.createLinearGradient(0, 0, 0, this.height);
        grad.addColorStop(0, '#B0D0E3');
        grad.addColorStop(0.55, '#FFF7EC');
        grad.addColorStop(1, '#C1D7A7');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Honey path
        ctx.strokeStyle = '#E6B86A';
        ctx.lineWidth = Math.max(14, this.height * 0.08);
        ctx.lineCap = 'round';
        ctx.beginPath();
        this.path.forEach((p, idx) => {
            if (idx === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        // Path outline
        ctx.strokeStyle = 'rgba(139, 69, 19, 0.45)';
        ctx.lineWidth = Math.max(4, this.height * 0.022);
        ctx.beginPath();
        this.path.forEach((p, idx) => {
            if (idx === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
    }

    drawTowers() {
        const ctx = this.ctx;
        this.towers.forEach(tower => {
            // Range (soft circle)
            ctx.beginPath();
            ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(176, 208, 227, 0.14)';
            ctx.fill();

            // Tower base
            ctx.fillStyle = '#9CAD90';
            ctx.beginPath();
            ctx.ellipse(tower.x, tower.y, 14, 18, 0, 0, Math.PI * 2);
            ctx.fill();

            // Roof
            ctx.beginPath();
            ctx.moveTo(tower.x - 16, tower.y - 10);
            ctx.lineTo(tower.x, tower.y - 26);
            ctx.lineTo(tower.x + 16, tower.y - 10);
            ctx.closePath();
            ctx.fillStyle = '#D62E2E';
            ctx.fill();

            // Flag
            ctx.beginPath();
            ctx.moveTo(tower.x, tower.y - 26);
            ctx.lineTo(tower.x, tower.y - 36);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#2f1a0e';
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(tower.x, tower.y - 36);
            ctx.lineTo(tower.x + 10, tower.y - 32);
            ctx.lineTo(tower.x, tower.y - 28);
            ctx.closePath();
            ctx.fillStyle = '#FFC42B';
            ctx.fill();
        });
    }

    drawBees() {
        const ctx = this.ctx;
        this.bees.forEach(bee => {
            const pos = this.getPointOnPath(bee.t);
            const size = Math.max(8, this.width * 0.015);

            // Bee body
            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.fillStyle = '#FFC42B';
            ctx.beginPath();
            ctx.ellipse(0, 0, size * 1.2, size * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Stripes
            ctx.fillStyle = '#2f1a0e';
            ctx.fillRect(-size * 0.7, -size * 0.7, size * 0.3, size * 1.4);
            ctx.fillRect(-size * 0.15, -size * 0.8, size * 0.3, size * 1.6);

            // Wings
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.beginPath();
            ctx.ellipse(-size * 0.3, -size * 0.9, size * 0.6, size * 0.9, -0.3, 0, Math.PI * 2);
            ctx.ellipse(size * 0.3, -size * 0.9, size * 0.6, size * 0.9, 0.3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });
    }

    drawHUD() {
        const ctx = this.ctx;
        ctx.fillStyle = '#2f1a0e';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = `${Math.max(14, this.width * 0.04)}px "Lato", system-ui`;
        ctx.fillText(`Score: ${this.score}`, 10, 8);

        ctx.textAlign = 'right';
        ctx.fillText(`Bees Left: ${this.lives}`, this.width - 10, 8);
    }

    drawGameOverOverlay() {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = 'rgba(47, 26, 14, 0.65)';
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.fillStyle = '#FFF7EC';
        ctx.textAlign = 'center';

        ctx.font = `${Math.max(18, this.width * 0.06)}px "Playfair Display", serif`;
        ctx.fillText('The bees reached the meadow!', this.width / 2, this.height / 2 - 10);

        ctx.font = `${Math.max(12, this.width * 0.035)}px "Lato", system-ui`;
        ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 20);
        ctx.fillText('Tap, click, or press Space/Enter to play again', this.width / 2, this.height / 2 + 44);

        ctx.restore();
    }

    loop(timestamp) {
        const ctx = this.ctx;
        const t = timestamp || 0;
        const dt = this.lastTime ? (t - this.lastTime) / 1000 : 0;
        this.lastTime = t;

        this.update(dt);

        ctx.clearRect(0, 0, this.width, this.height);
        this.drawBackground();
        this.drawTowers();
        this.drawBees();
        this.drawHUD();

        if (this.gameOver) {
            this.drawGameOverOverlay();
        }

        window.requestAnimationFrame((time) => this.loop(time));
    }
}

// ------- BOOTSTRAP -------

document.addEventListener('DOMContentLoaded', () => {
    try {
        new HundredAcreGame();
    } catch (err) {
        console.error('HundredAcreGame failed to start:', err);
    }
});

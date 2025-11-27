// ===================================
// ১. ধ্রুবক (Constants)
// ===================================
const GAME_WIDTH = 540;   
const GAME_HEIGHT = 960;  

// *** গ্রিড কনফিগারেশন (৪ রিল, ৩ রো) ***
const REEL_COUNT = 4;       
const ROW_COUNT = 3;        

const REEL_WIDTH = 105;     
const SYMBOL_HEIGHT = 150;  
const GAP_X = 15;           
const GAP_Y = 15;          

const TOTAL_GRID_WIDTH = (REEL_WIDTH * REEL_COUNT) + (GAP_X * (REEL_COUNT - 1));
const TOTAL_GRID_HEIGHT = (SYMBOL_HEIGHT * ROW_COUNT) + (GAP_Y * (ROW_COUNT - 1));

const START_X = (GAME_WIDTH - TOTAL_GRID_WIDTH) / 2 + (REEL_WIDTH / 2); 
const START_Y = 320; 

const SPIN_DURATION_PER_REEL = 300; 
const SYMBOL_SHIFT_COUNT = 20; 

const BET_STEP = 1.00;    
const MAX_BET = 1000.00;
const MIN_BET = 1.00;

// *** TRANSACTION LIMITS ***
const MIN_DEPOSIT = 50.00; 
const MAX_DEPOSIT = 5000.00; 
const MIN_WITHDRAW = 100.00; 
const MAX_WITHDRAW = 50000.00; 

// ===============================================
// DEPOSIT NUMBERS (AUTO ROTATION)
// ===============================================
const BKASH_NUMBERS = [
    "01911111101", "01911111102", "01911111103", "01911111104", "01911111105"
];
const NAGAD_NUMBERS = [
    "01922222201", "01922222202", "01922222203", "01922222204", "01922222205"
];

// *** WIN SETTINGS ***
const BASE_WIN_RATE = 40; 
const SUPER_WIN_RATE = 50; 
const MULTIPLIER_LEVELS = [1, 2, 3, 5]; 

const SYMBOL_VALUES = {
    'golden_burger': 50, 'ace': 20, 'king': 15, 'queen': 10, 'jack': 8, 'spade': 5
};
const SYMBOL_KEYS = Object.keys(SYMBOL_VALUES);

// =======================================================
// Scene 1: Login Scene (Server Connected)
// =======================================================
class LoginScene extends Phaser.Scene {
    constructor() {
        super('LoginScene');
        this.username = '';
        this.password = '';
        this.mobile = '';
        this.newUsername = '';
        this.newPassword = '';
    }

    preload() {
        this.load.image('background', 'assets/new_background.jpg');
    }

    create() {
        const { width, height } = this.scale;
        this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);
        
        this.formBG = this.add.rectangle(width / 2, height / 2 + 50, 450, 550, 0x000000, 0.85).setOrigin(0.5);
        this.add.text(width / 2, 180, 'SuperAce Access', { font: 'bold 40px Arial', fill: '#FFD700' }).setOrigin(0.5); 

        this.loginContainer = this.createLoginUI(width, height);
        this.regContainer = this.createRegistrationUI(width, height);
        this.regContainer.setVisible(false);

        this.setupEventListeners();
    }

    createInputField(x, y, placeholder, name, isPassword = false) { 
        const inputRect = this.add.rectangle(x, y, 300, 50, 0x222222).setStrokeStyle(2, 0x777777).setName(name + 'Rect');
        const inputText = this.add.text(x - 140, y, placeholder, { fontSize: '24px', fill: '#999999' }).setOrigin(0, 0.5).setName(name + 'Text');
        const container = this.add.container(0, 0, [inputRect, inputText]).setName(name);
        
        inputRect.setInteractive({ useHandCursor: true });
        inputRect.on('pointerdown', () => {
            let value = prompt(`${placeholder}:`, this[name] || '');
            if (value !== null) {
                this[name] = value;
                inputText.setText(value ? (isPassword ? '•'.repeat(value.length) : value) : placeholder);
                inputText.setFill(value ? '#FFFFFF' : '#999999');
            }
        });
        return container;
    }

    createLoginUI(width, height) {
        const container = this.add.container(0, 0).setName('loginCont').setY(this.formBG.y - 100);
        container.add(this.add.text(width / 2, -120, 'Member Login', { font: 'bold 36px Arial', fill: '#FFF' }).setOrigin(0.5));
        container.add(this.createInputField(width / 2, 0, 'Username / Mobile', 'username', false));
        container.add(this.createInputField(width / 2, 80, 'Password', 'password', true));

        const loginButton = this.add.text(width / 2, 220, '  LOGIN  ', { fontSize: '36px', fill: '#000', backgroundColor: '#FFD700', padding: { x: 40, y: 15 } }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setName('loginBtn');
        container.add(loginButton);

        const registerButton = this.add.text(width / 2, 330, 'New User? Register Here', { fontSize: '24px', fill: '#888', padding: { x: 10, y: 5 } }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setName('registerBtn');
        container.add(registerButton);
        return container;
    }

    createRegistrationUI(width, height) {
        const container = this.add.container(0, 0).setName('regCont').setY(this.formBG.y - 120);
        container.add(this.add.text(width / 2, -120, 'New Account Registration', { font: 'bold 36px Arial', fill: '#FFF' }).setOrigin(0.5));
        container.add(this.createInputField(width / 2, 0, 'Mobile Number', 'mobile', false));
        container.add(this.createInputField(width / 2, 80, 'Set Username', 'newUsername', false));
        container.add(this.createInputField(width / 2, 160, 'Set Password', 'newPassword', true));
        
        const confirmRegBtn = this.add.text(width / 2, 300, '  REGISTER  ', { fontSize: '36px', fill: '#000', backgroundColor: '#00FF00', padding: { x: 20, y: 15 } }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setName('confirmRegBtn');
        container.add(confirmRegBtn);

        const backBtn = this.add.text(width / 2, 410, ' < Back to Login ', { fontSize: '20px', fill: '#888' }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setName('backBtn');
        container.add(backBtn);
        return container;
    }
    
    setupEventListeners() {
        this.loginContainer.getByName('loginBtn').on('pointerdown', this.handleLogin, this);
        this.regContainer.getByName('confirmRegBtn').on('pointerdown', this.handleRegistration, this);
        this.regContainer.getByName('backBtn').on('pointerdown', () => { this.loginContainer.setVisible(true); this.regContainer.setVisible(false); });
        this.loginContainer.getByName('registerBtn').on('pointerdown', () => { this.loginContainer.setVisible(false); this.regContainer.setVisible(true); });
    }
    
    // --- SERVER LOGIN ---
    handleLogin() {
        if (!this.username || !this.password) { alert('Please enter username and password.'); return; }
        
        const statusText = this.add.text(this.scale.width / 2, 750, 'Logging in...', { fontSize: '24px', fill: '#FFD700' }).setOrigin(0.5).setDepth(10);
        
        fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: this.username, password: this.password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                this.scene.start('GameScene', { user: data.user });
            } else {
                statusText.setText(data.message);
                this.time.delayedCall(2000, () => statusText.destroy());
            }
        })
        .catch(() => statusText.setText('Server Connection Failed'));
    }
    
    // --- SERVER REGISTER ---
    handleRegistration() {
        if (!this.mobile || !this.newUsername || !this.newPassword) { alert('Please fill all fields.'); return; }
        
        fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile: this.mobile, username: this.newUsername, password: this.newPassword })
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            if(data.success) {
                this.loginContainer.setVisible(true);
                this.regContainer.setVisible(false);
            }
        });
    }
}

// =======================================================
// Scene 2: Game Scene (Server Connected)
// =======================================================
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.currentUser = null; // Store logged in user info
        this.isAdmin = false;
        
        // UI Elements
        this.infoPanel = null; 
        this.depositPanel = null; 
        this.withdrawPanel = null; 
        this.verificationPanel = null;
        this.menuBar = null;
        this.adminPanelContainer = null;

        this.depositData = { method: '', amount: 0, phone: '' }; 
        this.forceWin = false; 
        this.isMenuOpen = false;
        this.multiplierIndex = 0; 
        this.multiplierTexts = []; 
    }
    
    init(data) {
        if (data && data.user) {
            this.currentUser = data.user;
            this.balance = this.currentUser.balance;
            this.isAdmin = this.currentUser.username === 'admin';
        } else {
            this.scene.start('LoginScene');
        }
    }

    preload() {
        this.load.image('background', 'assets/new_background.jpg');
        this.load.image('reel_frame_img', 'assets/reel_frame.png'); 
        this.load.image('golden_frame', 'assets/golden_frame.png'); 
        this.load.image('bet_button', 'assets/bet_button.png');
        this.load.image('plus_button', 'assets/plus_button.jpg'); 
        this.load.image('minus_button', 'assets/minus_button.jpg'); 
        this.load.image('ace', 'assets/ace.png');
        this.load.image('king', 'assets/king.png');
        this.load.image('queen', 'assets/queen.png');
        this.load.image('jack', 'assets/jack.png');
        this.load.image('spade', 'assets/spade.png'); 
        this.load.image('golden_burger', 'assets/golden_burger.png');
        
        this.load.audio('spin_start', 'assets/spin_start.mp3');
        this.load.audio('reel_stop', 'assets/reel_stop.mp3');
        this.load.audio('win_sound', 'assets/win_sound.mp3');
    }

    create() {
        this.isSpinning = false;
        this.currentBet = 10.00;   
        this.reelsStopped = 0;
        
        const { width, height } = this.scale;
        this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);

        // Grid Mask
        const maskShape = this.make.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(START_X - REEL_WIDTH/2 - 10, START_Y - SYMBOL_HEIGHT/2 - 10, TOTAL_GRID_WIDTH + 20, TOTAL_GRID_HEIGHT + 20);
        const gridMask = maskShape.createGeometryMask();

        // Frame
        const gridCenterX = width / 2;
        const absoluteGridCenterY = START_Y + ((ROW_COUNT - 1) * (SYMBOL_HEIGHT + GAP_Y)) / 2;
        const bigReelFrame = this.add.image(gridCenterX, absoluteGridCenterY, 'reel_frame_img');
        bigReelFrame.setDisplaySize(TOTAL_GRID_WIDTH + 60, TOTAL_GRID_HEIGHT + 60);
        bigReelFrame.setDepth(0); 
       
        this.symbols = [];
        for (let reel = 0; reel < REEL_COUNT; reel++) {
            this.symbols[reel] = []; 
            for (let row = 0; row < ROW_COUNT; row++) {
                const x = START_X + reel * (REEL_WIDTH + GAP_X); 
                const y = START_Y + row * (SYMBOL_HEIGHT + GAP_Y); 

                const frame = this.add.image(x, y, 'golden_frame');
                frame.setDisplaySize(REEL_WIDTH, SYMBOL_HEIGHT); 
                frame.setDepth(1); 

                const symbolKey = Phaser.Utils.Array.GetRandom(SYMBOL_KEYS);
                const symbol = this.add.image(x, y, symbolKey);
                symbol.setDisplaySize(REEL_WIDTH - 25, SYMBOL_HEIGHT - 25); 
                symbol.setDepth(2); 
                symbol.setMask(gridMask); 
                symbol.originalX = x; symbol.originalY = y; symbol.rowIndex = row; 
                this.symbols[reel][row] = symbol;
            }
        }

        this.add.text(width / 2, 50, 'SuperAce', { font: 'bold 48px Arial', fill: '#FFD700' }).setOrigin(0.5); 
        
        // Multiplier
        this.multiplierTexts = [];
        for (let i = 0; i < MULTIPLIER_LEVELS.length; i++) {
            const txt = this.add.text((width / 2 - 120) + i * 80, 130, `x${MULTIPLIER_LEVELS[i]}`, { font: 'bold 28px Arial', fill: i === 0 ? '#FFD700' : '#888888' }).setOrigin(0.5);
            if(i === 0) txt.setStroke('#FF0000', 4);
            this.multiplierTexts.push(txt);
        }

        // UI
        const uiY = height - 100; 
        const adjustX = width - 80;

        this.centerWinText = this.add.text(width / 2, height / 2, 'WIN: Tk 0.00', { fill: '#FFFF00', fontSize: '50px', fontWeight: 'bolder', stroke: '#000000', strokeThickness: 10 }).setOrigin(0.5).setVisible(false).setDepth(100);
        
        this.spinButton = this.add.image(width / 2, uiY - 2, 'bet_button').setScale(0.06).setInteractive({ useHandCursor: true }).setDepth(50);
        this.spinButton.on('pointerdown', this.startSpin, this);
        this.add.text(width / 2, uiY - 1, 'BET', { font: 'bold 10px Arial', fill: '#f5e506ff' }).setOrigin(0.5).setDepth(50);

        this.plusButton = this.add.image(adjustX, uiY - 45, 'plus_button').setScale(0.18).setInteractive({ useHandCursor: true }).setDepth(50);
        this.plusButton.on('pointerdown', () => this.adjustBet(BET_STEP), this);
        this.minusButton = this.add.image(adjustX, uiY + 45, 'minus_button').setScale(0.18).setInteractive({ useHandCursor: true }).setDepth(50);
        this.minusButton.on('pointerdown', () => this.adjustBet(-BET_STEP), this);

        this.betAdjustText = this.add.text(adjustX, uiY + 5, `Tk ${this.currentBet.toFixed(2)}`, { fill: '#FFD700', fontSize: '24px', fontWeight: 'bold' }).setOrigin(0.5).setDepth(50);
        this.balanceText = this.add.text(20, height - 40, `Balance: Tk ${this.balance.toFixed(2)}`, { fill: '#FFF', fontSize: '20px', fontWeight: 'bold' }).setDepth(50);

        this.menuButton = this.add.text(20, 30, '≡', { fontSize: '40px', fill: '#FFF', padding: { x: 10, y: 5 } }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true }).setDepth(200); 
        this.menuButton.on('pointerdown', this.toggleMenu, this);

        this.createMenuBar(width, height);
        this.input.once('pointerdown', () => { if (this.sound.context.state === 'suspended') this.sound.context.resume(); });
        this.updateUI();
        this.updateMultiplierVisuals(); 
    }

    // --- SERVER SYNC HELPER ---
    updateBalanceOnServer(amount, callback) {
        fetch('/api/update-balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: this.currentUser.username, amount: amount })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                this.balance = data.newBalance;
                this.updateUI();
                if (callback) callback();
            }
        });
    }

    startSpin() {
        if (this.balance < this.currentBet) { alert('Insufficient Balance!'); this.showDepositPanel(); return; }
        if (this.isSpinning) return; 
        
        this.isSpinning = true;
        this.setUIInteractive(false); 
        this.centerWinText.setVisible(false); 

        // Deduct Bet from Server
        this.updateBalanceOnServer(-this.currentBet, () => {
            console.log('Spin Started! Bet: ' + this.currentBet); 
            this.sound.play('spin_start');
            const finalResult = this.getSpinResult();
            this.animateReels(finalResult);
        });
    }

    getSafeSymbol(excluded) {
        let sym = Phaser.Utils.Array.GetRandom(SYMBOL_KEYS);
        while (sym === excluded) sym = Phaser.Utils.Array.GetRandom(SYMBOL_KEYS);
        return sym;
    }

    getSpinResult() {
        const finalGrid = [];
        for (let col = 0; col < REEL_COUNT; col++) finalGrid[col] = []; 
        
        let isWin = this.forceWin || (Phaser.Math.Between(1, 100) <= (this.multiplierIndex === 3 ? SUPER_WIN_RATE : BASE_WIN_RATE));
        let winningRow = -1, winningSymbol = null, matchCount = 0;

        if (isWin) {
            winningRow = Phaser.Math.Between(0, ROW_COUNT - 1);
            winningSymbol = Phaser.Utils.Array.GetRandom(SYMBOL_KEYS);
            matchCount = Phaser.Math.Between(3, REEL_COUNT);
        }

        for (let col = 0; col < REEL_COUNT; col++) {
            for (let row = 0; row < ROW_COUNT; row++) {
                if (isWin && row === winningRow) {
                    finalGrid[col][row] = (col < matchCount) ? winningSymbol : this.getSafeSymbol(winningSymbol);
                } else {
                    let forbidden = (col >= 2 && finalGrid[col-1][row] === finalGrid[col-2][row]) ? finalGrid[col-1][row] : null;
                    finalGrid[col][row] = this.getSafeSymbol(forbidden);
                }
            }
        }
        return finalGrid;
    }

    animateReels(finalResult) {
        this.reelsStopped = 0;
        for (let reel = 0; reel < REEL_COUNT; reel++) {
            for (let row = 0; row < ROW_COUNT; row++) {
                const symbol = this.symbols[reel][row];
                symbol.y = START_Y + row * (SYMBOL_HEIGHT + GAP_Y);

                this.tweens.add({
                    targets: symbol,
                    y: symbol.y - SYMBOL_SHIFT_COUNT * (SYMBOL_HEIGHT + GAP_Y), 
                    duration: SPIN_DURATION_PER_REEL * (reel * 1.5 + 4), 
                    ease: 'Quad.easeOut', 
                    onUpdate: (tween, target) => {
                        if (Math.random() > 0.5) {
                            target.setTexture(Phaser.Utils.Array.GetRandom(SYMBOL_KEYS)); 
                            target.setDisplaySize(REEL_WIDTH - 25, SYMBOL_HEIGHT - 25);
                        }
                    },
                    onComplete: (tween, targets) => {
                        const target = targets[0];
                        target.setTexture(finalResult[reel][target.rowIndex]);
                        target.setDisplaySize(REEL_WIDTH - 25, SYMBOL_HEIGHT - 25);
                        target.y = START_Y + target.rowIndex * (SYMBOL_HEIGHT + GAP_Y);
                        if (target.rowIndex === (ROW_COUNT - 1)) this.stopReel(reel);
                    }
                });
            }
        }
    }

    stopReel(reelIndex) {
        this.reelsStopped++;
        this.sound.play('reel_stop');
        if (this.reelsStopped === REEL_COUNT) {
            this.isSpinning = false;
            this.setUIInteractive(true); 
            
            const visibleGrid = this.symbols.map(reel => reel.map(symbol => symbol.texture.key));
            const winResult = this.checkWin(visibleGrid);
            
            if (winResult.totalWin > 0) {
                const multiplier = MULTIPLIER_LEVELS[this.multiplierIndex];
                const finalWin = winResult.totalWin * multiplier;
                this.sound.play('win_sound');
                this.centerWinText.setText(`WIN: Tk ${finalWin.toFixed(2)}\n(x${multiplier})`).setVisible(true); 
                
                // Add Win to Server
                this.updateBalanceOnServer(finalWin);
                
                if (this.multiplierIndex < MULTIPLIER_LEVELS.length - 1) this.multiplierIndex++;
            } else {
                this.multiplierIndex = 0;
            }
            this.updateUI();
            this.updateMultiplierVisuals(); 
            if (winResult.totalWin > 0) this.time.delayedCall(3000, () => this.centerWinText.setVisible(false));
        }
    }

    checkWin(grid) {
        let totalWin = 0;
        for (let row = 0; row < ROW_COUNT; row++) {
            let firstSymbol = grid[0][row], matchCount = 1;
            for (let reel = 1; reel < REEL_COUNT; reel++) {
                if (grid[reel][row] === firstSymbol) matchCount++;
                else break; 
            }
            if (matchCount >= 3) {
                totalWin += this.currentBet * (SYMBOL_VALUES[firstSymbol] || 5) * (matchCount - 2) * 0.1;
            }
        }
        return { totalWin: totalWin };
    }

    // --- MENU & ADMIN ---
    createMenuBar(width, height) {
        const menuWidth = 300;
        this.menuBar = this.add.container(-menuWidth, 0).setDepth(150); 
        this.menuBar.add(this.add.rectangle(0, height / 2, menuWidth, height, 0x111111, 0.95).setOrigin(0, 0.5));
        this.menuBar.add(this.add.text(150, 50, 'Profile', { fontSize: '36px', fill: '#FFD700' }).setOrigin(0.5));
        this.menuBalanceText = this.add.text(150, 120, `Wallet: Tk ${this.balance.toFixed(2)}`, { fontSize: '24px', fill: '#FFF' }).setOrigin(0.5);
        this.menuBar.add(this.menuBalanceText);

        let y = 250;
        this.addMenuButton(150, y, ' Deposit ', '#00FF00', () => this.showDepositPanel()); y += 70;
        this.addMenuButton(150, y, ' Withdraw ', '#FFD700', () => this.showWithdrawPanel()); y += 70;
        this.addMenuButton(150, y, ' History ', '#00AAFF', () => this.showHistoryPanel()); y += 70;
        this.addMenuButton(150, y, ' Rules ', '#FFF', () => alert("Rules: \n1. Min Dep: 50\n2. Min Wdr: 100")); y += 70;

        if (this.isAdmin) {
            this.menuBar.add(this.add.text(150, y + 10, 'ADMIN TOOLS', { fontSize: '18px', fill: '#FF0000', fontWeight: 'bold' }).setOrigin(0.5)); y += 40;
            this.addMenuButton(150, y, ' $ ', '#333', () => { this.updateBalanceOnServer(100000); alert("Added 100k"); }); y += 60;
            this.addMenuButton(150, y, ' Check Deposit ', '#00AAFF', () => { this.showAdminRequestsPanel('Deposit'); this.toggleMenu(); }); y += 60;
            this.addMenuButton(150, y, ' Check Withdraw ', '#FF8800', () => { this.showAdminRequestsPanel('Withdraw'); this.toggleMenu(); }); y += 60;
            
            const winBtn = this.add.text(150, y, ` Force Win: OFF `, { fontSize: '24px', fill: '#FFF', backgroundColor: '#FF0000', padding: { x: 10, y: 10 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            winBtn.on('pointerdown', () => { this.forceWin = !this.forceWin; winBtn.setText(` Force Win: ${this.forceWin ? 'ON' : 'OFF'} `); winBtn.setStyle({ backgroundColor: this.forceWin ? '#00AA00' : '#FF0000' }); });
            this.menuBar.add(winBtn);
        }
        this.addMenuButton(150, height - 100, ' Logout ', '#FF0000', () => location.reload());
    }

    addMenuButton(x, y, text, color, callback) {
        const btn = this.add.text(x, y, text, { fontSize: '28px', fill: text === ' Logout ' ? '#000' : (color === '#FFF' ? '#FFF' : '#000'), backgroundColor: color === '#FFF' ? null : color, padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        btn.on('pointerdown', () => { if (!text.includes('Force') && text !== ' $ ') this.toggleMenu(); this.time.delayedCall(200, callback, [], this); });
        this.menuBar.add(btn);
    }

    // --- DEPOSIT & WITHDRAW (SERVER) ---
    initDeposit(method) {
        const amount = parseFloat(prompt(`Amount (Min ${MIN_DEPOSIT}):`));
        if (isNaN(amount) || amount < MIN_DEPOSIT) return alert('Invalid Amount');
        const phone = prompt('Wallet Number (11 Digit):');
        if (!/^01\d{9}$/.test(phone)) return alert('Invalid Phone Number');

        this.depositData = { method, amount, phone };
        if (this.depositPanel) this.depositPanel.destroy(); this.depositPanel = null;
        this.showTrxVerificationPanel();
    }

    showTrxVerificationPanel() {
        const { width, height } = this.scale;
        this.verificationPanel = this.add.container(width / 2, height / 2).setDepth(200); 
        this.verificationPanel.add(this.add.rectangle(0, 0, width, height, 0x000000, 0.7)); 
        this.verificationPanel.add(this.add.rectangle(0, 0, 450, 600, 0xFFFFFF).setOrigin(0.5));
        
        const num = (this.depositData.method === 'bKash' ? BKASH_NUMBERS : NAGAD_NUMBERS)[new Date().getHours() % 5];
        
        this.verificationPanel.add(this.add.text(0, -250, 'Verification', { fontSize: '28px', fill: '#000', fontStyle:'bold' }).setOrigin(0.5));
        this.verificationPanel.add(this.add.text(-200, -100, `Send ${this.depositData.amount} Tk to:`, { fontSize: '20px', fill: '#000' }));
        this.verificationPanel.add(this.add.text(-200, -60, num, { fontSize: '28px', fill: '#E2136E', fontStyle:'bold' }));
        
        const submitBtn = this.add.text(0, 160, ' SUBMIT TRX ID ', { fontSize: '24px', fill: '#FFF', backgroundColor: '#00AA00', padding: 15 }).setOrigin(0.5).setInteractive({useHandCursor:true});
        submitBtn.on('pointerdown', () => {
             const trx = prompt("Enter TRX ID:");
             if (trx) {
                 fetch('/api/transaction', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ type: 'Deposit', ...this.depositData, trx, username: this.currentUser.username })
                 }).then(res => res.json()).then(d => alert(d.message));
                 this.verificationPanel.destroy(); this.verificationPanel = null; this.setUIInteractive(true);
             }
        });
        this.verificationPanel.add(submitBtn);
        this.addCloseButton(this.verificationPanel, () => { this.verificationPanel.destroy(); this.verificationPanel = null; this.setUIInteractive(true); }, 250);
    }

    initWithdraw(method) {
        const amount = parseFloat(prompt(`Withdraw Amount (Min ${MIN_WITHDRAW}):`));
        if (isNaN(amount) || amount < MIN_WITHDRAW || amount > this.balance) return alert('Invalid Amount');
        const phone = prompt('Wallet Number (11 Digit):');
        if (!/^01\d{9}$/.test(phone)) return alert('Invalid Phone Number');

        fetch('/api/transaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'Withdraw', method, amount, phone, trx: 'N/A', username: this.currentUser.username })
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            if(data.success) {
                this.balance = data.newBalance; // Immediate deduct
                this.updateUI();
            }
        });
        if (this.withdrawPanel) this.withdrawPanel.destroy(); this.withdrawPanel = null; this.setUIInteractive(true);
    }

    // --- ADMIN PANEL (SERVER FETCH) ---
    showAdminRequestsPanel(filterType) {
        if(this.adminPanelContainer) return;
        fetch('/api/admin/transactions').then(r=>r.json()).then(data => {
            const list = data.filter(t => t.status === 'Pending' && t.type === filterType);
            this.createAdminUI(list, filterType);
        });
    }

    createAdminUI(list, filterType) {
        const { width, height } = this.scale;
        this.adminPanelContainer = this.add.container(width/2, height/2).setDepth(300);
        this.adminPanelContainer.add(this.add.rectangle(0, 0, 500, 700, 0x222222).setOrigin(0.5).setStrokeStyle(2, 0xFFD700));
        
        this.adminPanelContainer.add(this.add.text(0, -320, `PENDING ${filterType.toUpperCase()}`, { fontSize: '28px', fill: '#FFD700' }).setOrigin(0.5));
        this.addCloseButton(this.adminPanelContainer, () => { this.adminPanelContainer.destroy(); this.adminPanelContainer = null; }, 320);

        if (list.length === 0) this.adminPanelContainer.add(this.add.text(0, 0, "No Requests", { fontSize: '20px', fill: '#AAA' }).setOrigin(0.5));
        
        let y = -250;
        list.slice(0, 5).forEach(req => {
            this.adminPanelContainer.add(this.add.text(-210, y, `${req.username}: Tk ${req.amount}\n${req.phone} (${req.trx})`, { fontSize: '16px', fill: '#FFF' }));
            
            const ok = this.add.text(100, y, " [✔] ", { fontSize: '24px', fill: '#00FF00' }).setOrigin(0.5).setInteractive({useHandCursor:true});
            ok.on('pointerdown', () => this.handleAdminAction(req.trx || req.phone, 'approve', req));
            this.adminPanelContainer.add(ok);

            const no = this.add.text(160, y, " [X] ", { fontSize: '24px', fill: '#FF0000' }).setOrigin(0.5).setInteractive({useHandCursor:true});
            no.on('pointerdown', () => this.handleAdminAction(req.trx || req.phone, 'reject', req));
            this.adminPanelContainer.add(no);
            y += 80;
        });
    }

    handleAdminAction(trxId, action, req) {
        fetch('/api/admin/action', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ trxId, action, type: req.type, amount: req.amount, username: req.username })
        }).then(() => {
            alert("Done");
            this.adminPanelContainer.destroy(); this.adminPanelContainer = null;
            this.showAdminRequestsPanel(req.type);
        });
    }
    
    // --- HELPERS ---
    showHistoryPanel() { alert("Check Server Logs for History (Not implemented in Game UI yet)"); }
    updateUI() { 
        if(this.balanceText) this.balanceText.setText(`Balance: Tk ${this.balance.toFixed(2)}`); 
        if(this.menuBalanceText) this.menuBalanceText.setText(`Wallet: Tk ${this.balance.toFixed(2)}`);
    }
    updateMultiplierVisuals() { 
        this.multiplierTexts.forEach((t, i) => {
            t.setFill(i === this.multiplierIndex ? '#FFD700' : '#888888');
            t.setScale(i === this.multiplierIndex ? 1.3 : 1);
        });
    }
    adjustBet(n) { 
        let b = this.currentBet + n; 
        if(b>=MIN_BET && b<=MAX_BET) { this.currentBet = parseFloat(b.toFixed(2)); this.betAdjustText.setText(`Tk ${this.currentBet.toFixed(2)}`); }
    }
    toggleMenu() { 
        this.isMenuOpen = !this.isMenuOpen; 
        this.tweens.add({ targets: this.menuBar, x: this.isMenuOpen ? 0 : -300, duration: 300 });
        this.tweens.add({ targets: this.menuButton, x: this.isMenuOpen ? 270 : 20, duration: 300 });
    }
    createPopup(w, h, t) {
        const c = this.add.container(w/2, h/2).setDepth(200);
        c.add(this.add.rectangle(0, 0, 400, 500, 0x000000, 0.9));
        c.add(this.add.text(0, -200, t, { fontSize: '32px', fill: '#FFF' }).setOrigin(0.5));
        this.setUIInteractive(false); return c;
    }
    addCloseButton(c, cb, y) {
        const b = this.add.text(0, y, ' Close ', { fontSize: '24px', fill: '#FFF', backgroundColor: '#555' }).setOrigin(0.5).setInteractive({useHandCursor:true});
        b.on('pointerdown', cb); c.add(b);
    }
    showDepositPanel() { this.depositPanel = this.createPopup(this.scale.width, this.scale.height, 'Deposit'); this.addPopupOption(this.depositPanel, -100, -50, 'bKash', '#E2136E', ()=>this.initDeposit('bKash')); this.addPopupOption(this.depositPanel, 100, -50, 'Nagad', '#F58220', ()=>this.initDeposit('Nagad')); this.addCloseButton(this.depositPanel, ()=>{this.depositPanel.destroy(); this.depositPanel=null; this.setUIInteractive(true);}); }
    showWithdrawPanel() { this.withdrawPanel = this.createPopup(this.scale.width, this.scale.height, 'Withdraw'); this.addPopupOption(this.withdrawPanel, -100, -50, 'bKash', '#E2136E', ()=>this.initWithdraw('bKash')); this.addPopupOption(this.withdrawPanel, 100, -50, 'Nagad', '#F58220', ()=>this.initWithdraw('Nagad')); this.addCloseButton(this.withdrawPanel, ()=>{this.withdrawPanel.destroy(); this.withdrawPanel=null; this.setUIInteractive(true);}); }
    addPopupOption(c, x, y, t, col, cb) { const b = this.add.text(x, y, ` ${t} `, { fontSize: '28px', fill: '#000', backgroundColor: col }).setOrigin(0.5).setInteractive({useHandCursor:true}); b.on('pointerdown', cb); c.add(b); }
    setUIInteractive(s) { if(s) { this.spinButton.setInteractive(); this.plusButton.setInteractive(); this.minusButton.setInteractive(); } else { this.spinButton.disableInteractive(); this.plusButton.disableInteractive(); this.minusButton.disableInteractive(); } }
}
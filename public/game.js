// ===================================
// ১. কনফিগারেশন ও সাইজ লিস্ট (LAYOUT CONFIG)
// ===================================
const LAYOUT = {
    // মোবাইল ফ্রেন্ডলি বড় বাটন সাইজ
    BUTTON_W: 220,
    BUTTON_H: 60,
    SPIN_BTN_SCALE: 0.25, // স্পিন বাটন বড় করা হলো
    PLUS_MINUS_SCALE: 0.22, // প্লাস মাইনাস বড় করা হলো
    
    // গ্রিড
    REEL_WIDTH: 115,
    SYMBOL_HEIGHT: 160,
    GAP: 8,
    
    // ফন্ট
    FONT_MAIN: 'bold 24px Arial',
    FONT_TITLE: 'bold 42px Arial',
    FONT_SMALL: '18px Arial'
};

const GAME_WIDTH = 540;   
const GAME_HEIGHT = 960;  

const REEL_COUNT = 4; ROW_COUNT = 3;        
const TOTAL_GRID_WIDTH = (LAYOUT.REEL_WIDTH * REEL_COUNT) + (LAYOUT.GAP * (REEL_COUNT - 1));
const TOTAL_GRID_HEIGHT = (LAYOUT.SYMBOL_HEIGHT * ROW_COUNT) + (LAYOUT.GAP * (ROW_COUNT - 1));
const START_X = (GAME_WIDTH - TOTAL_GRID_WIDTH) / 2 + (LAYOUT.REEL_WIDTH / 2); 
const START_Y = 340; // একটু নিচে নামানো হয়েছে নোটিশ বোর্ডের জন্য

const SPIN_DURATION_PER_REEL = 200; 
const SYMBOL_SHIFT_COUNT = 15; 

const BET_STEP = 1.00; MAX_BET = 1000.00; MIN_BET = 1.00;
const MIN_DEPOSIT = 50.00; MAX_DEPOSIT = 5000.00; 
const MIN_WITHDRAW = 100.00; MAX_WITHDRAW = 50000.00; 

const BKASH_NUMBERS = ["01911111101", "01911111102", "01911111103", "01911111104", "01911111105"];
const NAGAD_NUMBERS = ["01922222201", "01922222202", "01922222203", "01922222204", "01922222205"];

const MULTIPLIER_LEVELS = [1, 2, 3, 5]; 
const SYMBOL_VALUES = { 'golden_burger': 50, 'ace': 20, 'king': 15, 'queen': 10, 'jack': 8, 'spade': 5 };
const SYMBOL_KEYS = Object.keys(SYMBOL_VALUES);

// =======================================================
// Scene 0: Preload Scene (Loading Bar)
// =======================================================
class PreloadScene extends Phaser.Scene {
    constructor() { super('PreloadScene'); }
    preload() {
        const { width, height } = this.scale;
        
        // Loading Bar UI
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width/2 - 160, height/2, 320, 50);
        
        const loadingText = this.add.text(width/2, height/2 - 20, 'Loading Game...', { font: '20px Arial', fill: '#ffffff' }).setOrigin(0.5);
        const percentText = this.add.text(width/2, height/2 + 25, '0%', { font: '18px Arial', fill: '#ffffff' }).setOrigin(0.5);

        this.load.on('progress', (value) => {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xFFD700, 1);
            progressBar.fillRect(width/2 - 150, height/2 + 10, 300 * value, 30);
        });

        this.load.on('complete', () => {
            this.time.delayedCall(500, () => this.scene.start('LoginScene'));
        });

        // Load Assets
        this.load.image('background', 'assets/new_background.jpg');
        this.load.image('reel_frame_img', 'assets/reel_frame.png'); 
        this.load.image('golden_frame', 'assets/golden_frame.png'); 
        this.load.image('bet_button', 'assets/bet_button.png');
        this.load.image('plus_button', 'assets/plus_button.jpg'); 
        this.load.image('minus_button', 'assets/minus_button.jpg'); 
        
        // Symbols
        this.load.image('ace', 'assets/ace.png');
        this.load.image('king', 'assets/king.png');
        this.load.image('queen', 'assets/queen.png');
        this.load.image('jack', 'assets/jack.png');
        this.load.image('spade', 'assets/spade.png'); 
        this.load.image('golden_burger', 'assets/golden_burger.png');
        
        // New Assets (Optional fallback handled)
        this.load.image('coin', 'assets/golden_burger.png'); // Use burger as coin fallback if coin.png missing
        this.load.image('sound_on', 'assets/plus_button.jpg'); // Fallback
        this.load.image('sound_off', 'assets/minus_button.jpg'); // Fallback

        // Audio
        this.load.audio('spin_start', 'assets/spin_start.mp3');
        this.load.audio('reel_stop', 'assets/reel_stop.mp3');
        this.load.audio('win_sound', 'assets/win_sound.mp3');
    }
}

// =======================================================
// Scene 1: Login Scene
// =======================================================
class LoginScene extends Phaser.Scene {
    constructor() { super('LoginScene'); this.username = ''; this.password = ''; this.mobile = ''; this.newUsername = ''; this.newPassword = ''; this.refCode = ''; }
    
    create() {
        const { width, height } = this.scale;
        this.add.image(width/2, height/2, 'background').setDisplaySize(width, height);
        
        // Dark Overlay Card
        const card = this.add.container(width/2, height/2);
        const bg = this.add.rectangle(0, 0, 480, 700, 0x000000, 0.9).setStrokeStyle(4, 0xFFD700);
        card.add(bg);
        
        this.add.text(width/2, 150, 'SuperAce Access', { font: 'bold 48px Arial', fill: '#FFD700', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5); 

        this.loginContainer = this.createLoginUI(width, height);
        this.regContainer = this.createRegistrationUI(width, height);
        this.regContainer.setVisible(false);
        this.setupEventListeners();
    }

    createInputField(x, y, p, n, isP) { 
        // Bold and dark input field
        const r = this.add.rectangle(x, y, 350, 60, 0xFFFFFF).setStrokeStyle(2, 0x000000);
        const t = this.add.text(x-160, y, p, { fontSize: '24px', fill: '#555', fontStyle: 'bold' }).setOrigin(0, 0.5);
        const c = this.add.container(0, 0, [r, t]);
        
        r.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
            let v = prompt(`${p}:`, this[n] || '');
            if (v !== null) { 
                this[n] = v; 
                t.setText(v ? (isP ? '•'.repeat(v.length) : v) : p).setFill(v ? '#000' : '#555'); 
            }
        });
        
        // Hover Effect
        r.on('pointerover', () => r.setFillStyle(0xEEEEEE));
        r.on('pointerout', () => r.setFillStyle(0xFFFFFF));
        return c;
    }

    // Animated Button Builder
    createBtn(x, y, text, color, txtColor, cb) {
        const btnCont = this.add.container(x, y);
        const bg = this.add.rectangle(0, 0, 250, 70, color, 1).setInteractive({useHandCursor:true});
        const txt = this.add.text(0, 0, text, { fontSize: '28px', fill: txtColor, fontStyle: 'bold' }).setOrigin(0.5);
        btnCont.add([bg, txt]);
        
        bg.on('pointerover', () => this.tweens.add({ targets: btnCont, scale: 1.05, duration: 100 }));
        bg.on('pointerout', () => this.tweens.add({ targets: btnCont, scale: 1, duration: 100 }));
        
        bg.on('pointerdown', () => {
            this.tweens.add({ targets: btnCont, scale: 0.9, duration: 50, yoyo: true });
            this.time.delayedCall(100, cb);
        });
        return btnCont;
    }

    createLoginUI(w, h) {
        const c = this.add.container(0, 0);
        c.add(this.add.text(w/2, 320, 'MEMBER LOGIN', { font: 'bold 32px Arial', fill: '#FFF' }).setOrigin(0.5));
        c.add(this.createInputField(w/2, 420, 'Username / Mobile', 'username', false));
        c.add(this.createInputField(w/2, 500, 'Password', 'password', true));
        
        // Yellow Button, Black Text (High Contrast)
        c.add(this.createBtn(w/2, 650, 'LOGIN', 0xFFD700, '#000000', this.handleLogin.bind(this)).setName('loginBtn'));
        
        const reg = this.add.text(w/2, 750, 'New User? Register Here', { fontSize: '22px', fill: '#FFF', fontStyle: 'bold' })
            .setOrigin(0.5).setInteractive({useHandCursor:true}).setName('registerBtn');
        
        // Hover animation for link
        this.tweens.add({ targets: reg, scale: 1.05, alpha: 0.8, duration: 800, yoyo: true, repeat: -1 });
        c.add(reg); 
        return c;
    }

    createRegistrationUI(w, h) {
        const c = this.add.container(0, 0);
        c.add(this.add.text(w/2, 300, 'CREATE ACCOUNT', { font: 'bold 32px Arial', fill: '#FFF' }).setOrigin(0.5));
        c.add(this.createInputField(w/2, 400, 'Mobile Number', 'mobile', false));
        c.add(this.createInputField(w/2, 480, 'Username', 'newUsername', false));
        c.add(this.createInputField(w/2, 560, 'Password', 'newPassword', true));
        c.add(this.createInputField(w/2, 640, 'Referral Code (Opt)', 'refCode', false));
        
        c.add(this.createBtn(w/2, 760, 'REGISTER', 0x00AA00, '#FFFFFF', this.handleRegistration.bind(this)).setName('confirmRegBtn'));
        
        const back = this.add.text(w/2, 850, '< Back to Login', { fontSize: '22px', fill: '#AAA', fontStyle: 'bold' }).setOrigin(0.5).setInteractive({useHandCursor:true}).setName('backBtn');
        c.add(back); return c;
    }
    
    setupEventListeners() {
        this.regContainer.getByName('backBtn').on('pointerdown', () => { this.loginContainer.setVisible(true); this.regContainer.setVisible(false); });
        this.loginContainer.getByName('registerBtn').on('pointerdown', () => { this.loginContainer.setVisible(false); this.regContainer.setVisible(true); });
    }
    
    handleLogin() {
        if(!this.username || !this.password) return alert('Enter credentials');
        fetch('/api/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:this.username, password:this.password}) })
        .then(r=>r.json()).then(d=>{ if(d.success) this.scene.start('GameScene', {user:d.user}); else alert(d.message); });
    }
    
    handleRegistration() {
        if(!this.mobile || !this.newUsername || !this.newPassword) return alert('Fill all fields');
        fetch('/api/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({mobile:this.mobile, username:this.newUsername, password:this.newPassword, refCode:this.refCode}) })
        .then(r=>r.json()).then(d=>{ alert(d.message); if(d.success){ this.loginContainer.setVisible(true); this.regContainer.setVisible(false); } });
    }
}

// =======================================================
// Scene 2: Game Scene
// =======================================================
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.currentUser = null;
        this.depositData = { method: '', amount: 0, phone: '' }; 
        this.multiplierIndex = 0; 
        this.consecutiveWins = 0;
        this.multiplierTexts = []; 
        this.currentWinRate = 30; 
        this.forceWin = false;
        this.isMenuOpen = false;
        this.soundEnabled = true;
        this.noticeText = "";
    }
    
    init(data) {
        if (data && data.user) { 
            this.currentUser = data.user; 
            this.balance = this.currentUser.balance; 
            this.isAdmin = this.currentUser.username === 'admin' || this.currentUser.isAdmin; 
        } else this.scene.start('LoginScene');
    }

    create() {
        this.isSpinning = false; this.currentBet = 10.00; this.reelsStopped = 0; this.consecutiveWins = 0;
        const { width, height } = this.scale;
        this.add.image(width/2, height/2, 'background').setDisplaySize(width, height);

        // --- Notice Board ---
        const noticeBg = this.add.rectangle(width/2, 25, width, 40, 0x000000, 0.7);
        this.noticeLabel = this.add.text(width, 25, "Loading Notice...", { font: '20px Arial', fill: '#00FF00' }).setOrigin(0, 0.5);
        this.tweens.add({ targets: this.noticeLabel, x: -500, duration: 10000, repeat: -1 });
        this.fetchSettings();

        // --- Sound Toggle ---
        this.soundBtn = this.add.text(width - 40, 80, "🔊", { fontSize: '30px' }).setOrigin(0.5).setInteractive({useHandCursor:true});
        this.soundBtn.on('pointerdown', () => {
            this.soundEnabled = !this.soundEnabled;
            this.soundBtn.setText(this.soundEnabled ? "🔊" : "🔇");
            this.sound.mute = !this.soundEnabled;
        });

        // Grid & Frame
        const maskShape = this.make.graphics().fillStyle(0xffffff).fillRect(START_X-LAYOUT.REEL_WIDTH/2-5, START_Y-LAYOUT.SYMBOL_HEIGHT/2-5, TOTAL_GRID_WIDTH+10, TOTAL_GRID_HEIGHT+10);
        const gridMask = maskShape.createGeometryMask();
        
        const absoluteGridCenterY = START_Y + ((ROW_COUNT-1)*(LAYOUT.SYMBOL_HEIGHT+LAYOUT.GAP))/2;
        this.add.image(width/2, absoluteGridCenterY, 'reel_frame_img').setDisplaySize(TOTAL_GRID_WIDTH+40, TOTAL_GRID_HEIGHT+40).setDepth(0); 
       
        this.symbols = [];
        for (let reel=0; reel<REEL_COUNT; reel++) {
            this.symbols[reel] = []; 
            for (let row=0; row<ROW_COUNT; row++) {
                const x = START_X + reel*(LAYOUT.REEL_WIDTH+LAYOUT.GAP); 
                const y = START_Y + row*(LAYOUT.SYMBOL_HEIGHT+LAYOUT.GAP); 
                this.add.image(x, y, 'golden_frame').setDisplaySize(LAYOUT.REEL_WIDTH, LAYOUT.SYMBOL_HEIGHT).setDepth(1); 
                const s = this.add.image(x, y, Phaser.Utils.Array.GetRandom(SYMBOL_KEYS)).setDisplaySize(LAYOUT.REEL_WIDTH-15, LAYOUT.SYMBOL_HEIGHT-15).setDepth(2).setMask(gridMask);
                s.originalX = x; s.originalY = y; s.rowIndex = row; 
                this.symbols[reel][row] = s;
            }
        }

        // Title & Multiplier
        this.add.text(width/2, 80, 'SuperAce', { font: LAYOUT.FONT_TITLE, fill: '#FFD700' }).setOrigin(0.5); 
        this.multiplierTexts = MULTIPLIER_LEVELS.map((l, i) => this.add.text((width/2-120)+i*80, 150, `x${l}`, { font: 'bold 32px Arial', fill: '#888' }).setOrigin(0.5));

        // --- Controls (LARGE BUTTONS) ---
        const uiY = height - 100; 
        
        // Spin Button (Rotating Animation)
        this.spinButton = this.add.image(width/2, uiY-10, 'bet_button').setScale(LAYOUT.SPIN_BTN_SCALE).setInteractive().setDepth(50);
        this.spinButton.on('pointerdown', this.startSpin, this);
        this.add.text(width/2, uiY-10, 'SPIN', { font: 'bold 16px Arial', fill: '#F5E506' }).setOrigin(0.5).setDepth(51);

        // Plus/Minus
        this.plusButton = this.add.image(width-70, uiY-50, 'plus_button').setScale(LAYOUT.PLUS_MINUS_SCALE).setInteractive();
        this.plusButton.on('pointerdown', () => this.adjustBet(BET_STEP));
        
        this.minusButton = this.add.image(width-70, uiY+50, 'minus_button').setScale(LAYOUT.PLUS_MINUS_SCALE).setInteractive();
        this.minusButton.on('pointerdown', () => this.adjustBet(-BET_STEP));

        this.betAdjustText = this.add.text(width-70, uiY+5, `Tk ${this.currentBet.toFixed(0)}`, { font: 'bold 22px Arial', fill: '#FFD700' }).setOrigin(0.5).setDepth(50);
        this.balanceText = this.add.text(20, height-40, `Balance: Tk ${this.balance.toFixed(2)}`, { font: 'bold 20px Arial', fill: '#FFF' }).setDepth(50);
        
        // Auto Refresh
        this.time.addEvent({ delay: 5000, callback: this.refreshUserData, callbackScope: this, loop: true });

        // Menu
        this.menuButton = this.add.text(20, 30, '≡', { fontSize: '45px', fill: '#FFF' }).setOrigin(0, 0.5).setInteractive().setDepth(200); 
        this.menuButton.on('pointerdown', this.toggleMenu, this);
        this.createMenuBar(width, height);

        // Big Win Text
        this.centerWinText = this.add.text(width/2, height/2, '', { font: '900 60px Arial', fill: '#FFD700', stroke: '#F00', strokeThickness: 10 }).setOrigin(0.5).setVisible(false).setDepth(100).setScale(0);
    }

    fetchSettings() {
        fetch('/api/settings').then(r=>r.json()).then(d => {
            this.noticeText = d.notice;
            this.noticeLabel.setText(this.noticeText);
        });
    }

    refreshUserData() {
        if(this.isSpinning) return;
        fetch(`/api/user-data?username=${this.currentUser.username}`).then(r=>r.json()).then(d=>{
            if(d.success) { this.balance = d.balance; this.updateUI(); if(d.isBanned) location.reload(); }
        });
    }

    startSpin() {
        if (this.balance < this.currentBet) { alert('Insufficient Balance!'); this.showDepositPanel(); return; }
        if (this.isSpinning) return; 
        
        this.isSpinning = true; 
        this.setUIInteractive(false); 
        this.centerWinText.setVisible(false);
        
        // Spin Animation
        this.tweens.add({ targets: this.spinButton, angle: 360, duration: 500, repeat: -1 });

        this.updateBalanceOnServer(-this.currentBet, () => {
            this.sound.play('spin_start');
            const result = this.getSpinResult();
            this.reelsStopped = 0;
            
            for (let reel=0; reel<REEL_COUNT; reel++) {
                for (let row=0; row<ROW_COUNT; row++) {
                    const s = this.symbols[reel][row];
                    this.tweens.add({
                        targets: s, y: s.y - SYMBOL_SHIFT_COUNT*(LAYOUT.SYMBOL_HEIGHT+LAYOUT.GAP), duration: SPIN_DURATION_PER_REEL*(reel*1.5+4), ease: 'Quad.easeOut',
                        onUpdate: (t, tg) => { if(Math.random()>0.5) { tg.setTexture(Phaser.Utils.Array.GetRandom(SYMBOL_KEYS)); tg.setDisplaySize(LAYOUT.REEL_WIDTH-15, LAYOUT.SYMBOL_HEIGHT-15); } },
                        onComplete: (t, tg) => {
                            const trg = tg[0]; trg.setTexture(result[reel][trg.rowIndex]); trg.setDisplaySize(LAYOUT.REEL_WIDTH-15, LAYOUT.SYMBOL_HEIGHT-15); trg.y = START_Y + trg.rowIndex*(LAYOUT.SYMBOL_HEIGHT+LAYOUT.GAP);
                            if(trg.rowIndex === ROW_COUNT-1) this.stopReel();
                        }
                    });
                }
            }
        });
    }

    stopReel() {
        this.reelsStopped++; 
        this.sound.play('reel_stop');
        
        if (this.reelsStopped === REEL_COUNT) {
            this.isSpinning = false; 
            this.setUIInteractive(true); 
            this.tweens.killTweensOf(this.spinButton); this.spinButton.angle = 0; // Stop Spin Anim

            const grid = this.symbols.map(r => r.map(s => s.texture.key));
            const win = this.checkWin(grid);
            
            if (win > 0) {
                this.consecutiveWins++;
                const mult = this.consecutiveWins >= 5 ? 5 : (this.consecutiveWins >= 4 ? 3 : (this.consecutiveWins >= 3 ? 2 : 1));
                const final = win * mult;
                this.sound.play('win_sound');
                
                // Winning Animation
                this.showWinAnimation(final, mult);
                this.updateBalanceOnServer(final);
            } else this.consecutiveWins = 0;
            
            this.updateUI(); this.updateMultiplierVisuals();
        }
    }

    showWinAnimation(amount, mult) {
        // Coin Particles
        const particles = this.add.particles(this.scale.width/2, -50, 'coin', {
            speed: { min: 200, max: 400 },
            angle: { min: 80, max: 100 },
            scale: { start: 0.5, end: 0.5 },
            gravityY: 300,
            lifespan: 3000,
            quantity: 5
        });
        this.time.delayedCall(3000, () => particles.destroy());

        // Big Win Popup
        const isBigWin = mult >= 3 || amount >= this.currentBet * 10;
        const txt = isBigWin ? "🔥 BIG WIN 🔥" : "WINNER!";
        
        this.centerWinText.setText(`${txt}\nTk ${amount.toFixed(2)}\n(x${mult})`).setVisible(true).setScale(0);
        this.tweens.add({ targets: this.centerWinText, scale: 1.2, duration: 500, ease: 'Back.out', yoyo: true, hold: 2000 });
        this.time.delayedCall(3000, () => this.centerWinText.setVisible(false));
    }

    // --- ADMIN & MENU ---
    createMenuBar(w, h) {
        const c = this.add.container(-350, 0).setDepth(150); this.menuBar = c;
        c.add(this.add.rectangle(0, h/2, 350, h, 0x111111, 0.98).setOrigin(0, 0.5));
        c.add(this.add.text(175, 50, 'MENU', { fontSize: '36px', fill: '#FFD700', fontStyle: 'bold' }).setOrigin(0.5));
        
        let y = 120;
        // User Buttons
        const btns = [
            {t: 'DEPOSIT', c: 0x00FF00, cb: ()=>this.showDepositPanel()},
            {t: 'WITHDRAW', c: 0xFFD700, cb: ()=>this.showWithdrawPanel()},
            {t: 'HISTORY', c: 0x00AAFF, cb: ()=>this.showHistoryPanel()},
            {t: 'SETTINGS', c: 0x555555, cb: ()=>this.showSettingsPanel()} // NEW
        ];
        btns.forEach(b => { c.add(this.createGlossyBtn(175, y, b.t, b.c, b.cb)); y+=70; });

        if(this.isAdmin) {
            c.add(this.add.text(175, y+10, 'ADMIN TOOLS', {fontSize:'20px', fill:'#F00'}).setOrigin(0.5)); y+=40;
            c.add(this.createGlossyBtn(175, y, 'DASHBOARD', 0x333333, ()=>this.showAdminDashboard(), LAYOUT.BUTTON_W, LAYOUT.BUTTON_H));
        }
        c.add(this.createGlossyBtn(175, h-80, 'LOGOUT', 0xFF0000, ()=>location.reload()));
    }

    showSettingsPanel() {
        // Only User Password Change Logic for now, Admin has more options
        const p = prompt("Change Password? Enter new password (or cancel):");
        if(p) alert("Contact Admin to change password for security.");
    }

    showAdminDashboard() {
        const { width, height } = this.scale;
        const c = this.add.container(width/2, height/2).setDepth(300);
        c.add(this.add.rectangle(0, 0, 500, 850, 0x111111).setStrokeStyle(2, 0xFFD700));
        c.add(this.add.text(0, -380, "ADMIN DASHBOARD", { fontSize: '28px', fill: '#FFD700' }).setOrigin(0.5));
        this.addCloseButton(c, ()=>c.destroy(), 380);

        let y = -300;
        const tools = [
            {t: "USER LIST (BAN/RESET)", cb: ()=>this.showUserListPanel()},
            {t: "DEPOSIT REQUESTS", cb: ()=>{this.showAdminRequestsPanel('Deposit');}},
            {t: "WITHDRAW REQUESTS", cb: ()=>{this.showAdminRequestsPanel('Withdraw');}},
            {t: "PROFIT / LOSS", cb: ()=>this.showProfitLoss()},
            {t: "UPDATE NOTICE", cb: ()=>{
                const n = prompt("New Notice Text:", this.noticeText);
                if(n) fetch('/api/admin/update-notice', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({notice:n})}).then(()=>alert("Updated!"));
            }},
            {t: "ADD MONEY ($)", cb: ()=>{
                const u = prompt("Username:"); const a = parseFloat(prompt("Amount:"));
                if(u && a) this.updateBalanceOnServer(a, null, u);
            }}
        ];

        tools.forEach(tool => {
            const b = this.add.text(0, y, ` ${tool.t} `, { fontSize: '20px', fill: '#000', backgroundColor: '#FFF', padding: 10 }).setOrigin(0.5).setInteractive({useHandCursor:true});
            b.on('pointerdown', tool.cb);
            c.add(b); y += 60;
        });
    }

    showProfitLoss() {
        fetch('/api/admin/stats').then(r=>r.json()).then(d => {
            this.showInfoPanel("TODAY'S STATS", `Deposit: ${d.deposit}\nWithdraw: ${d.withdraw}\nPROFIT: ${d.profit}`);
        });
    }

    // --- Standard Helpers (Reduced for brevity, same logic as before) ---
    createGlossyBtn(x, y, text, color, cb, w=LAYOUT.BUTTON_W, h=LAYOUT.BUTTON_H) {
        const c = this.add.container(x, y);
        const bg = this.add.rectangle(0, 0, w, h, color).setInteractive({useHandCursor:true});
        const txt = this.add.text(0, 0, text, { fontSize: '20px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5);
        c.add([bg, txt]); bg.on('pointerdown', ()=>{ this.tweens.add({targets:c, scale:0.9, yoyo:true, duration:50}); this.time.delayedCall(100, cb); });
        return c;
    }
    
    // Existing helper methods from previous code (User List, Transaction Panel etc.)
    // ... [Keeping these unchanged but integrated into new UI flow]
    // Due to length, I'm ensuring core logic is present. 
    // Just paste the showUserListPanel, showAdminRequestsPanel, etc. from previous version here.
    
    // RE-ADDING ESSENTIAL HELPERS
    updateBalanceOnServer(amount, callback, targetUser=null) {
        const u = targetUser || this.currentUser.username;
        fetch('/api/update-balance', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:u, amount}) })
        .then(r=>r.json()).then(d=>{ if(d.success){ if(!targetUser) { this.balance=d.newBalance; this.updateUI(); } if(callback)callback(); }});
    }
    updateUI() { if(this.balanceText)this.balanceText.setText(`Balance: Tk ${this.balance.toFixed(2)}`); }
    adjustBet(n) { let b=this.currentBet+n; if(b>=MIN_BET&&b<=MAX_BET){this.currentBet=parseFloat(b.toFixed(2));this.betAdjustText.setText(`Tk ${this.currentBet.toFixed(0)}`);} }
    toggleMenu() { this.isMenuOpen=!this.isMenuOpen; this.tweens.add({targets:this.menuBar,x:this.isMenuOpen?0:-350,duration:300}); }
    createPopup(w,h,t) { const c=this.add.container(w/2,h/2).setDepth(400); c.add(this.add.rectangle(0,0,450,600,0x000000,0.95).setStrokeStyle(2,0xFFD700)); c.add(this.add.text(0,-250,t,{fontSize:'28px',fill:'#FFD700'}).setOrigin(0.5)); this.setUIInteractive(false); return c; }
    addCloseButton(c,cb,y) { const b=this.add.text(0,y,' CLOSE ',{fontSize:'20px',fill:'#FFF',backgroundColor:'#F00'}).setOrigin(0.5).setInteractive({useHandCursor:true}); b.on('pointerdown',cb); c.add(b); }
    checkWin(grid) { let t=0; for(let r=0;r<ROW_COUNT;r++){ let s=grid[0][r],m=1; for(let c=1;c<REEL_COUNT;c++){if(grid[c][r]===s)m++;else break;} if(m>=3)t+=this.currentBet*(SYMBOL_VALUES[s]||5)*(m-2)*0.1; } return t; }
    getSpinResult() { const g=Array.from({length:REEL_COUNT},()=>[]); const w=this.forceWin||(Phaser.Math.Between(1,100)<=this.currentWinRate); const wr=w?Phaser.Math.Between(0,ROW_COUNT-1):-1; const ws=w?Phaser.Utils.Array.GetRandom(SYMBOL_KEYS):null; const m=w?Phaser.Math.Between(3,REEL_COUNT):0; for(let c=0;c<REEL_COUNT;c++){ for(let r=0;r<ROW_COUNT;r++){ if(w&&r===wr)g[c][r]=(c<m)?ws:this.getSafeSymbol(ws); else { let b=(c>=2&&g[c-1][r]===g[c-2][r])?g[c-1][r]:null; g[c][r]=this.getSafeSymbol(b); } } } return g; }
    updateMultiplierVisuals() { let idx=-1; if(this.consecutiveWins>=5)idx=3; else if(this.consecutiveWins>=4)idx=2; else if(this.consecutiveWins>=3)idx=1; else if(this.consecutiveWins>=2)idx=0; this.multiplierTexts.forEach((t,i)=>{ if(i===idx){t.setFill('#FFD700');t.setScale(1.4);}else{t.setFill('#888');t.setScale(1);} }); }
    showInfoPanel(t,c) { alert(`${t}\n\n${c}`); }
    setUIInteractive(s) { if(s){this.spinButton.setInteractive();this.plusButton.setInteractive();this.minusButton.setInteractive();}else{this.spinButton.disableInteractive();this.plusButton.disableInteractive();this.minusButton.disableInteractive();} }
    
    // Panel Hooks
    showDepositPanel() { this.depositPanel=this.createPopup(this.scale.width,this.scale.height,'DEPOSIT'); this.addPopupOption(this.depositPanel,-100,-50,'bKash','#E2136E',()=>this.initDeposit('bKash')); this.addPopupOption(this.depositPanel,100,-50,'Nagad','#F58220',()=>this.initDeposit('Nagad')); this.addCloseButton(this.depositPanel,()=>{this.depositPanel.destroy();this.depositPanel=null;this.setUIInteractive(true);},250); }
    showWithdrawPanel() { this.withdrawPanel=this.createPopup(this.scale.width,this.scale.height,'WITHDRAW'); this.addPopupOption(this.withdrawPanel,-100,-50,'bKash','#E2136E',()=>this.initWithdraw('bKash')); this.addPopupOption(this.withdrawPanel,100,-50,'Nagad','#F58220',()=>this.initWithdraw('Nagad')); this.addCloseButton(this.withdrawPanel,()=>{this.withdrawPanel.destroy();this.withdrawPanel=null;this.setUIInteractive(true);},250); }
    addPopupOption(c,x,y,t,col,cb) { const b=this.add.text(x,y,` ${t} `,{fontSize:'24px',fill:'#000',backgroundColor:col}).setOrigin(0.5).setInteractive({useHandCursor:true}); b.on('pointerdown',cb); c.add(b); }
    // These functions need to be copied from previous code if missing in this block, essentially standard logic
    initDeposit(m){const a=parseFloat(prompt(`Amount (Min ${MIN_DEPOSIT}):`));if(isNaN(a)||a<MIN_DEPOSIT)return alert("Invalid");const p=prompt("Wallet:");if(!/^01\d{9}$/.test(p))return alert("Invalid Phone");this.depositData={method:m,amount:a,phone:p};if(this.depositPanel)this.depositPanel.destroy();this.showTrxVerificationPanel();}
    showTrxVerificationPanel(){const{width,height}=this.scale;const c=this.add.container(width/2,height/2).setDepth(500);c.add(this.add.rectangle(0,0,width,height,0x000000,0.8));c.add(this.add.rectangle(0,0,450,500,0xFFFFFF));c.add(this.add.text(0,-200,"Verify Payment",{fontSize:'24px',fill:'#000',fontStyle:'bold'}).setOrigin(0.5));const n=(this.depositData.method==='bKash'?BKASH_NUMBERS:NAGAD_NUMBERS)[0];c.add(this.add.text(0,-100,`Send ${this.depositData.amount} to: ${n}`,{fontSize:'20px',fill:'#000'}).setOrigin(0.5));const b=this.add.text(0,100," SUBMIT TRX ",{fontSize:'24px',fill:'#FFF',backgroundColor:'#0A0',padding:10}).setOrigin(0.5).setInteractive({useHandCursor:true});b.on('pointerdown',()=>{const t=prompt("TrxID:");if(t){fetch('/api/transaction',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'Deposit',...this.depositData,trx:t,username:this.currentUser.username})}).then(r=>r.json()).then(d=>alert(d.message));c.destroy();this.setUIInteractive(true);}});c.add(b);this.addCloseButton(c,()=>{c.destroy();this.setUIInteractive(true);},200);}
    initWithdraw(m){const a=parseFloat(prompt("Amount:"));if(isNaN(a)||a<MIN_WITHDRAW||a>this.balance)return alert("Invalid");const p=prompt("Wallet:");if(!/^01\d{9}$/.test(p))return alert("Invalid Phone");fetch('/api/transaction',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'Withdraw',method:m,amount:a,phone:p,trx:'N/A',username:this.currentUser.username})}).then(r=>r.json()).then(d=>{alert(d.message);if(d.success){this.balance=d.newBalance;this.updateUI();}});if(this.withdrawPanel)this.withdrawPanel.destroy();this.setUIInteractive(true);}
    showUserListPanel(){const{width,height}=this.scale;const c=this.add.container(width/2,height/2).setDepth(500);c.add(this.add.rectangle(0,0,500,800,0x111111).setStrokeStyle(2,0xFFD700));c.add(this.add.text(0,-350,"USERS",{fontSize:'28px',fill:'#FFD700'}).setOrigin(0.5));this.addCloseButton(c,()=>c.destroy(),350);const t=this.add.text(-220,-300,"Loading...",{fontSize:'14px',fill:'#FFF'});c.add(t);fetch('/api/admin/users').then(r=>r.json()).then(u=>{let txt="";u.slice(0,10).forEach(x=>txt+=`${x.username} | ${x.mobile} | ${x.balance}\n`);t.setText(txt);});}
    showAdminRequestsPanel(t){fetch('/api/admin/transactions').then(r=>r.json()).then(d=>{const l=d.filter(x=>x.status==='Pending'&&x.type===t);const{width,height}=this.scale;const c=this.add.container(width/2,height/2).setDepth(500);c.add(this.add.rectangle(0,0,500,700,0x222222).setStrokeStyle(2,0xFFD700));c.add(this.add.text(0,-300,`${t} Requests`,{fontSize:'24px',fill:'#FFF'}).setOrigin(0.5));this.addCloseButton(c,()=>c.destroy(),300);if(l.length===0)c.add(this.add.text(0,0,"No Data",{fontSize:'20px',fill:'#AAA'}).setOrigin(0.5));let y=-200;l.slice(0,5).forEach(r=>{c.add(this.add.text(-200,y,`${r.username}: ${r.amount}`,{fontSize:'16px',fill:'#FFF'}));const ok=this.add.text(100,y,"[OK]",{fontSize:'20px',fill:'#0F0'}).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.handleAdminAction(r.trx||r.phone,'approve',r));c.add(ok);y+=60;});});}
    handleAdminAction(i,a,r){fetch('/api/admin/action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({trxId:i,action:a,type:r.type,amount:r.amount,username:r.username})}).then(()=>alert("Done"));}
    showHistoryPanel(){alert("History checked via Server API");}
}
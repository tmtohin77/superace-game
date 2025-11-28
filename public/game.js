// ===================================
// ১. ধ্রুবক (Constants)
// ===================================
const GAME_WIDTH = 540;   
const GAME_HEIGHT = 960;  

// *** FIXED GRAPHICS LAYOUT ***
const REEL_COUNT = 4; ROW_COUNT = 3;        
const REEL_WIDTH = 115; // একটু চওড়া করা হলো
const SYMBOL_HEIGHT = 160; // একটু লম্বা করা হলো 
const GAP_X = 8;  // গ্যাপ কমানো হলো
const GAP_Y = 8;  

const TOTAL_GRID_WIDTH = (REEL_WIDTH * REEL_COUNT) + (GAP_X * (REEL_COUNT - 1));
const TOTAL_GRID_HEIGHT = (SYMBOL_HEIGHT * ROW_COUNT) + (GAP_Y * (ROW_COUNT - 1));
const START_X = (GAME_WIDTH - TOTAL_GRID_WIDTH) / 2 + (REEL_WIDTH / 2); 
const START_Y = 320; 

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
// Scene 1: Login Scene
// =======================================================
class LoginScene extends Phaser.Scene {
    constructor() { super('LoginScene'); this.username = ''; this.password = ''; this.mobile = ''; this.newUsername = ''; this.newPassword = ''; this.refCode = ''; }
    preload() { this.load.image('background', 'assets/new_background.jpg'); }
    create() {
        const { width, height } = this.scale;
        this.add.image(width/2, height/2, 'background').setDisplaySize(width, height);
        this.add.rectangle(width/2, height/2+50, 450, 600, 0x000000, 0.85).setOrigin(0.5);
        this.add.text(width/2, 180, 'SuperAce Access', { font: 'bold 40px Arial', fill: '#FFD700' }).setOrigin(0.5); 
        this.loginContainer = this.createLoginUI(width, height);
        this.regContainer = this.createRegistrationUI(width, height);
        this.regContainer.setVisible(false);
        this.setupEventListeners();
    }

    createInputField(x, y, p, n, isP) { 
        const r = this.add.rectangle(x, y, 300, 50, 0x222222).setStrokeStyle(2, 0x777777);
        const t = this.add.text(x-140, y, p, { fontSize: '24px', fill: '#999' }).setOrigin(0, 0.5);
        const c = this.add.container(0, 0, [r, t]);
        r.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
            let v = prompt(`${p}:`, this[n] || '');
            if (v !== null) { this[n] = v; t.setText(v ? (isP ? '•'.repeat(v.length) : v) : p).setFill(v ? '#FFF' : '#999'); }
        });
        return c;
    }

    createGlossyBtn(x, y, text, color, cb, w=200, h=60) {
        const btnCont = this.add.container(x, y);
        const bg = this.add.rectangle(0, 0, w, h, color).setInteractive({useHandCursor:true});
        const shine = this.add.rectangle(0, -h/4, w, h/2, 0xFFFFFF, 0.2); 
        const txt = this.add.text(0, 0, text, { fontSize: '24px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5);
        btnCont.add([bg, shine, txt]);
        bg.on('pointerdown', () => {
            this.tweens.add({ targets: btnCont, scale: 0.9, duration: 50, yoyo: true });
            this.time.delayedCall(100, cb);
        });
        return btnCont;
    }

    createLoginUI(w, h) {
        const c = this.add.container(0, 0);
        c.add(this.add.text(w/2, 380, 'Member Login', { font: 'bold 36px Arial', fill: '#FFF' }).setOrigin(0.5));
        c.add(this.createInputField(w/2, 500, 'Username/Mobile', 'username', false));
        c.add(this.createInputField(w/2, 580, 'Password', 'password', true));
        c.add(this.createGlossyBtn(w/2, 720, 'LOGIN', 0xFFD700, this.handleLogin.bind(this)).setName('loginBtn'));
        const reg = this.add.text(w/2, 830, 'New User? Register Here', { fontSize: '24px', fill: '#888' }).setOrigin(0.5).setInteractive({useHandCursor:true}).setName('registerBtn');
        c.add(reg); return c;
    }

    createRegistrationUI(w, h) {
        const c = this.add.container(0, 0);
        c.add(this.add.text(w/2, 350, 'Registration', { font: 'bold 36px Arial', fill: '#FFF' }).setOrigin(0.5));
        c.add(this.createInputField(w/2, 450, 'Mobile Number', 'mobile', false));
        c.add(this.createInputField(w/2, 530, 'Set Username', 'newUsername', false));
        c.add(this.createInputField(w/2, 610, 'Set Password', 'newPassword', true));
        c.add(this.createInputField(w/2, 690, 'Referral Code (Optional)', 'refCode', false)); // NEW Field
        c.add(this.createGlossyBtn(w/2, 800, 'REGISTER', 0x00FF00, this.handleRegistration.bind(this)).setName('confirmRegBtn'));
        const back = this.add.text(w/2, 900, '< Back to Login', { fontSize: '20px', fill: '#888' }).setOrigin(0.5).setInteractive({useHandCursor:true}).setName('backBtn');
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
        this.pollingTimer = null;
    }
    
    init(data) {
        if (data && data.user) { 
            this.currentUser = data.user; 
            this.balance = this.currentUser.balance; 
            this.isAdmin = this.currentUser.username === 'admin' || this.currentUser.isAdmin; 
        } else this.scene.start('LoginScene');
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
        this.isSpinning = false; this.currentBet = 10.00; this.reelsStopped = 0; this.consecutiveWins = 0;
        const { width, height } = this.scale;
        this.add.image(width/2, height/2, 'background').setDisplaySize(width, height);

        const maskShape = this.make.graphics().fillStyle(0xffffff).fillRect(START_X-REEL_WIDTH/2-5, START_Y-SYMBOL_HEIGHT/2-5, TOTAL_GRID_WIDTH+10, TOTAL_GRID_HEIGHT+10);
        const gridMask = maskShape.createGeometryMask();
        
        // BIG FRAME (Adjusted to fit tightly)
        const absoluteGridCenterY = START_Y + ((ROW_COUNT-1)*(SYMBOL_HEIGHT+GAP_Y))/2;
        this.add.image(width/2, absoluteGridCenterY, 'reel_frame_img').setDisplaySize(TOTAL_GRID_WIDTH+40, TOTAL_GRID_HEIGHT+40).setDepth(0); 
       
        this.symbols = [];
        for (let reel=0; reel<REEL_COUNT; reel++) {
            this.symbols[reel] = []; 
            for (let row=0; row<ROW_COUNT; row++) {
                const x = START_X + reel*(REEL_WIDTH+GAP_X); 
                const y = START_Y + row*(SYMBOL_HEIGHT+GAP_Y); 
                // Frame and Symbols are now larger and closer
                this.add.image(x, y, 'golden_frame').setDisplaySize(REEL_WIDTH, SYMBOL_HEIGHT).setDepth(1); 
                const s = this.add.image(x, y, Phaser.Utils.Array.GetRandom(SYMBOL_KEYS)).setDisplaySize(REEL_WIDTH-15, SYMBOL_HEIGHT-15).setDepth(2).setMask(gridMask);
                s.originalX = x; s.originalY = y; s.rowIndex = row; 
                this.symbols[reel][row] = s;
            }
        }

        this.add.text(width/2, 50, 'SuperAce', { font: 'bold 48px Arial', fill: '#FFD700' }).setOrigin(0.5); 
        this.add.rectangle(width/2, 130, 360, 50, 0x000000, 0.6).setOrigin(0.5);
        this.multiplierTexts = MULTIPLIER_LEVELS.map((l, i) => this.add.text((width/2-120)+i*80, 130, `x${l}`, { font: 'bold 32px Arial', fill: '#888' }).setOrigin(0.5));

        const uiY = height - 100; 
        this.centerWinText = this.add.text(width/2, height/2, '', { fill: '#FF0', fontSize: '50px', stroke: '#000', strokeThickness: 10 }).setOrigin(0.5).setVisible(false).setDepth(100);
        this.spinButton = this.add.image(width/2, uiY-2, 'bet_button').setScale(0.06).setInteractive().setDepth(50);
        this.spinButton.on('pointerdown', this.startSpin, this);
        this.add.text(width/2, uiY-1, 'BET', { font: 'bold 10px Arial', fill: '#F5E506' }).setOrigin(0.5).setDepth(50);

        this.plusButton = this.add.image(width-80, uiY-45, 'plus_button').setScale(0.18).setInteractive();
        this.plusButton.on('pointerdown', () => this.adjustBet(BET_STEP));
        this.minusButton = this.add.image(width-80, uiY+45, 'minus_button').setScale(0.18).setInteractive();
        this.minusButton.on('pointerdown', () => this.adjustBet(-BET_STEP));

        this.betAdjustText = this.add.text(width-80, uiY+5, `Tk ${this.currentBet.toFixed(2)}`, { fill: '#FFD700', fontSize: '24px', fontWeight: 'bold' }).setOrigin(0.5).setDepth(50);
        this.balanceText = this.add.text(20, height-40, `Balance: Tk ${this.balance.toFixed(2)}`, { fill: '#FFF', fontSize: '20px', fontWeight: 'bold' }).setDepth(50);
        
        // Refresh Button (Manual)
        const refBtn = this.add.text(20, height-80, '🔄', {fontSize:'24px'}).setInteractive({useHandCursor:true});
        refBtn.on('pointerdown', () => this.refreshUserData());

        this.menuButton = this.add.text(20, 30, '≡', { fontSize: '40px', fill: '#FFF', padding: 10 }).setOrigin(0, 0.5).setInteractive().setDepth(200); 
        this.menuButton.on('pointerdown', this.toggleMenu, this);

        this.createMenuBar(width, height);
        this.input.once('pointerdown', () => { if (this.sound.context.state === 'suspended') this.sound.context.resume(); });
        this.updateUI();

        // ** AUTO REFRESH POLLING (Every 5 seconds) **
        this.pollingTimer = this.time.addEvent({ delay: 5000, callback: this.refreshUserData, callbackScope: this, loop: true });
        if(this.isAdmin) this.time.addEvent({ delay: 10000, callback: this.checkNotifications, callbackScope: this, loop: true });
    }

    refreshUserData() {
        if(this.isSpinning) return;
        fetch(`/api/user-data?username=${this.currentUser.username}`).then(r=>r.json()).then(d=>{
            if(d.success) { 
                this.balance = d.balance; 
                this.updateUI(); 
                if(d.isBanned) { alert("You are BANNED!"); location.reload(); }
            }
        });
    }

    checkNotifications() {
        fetch('/api/admin/notifications').then(r=>r.json()).then(d => {
            if(d.count > 0) {
                this.sound.play('win_sound');
                const notif = this.add.text(this.scale.width/2, 100, `🔔 ${d.count} New Deposit!`, { fontSize: '24px', fill: '#FFF', backgroundColor: '#F00', padding: 10 }).setOrigin(0.5).setDepth(500);
                this.tweens.add({ targets: notif, y: 150, duration: 500, yoyo: true, repeat: 3, onComplete: () => notif.destroy() });
            }
        });
    }

    createGlossyBtn(x, y, text, color, cb, w=200, h=50) {
        const btnCont = this.add.container(x, y);
        const bg = this.add.rectangle(0, 0, w, h, color).setInteractive({useHandCursor:true});
        const shine = this.add.rectangle(0, -h/4, w, h/2, 0xFFFFFF, 0.2); 
        const txt = this.add.text(0, 0, text, { fontSize: '20px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5);
        btnCont.add([bg, shine, txt]);
        bg.on('pointerdown', () => {
            if(!this.isSpinning) this.toggleMenu();
            this.tweens.add({ targets: btnCont, scale: 0.9, duration: 50, yoyo: true });
            this.time.delayedCall(150, cb, [], this);
        });
        return btnCont;
    }

    updateBalanceOnServer(amount, callback) {
        fetch('/api/update-balance', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:this.currentUser.username, amount}) })
        .then(r=>r.json()).then(d=>{ if(d.success){ this.balance=d.newBalance; this.updateUI(); if(callback)callback(); }});
    }

    startSpin() {
        if (this.balance < this.currentBet) { alert('Insufficient Balance!'); this.showDepositPanel(); return; }
        if (this.isSpinning) return; 
        this.isSpinning = true; this.setUIInteractive(false); this.centerWinText.setVisible(false); 
        this.updateBalanceOnServer(-this.currentBet, () => {
            this.sound.play('spin_start');
            const result = this.getSpinResult();
            this.reelsStopped = 0;
            for (let reel=0; reel<REEL_COUNT; reel++) {
                for (let row=0; row<ROW_COUNT; row++) {
                    const s = this.symbols[reel][row];
                    this.tweens.add({
                        targets: s, y: s.y - SYMBOL_SHIFT_COUNT*(SYMBOL_HEIGHT+GAP_Y), duration: SPIN_DURATION_PER_REEL*(reel*1.5+4), ease: 'Quad.easeOut',
                        onUpdate: (t, tg) => { if(Math.random()>0.5) { tg.setTexture(Phaser.Utils.Array.GetRandom(SYMBOL_KEYS)); tg.setDisplaySize(REEL_WIDTH-15, SYMBOL_HEIGHT-15); } },
                        onComplete: (t, tg) => {
                            const trg = tg[0]; trg.setTexture(result[reel][trg.rowIndex]); trg.setDisplaySize(REEL_WIDTH-15, SYMBOL_HEIGHT-15); trg.y = START_Y + trg.rowIndex*(SYMBOL_HEIGHT+GAP_Y);
                            if(trg.rowIndex === ROW_COUNT-1) this.stopReel();
                        }
                    });
                }
            }
        });
    }

    stopReel() {
        this.reelsStopped++; this.sound.play('reel_stop');
        if (this.reelsStopped === REEL_COUNT) {
            this.isSpinning = false; this.setUIInteractive(true); 
            const grid = this.symbols.map(r => r.map(s => s.texture.key));
            const win = this.checkWin(grid);
            if (win > 0) {
                this.consecutiveWins++;
                const mult = this.consecutiveWins >= 5 ? 5 : (this.consecutiveWins >= 4 ? 3 : (this.consecutiveWins >= 3 ? 2 : 1));
                const final = win * mult;
                this.sound.play('win_sound');
                this.centerWinText.setText(`WIN: Tk ${final.toFixed(2)}\n(x${mult})`).setVisible(true); 
                this.updateBalanceOnServer(final);
                this.time.delayedCall(3000, () => this.centerWinText.setVisible(false));
            } else this.consecutiveWins = 0;
            this.updateUI(); this.updateMultiplierVisuals();
        }
    }

    checkWin(grid) {
        let total = 0;
        for (let r=0; r<ROW_COUNT; r++) {
            let sym = grid[0][r], match = 1;
            for (let c=1; c<REEL_COUNT; c++) { if (grid[c][r] === sym) match++; else break; }
            if (match >= 3) total += this.currentBet * (SYMBOL_VALUES[sym]||5) * (match-2) * 0.1;
        }
        return total;
    }

    getSpinResult() {
        const grid = Array.from({length:REEL_COUNT},()=>[]);
        const isWin = this.forceWin || (Phaser.Math.Between(1,100) <= this.currentWinRate);
        const winRow = isWin ? Phaser.Math.Between(0, ROW_COUNT-1) : -1;
        const winSym = isWin ? Phaser.Utils.Array.GetRandom(SYMBOL_KEYS) : null;
        const match = isWin ? Phaser.Math.Between(3, REEL_COUNT) : 0;

        for (let c=0; c<REEL_COUNT; c++) {
            for (let r=0; r<ROW_COUNT; r++) {
                if (isWin && r===winRow) grid[c][r] = (c < match) ? winSym : this.getSafeSymbol(winSym);
                else {
                    let bad = (c>=2 && grid[c-1][r]===grid[c-2][r]) ? grid[c-1][r] : null;
                    grid[c][r] = this.getSafeSymbol(bad);
                }
            }
        }
        return grid;
    }
    getSafeSymbol(ex) { let s; do { s = Phaser.Utils.Array.GetRandom(SYMBOL_KEYS); } while(s===ex); return s; }

    updateMultiplierVisuals() {
        let idx = -1;
        if(this.consecutiveWins >= 5) idx = 3; else if(this.consecutiveWins >= 4) idx = 2; else if(this.consecutiveWins >= 3) idx = 1; else if(this.consecutiveWins >= 2) idx = 0;
        this.multiplierTexts.forEach((t, i) => {
            if(i === idx) { t.setFill('#FFD700'); t.setStroke('#F00', 6); t.setScale(1.4); } else { t.setFill('#888'); t.setStroke('#000', 0); t.setScale(1); }
        });
    }

    // --- UPDATED MENU WITH SPACE FILLER & REFERRAL ---
    createMenuBar(w, h) {
        const c = this.add.container(-300, 0).setDepth(150); this.menuBar = c;
        c.add(this.add.rectangle(0, h/2, 300, h, 0x111111, 0.98).setOrigin(0, 0.5));
        c.add(this.add.text(150, 50, 'PROFILE', { fontSize: '32px', fill: '#FFD700', fontStyle: 'bold' }).setOrigin(0.5));
        this.menuBalanceText = this.add.text(150, 100, `Tk ${this.balance.toFixed(2)}`, { fontSize: '18px', fill: '#FFF' }).setOrigin(0.5); c.add(this.menuBalanceText);

        let y = 160;
        c.add(this.createGlossyBtn(150, y, 'DEPOSIT', 0x00FF00, ()=>this.showDepositPanel())); y+=60;
        c.add(this.createGlossyBtn(150, y, 'WITHDRAW', 0xFFD700, ()=>this.showWithdrawPanel())); y+=60;
        c.add(this.createGlossyBtn(150, y, 'HISTORY', 0x00AAFF, ()=>this.showHistoryPanel())); y+=60;
        c.add(this.createGlossyBtn(150, y, 'RULES', 0xFFFFFF, ()=>this.showRulesPanel())); y+=60;
        
        // ** Colorful Tips (Filling the gap) **
        const tips = [
            {t: "🔥 200 Tk Bonus on Referral!", c: "#00FF00"},
            {t: "🎮 Win Streak = Big Multiplier!", c: "#FFD700"},
            {t: "⚡ Fast Withdrawal (24h)", c: "#00AAFF"}
        ];
        tips.forEach(tip => {
            c.add(this.add.text(150, y, tip.t, { fontSize: '16px', fill: tip.c, fontStyle: 'italic' }).setOrigin(0.5));
            y += 25;
        });
        y += 10;

        if(this.isAdmin) {
            c.add(this.add.text(150, y, 'ADMIN TOOLS', {fontSize:'16px', fill:'#F00'}).setOrigin(0.5)); y+=25;
            c.add(this.createGlossyBtn(150, y, 'ADD MONEY ($)', 0x333333, () => { 
                const u = prompt("Username:"); const a = parseFloat(prompt("Amount:")); 
                if(u && a) fetch('/api/update-balance', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:u, amount:a}) }).then(r=>r.json()).then(d=>alert(d.success?"Added":"Failed"));
            }, 200, 40)); y+=50;
            c.add(this.createGlossyBtn(150, y, 'USER LIST', 0x555555, ()=>this.showUserListPanel(), 200, 40)); y+=50;
            c.add(this.createGlossyBtn(150, y, 'CHK DEPOSIT', 0x00AAFF, ()=>{this.showAdminRequestsPanel('Deposit');this.toggleMenu();}, 200, 40)); y+=50;
            c.add(this.createGlossyBtn(150, y, 'CHK WITHDRAW', 0xFF8800, ()=>{this.showAdminRequestsPanel('Withdraw');this.toggleMenu();}, 200, 40)); y+=50;
            const wb = this.add.text(150, y, ` Win: ${this.forceWin?'FORCE':this.currentWinRate+'%'} `, {fontSize:'14px', fill:'#FFF', backgroundColor:'#F00', padding:5}).setOrigin(0.5).setInteractive({useHandCursor:true});
            wb.on('pointerdown', ()=>{ this.toggleWinRate(wb); }); c.add(wb);
        } else {
            // User Referral Button
            c.add(this.createGlossyBtn(150, h-150, 'REFER & EARN', 0xE2136E, ()=>this.showReferralInfo()));
        }
        c.add(this.createGlossyBtn(150, h-80, 'LOGOUT', 0xFF0000, ()=>location.reload()));
    }

    toggleWinRate(btn) {
        if(this.forceWin) { this.forceWin=false; this.currentWinRate=10; }
        else if(this.currentWinRate===10) this.currentWinRate=20;
        else if(this.currentWinRate===20) this.currentWinRate=30;
        else if(this.currentWinRate===30) this.currentWinRate=60;
        else if(this.currentWinRate===60) { this.forceWin=true; }
        btn.setText(` Win: ${this.forceWin?'FORCE':this.currentWinRate+'%'} `);
        btn.setStyle({ backgroundColor: this.forceWin?'#0A0':(this.currentWinRate>30?'#FFA500':'#F00') });
    }

    showReferralInfo() {
        this.showInfoPanel("REFERRAL SYSTEM", `
Your Username is your Referral Code: 
👉 ${this.currentUser.username}

1. Share this code with friends.
2. When they Register using your code, 
   you get 200 Tk INSTANTLY! 🎉
3. You get 10% Commission on their deposits! 💰
`);
    }

    // --- USER LIST PANEL WITH BAN ---
    showUserListPanel() {
        const { width, height } = this.scale;
        const c = this.add.container(width/2, height/2).setDepth(300);
        c.add(this.add.rectangle(0, 0, 500, 800, 0x111111).setStrokeStyle(2, 0xFFD700));
        c.add(this.add.text(0, -350, "ALL USERS", { fontSize: '28px', fill: '#FFD700' }).setOrigin(0.5));
        this.addCloseButton(c, ()=>c.destroy(), 350);

        c.add(this.add.text(0, -300, "Search by Mobile/Name:", {fontSize:'16px', fill:'#AAA'}).setOrigin(0.5));
        const searchBg = this.add.rectangle(0, -270, 300, 40, 0x333).setInteractive({useHandCursor:true});
        const searchText = this.add.text(0, -270, "Tap to Search", {fontSize:'18px', fill:'#FFF'}).setOrigin(0.5);
        c.add([searchBg, searchText]);

        let userListText = this.add.text(-220, -230, "Loading...", { fontSize: '14px', fill: '#FFF' });
        c.add(userListText);

        const fetchAndShow = (query = '') => {
            fetch('/api/admin/users').then(r=>r.json()).then(users => {
                c.list.forEach(item => { if(item.name === 'banBtn') item.destroy(); }); 
                const filtered = users.filter(u => u.username.includes(query) || u.mobile.includes(query)).slice(0, 7); 
                let txt = "NAME | MOBILE | BAL | REF\n------------------------------\n";
                let btnY = -180;

                filtered.forEach(u => {
                    const status = u.isBanned ? "BANNED" : "ACTIVE";
                    txt += `${u.username} | ${u.mobile} | ${u.balance}\nRefBy: ${u.referredBy||'None'} | ${status}\n\n`;
                    if(u.username !== 'admin') {
                        const banBtn = this.add.text(180, btnY, u.isBanned ? " UNBAN " : " BAN ", { fontSize:'14px', fill:'#FFF', backgroundColor: u.isBanned ? '#0A0' : '#F00' })
                            .setOrigin(0.5).setInteractive({useHandCursor:true}).setName('banBtn');
                        banBtn.on('pointerdown', () => {
                            fetch('/api/admin/ban-user', {
                                method: 'POST', headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify({ username: u.username, banStatus: !u.isBanned })
                            }).then(() => fetchAndShow(query));
                        });
                        c.add(banBtn);
                    }
                    btnY += 45; 
                });
                userListText.setText(txt);
            });
        };
        searchBg.on('pointerdown', () => { const q = prompt("Search User:"); if(q !== null) { searchText.setText(q); fetchAndShow(q); } });
        fetchAndShow();
    }

    showRulesPanel() { this.showInfoPanel('GAME RULES & POLICY', `\n-- REGISTRATION POLICY --\n1. One person can have only ONE account.\n2. Multiple accounts will be BANNED.\n\n-- REFERRAL BONUS --\n1. Invite friends & get 200 Tk per signup!\n2. Get 10% commission on their deposits.\n\n-- TRANSACTION --\n1. Min Dep: 50 Tk, Max: 5000 Tk.\n2. Min Wdr: 100 Tk.\n3. Always send money to ACTIVE number.\n`); }
    
    showHistoryPanel() { 
        const { width, height } = this.scale;
        const c = this.add.container(width/2, height/2).setDepth(300);
        c.add(this.add.rectangle(0, 0, 450, 600, 0x111111, 0.95).setOrigin(0.5));
        c.add(this.add.text(0, -250, "HISTORY", { fontSize: '24px', fill: '#FFF' }).setOrigin(0.5));
        this.addCloseButton(c, ()=>c.destroy(), 250);
        fetch(`/api/history?username=${this.currentUser.username}`).then(r=>r.json()).then(d=>{
            if(d.length===0) c.add(this.add.text(0,0,"No History",{fontSize:'18px',fill:'#555'}).setOrigin(0.5));
            else { let y=-200; d.slice(0,7).forEach(i=>{ const col=i.type==='Deposit'?'#0F0':'#F80'; c.add(this.add.text(-200,y,`${i.type}: Tk ${i.amount}\nStatus: ${i.status}\nDate: ${new Date(i.date).toLocaleDateString()}`,{fontSize:'16px',fill:col})); c.add(this.add.rectangle(0,y+50,400,1,0x333)); y+=60; }); }
        });
    }

    showTrxVerificationPanel() { 
        const { width, height } = this.scale;
        const c = this.add.container(width/2, height/2).setDepth(200);
        c.add(this.add.rectangle(0,0,width,height,0x000000,0.7)); c.add(this.add.rectangle(0,0,450,650,0xFFFFFF));
        const color = this.depositData.method==='bKash'?0xE2136E:0xF58220;
        c.add(this.add.rectangle(0,-275,450,100,color)); c.add(this.add.text(0,-275,'VERIFICATION',{fontSize:'32px',fill:'#FFF',fontStyle:'bold'}).setOrigin(0.5));
        const num = (this.depositData.method==='bKash'?BKASH_NUMBERS:NAGAD_NUMBERS)[new Date().getHours()%5];
        c.add(this.add.text(0,-180,`Amount: Tk ${this.depositData.amount}`,{fontSize:'22px',fill:'#000'}).setOrigin(0.5));
        c.add(this.add.text(0,-120,'Send Money To:',{fontSize:'18px',fill:'#555'}).setOrigin(0.5));
        c.add(this.add.text(-60,-80,num,{fontSize:'28px',fill:color,fontStyle:'bold'}).setOrigin(0.5));
        const cpy = this.add.text(120,-80," COPY ",{fontSize:'16px',fill:'#FFF',backgroundColor:'#333'}).setOrigin(0.5).setInteractive({useHandCursor:true});
        cpy.on('pointerdown',()=>{navigator.clipboard.writeText(num);cpy.setText("COPIED!");this.time.delayedCall(1000,()=>cpy.setText(" COPY "));}); c.add(cpy);
        c.add(this.add.text(0,20,"Enter Transaction ID:",{fontSize:'18px',fill:'#555'}).setOrigin(0.5));
        const inp = this.add.text(0,60,"Tap to Enter TRX",{fontSize:'20px',fill:'#888',backgroundColor:'#EEE',padding:10}).setOrigin(0.5).setInteractive({useHandCursor:true});
        inp.on('pointerdown',()=>{const v=prompt("Enter TRX ID:");if(v){ const upperV = v.toUpperCase(); inp.setText(upperV);inp.setFill('#000');this.depositData.trx=upperV; }}); c.add(inp);
        const sub = this.add.text(0,160,' VERIFY ',{fontSize:'24px',fill:'#FFF',backgroundColor:'#0A0',padding:15}).setOrigin(0.5).setInteractive({useHandCursor:true});
        sub.on('pointerdown',()=>{if(this.depositData.trx){fetch('/api/transaction',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'Deposit',...this.depositData,username:this.currentUser.username})}).then(r=>r.json()).then(d=>alert(d.message));c.destroy();this.setUIInteractive(true);}else alert("Enter TRX!")}); c.add(sub);
        this.addCloseButton(c,()=>{c.destroy();this.setUIInteractive(true);},260);
    }

    initDeposit(method) { const amount = parseFloat(prompt(`Amount (Min ${MIN_DEPOSIT}):`)); if (isNaN(amount) || amount < MIN_DEPOSIT) return alert('Invalid Amount'); const phone = prompt('Wallet Number (11 Digit):'); if (!/^01\d{9}$/.test(phone)) return alert('Invalid Phone Number'); this.depositData = { method, amount, phone, trx: null }; if (this.depositPanel) this.depositPanel.destroy(); this.depositPanel = null; this.showTrxVerificationPanel(); }
    initWithdraw(method) { const amount = parseFloat(prompt(`Amount (Min ${MIN_WITHDRAW}):`)); if (isNaN(amount) || amount < MIN_WITHDRAW || amount > this.balance) return alert('Invalid Amount'); const phone = prompt('Wallet Number (11 Digit):'); if (!/^01\d{9}$/.test(phone)) return alert('Invalid Phone Number'); fetch('/api/transaction', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({type:'Withdraw', method, amount, phone, trx:'N/A', username:this.currentUser.username}) }).then(r=>r.json()).then(d=>{ alert(d.message); if(d.success){ this.balance=d.newBalance; this.updateUI(); } }); if(this.withdrawPanel)this.withdrawPanel.destroy(); this.setUIInteractive(true); }
    
    showAdminRequestsPanel(type) { if(this.adminPanelContainer)return; fetch('/api/admin/transactions').then(r=>r.json()).then(d=>{ this.createAdminUI(d.filter(t=>t.status==='Pending'&&t.type===type), type); }); }
    createAdminUI(list, type) { const {width,height}=this.scale; const c=this.add.container(width/2,height/2).setDepth(300); this.adminPanelContainer=c; c.add(this.add.rectangle(0,0,500,700,0x222222).setStrokeStyle(2,0xFFD700)); c.add(this.add.text(0,-320,`PENDING ${type}`,{fontSize:'28px',fill:'#FFD700'}).setOrigin(0.5)); this.addCloseButton(c,()=>{c.destroy();this.adminPanelContainer=null;},320); if(list.length===0) c.add(this.add.text(0,0,"No Requests",{fontSize:'20px',fill:'#AAA'}).setOrigin(0.5)); let y=-250; list.slice(0,5).forEach(r=>{ c.add(this.add.text(-210,y,`${r.username}: Tk ${r.amount}\n${r.phone} (${r.trx})`,{fontSize:'16px',fill:'#FFF'})); const ok=this.add.text(100,y," [✔] ",{fontSize:'24px',fill:'#0F0'}).setOrigin(0.5).setInteractive({useHandCursor:true}); ok.on('pointerdown',()=>this.handleAdminAction(r.trx||r.phone,'approve',r)); c.add(ok); const no=this.add.text(160,y," [X] ",{fontSize:'24px',fill:'#F00'}).setOrigin(0.5).setInteractive({useHandCursor:true}); no.on('pointerdown',()=>this.handleAdminAction(r.trx||r.phone,'reject',r)); c.add(no); y+=80; }); }
    handleAdminAction(trxId, action, req) { fetch('/api/admin/action', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ trxId, action, type: req.type, amount: req.amount, username: req.username }) }).then(() => { alert("Done"); this.adminPanelContainer.destroy(); this.adminPanelContainer = null; this.showAdminRequestsPanel(req.type); }); }
    
    updateUI() { if(this.balanceText)this.balanceText.setText(`Balance: Tk ${this.balance.toFixed(2)}`); if(this.menuBalanceText)this.menuBalanceText.setText(`Tk ${this.balance.toFixed(2)}`); }
    adjustBet(n) { let b=this.currentBet+n; if(b>=MIN_BET&&b<=MAX_BET){this.currentBet=parseFloat(b.toFixed(2));this.betAdjustText.setText(`Tk ${this.currentBet.toFixed(2)}`);} }
    toggleMenu() { this.isMenuOpen=!this.isMenuOpen; this.tweens.add({targets:this.menuBar,x:this.isMenuOpen?0:-300,duration:300}); }
    createPopup(w,h,t) { const c=this.add.container(w/2,h/2).setDepth(200); c.add(this.add.rectangle(0,0,400,500,0x000000,0.9)); c.add(this.add.text(0,-200,t,{fontSize:'32px',fill:'#FFF'}).setOrigin(0.5)); this.setUIInteractive(false); return c; }
    addCloseButton(c,cb,y) { const b=this.add.text(0,y,' Close ',{fontSize:'24px',fill:'#FFF',backgroundColor:'#555'}).setOrigin(0.5).setInteractive({useHandCursor:true}); b.on('pointerdown',cb); c.add(b); }
    showDepositPanel() { this.depositPanel=this.createPopup(this.scale.width,this.scale.height,'Deposit'); this.addPopupOption(this.depositPanel,-100,-50,'bKash','#E2136E',()=>this.initDeposit('bKash')); this.addPopupOption(this.depositPanel,100,-50,'Nagad','#F58220',()=>this.initDeposit('Nagad')); this.addCloseButton(this.depositPanel,()=>{this.depositPanel.destroy();this.depositPanel=null;this.setUIInteractive(true);}); }
    showWithdrawPanel() { this.withdrawPanel=this.createPopup(this.scale.width,this.scale.height,'Withdraw'); this.addPopupOption(this.withdrawPanel,-100,-50,'bKash','#E2136E',()=>this.initWithdraw('bKash')); this.addPopupOption(this.withdrawPanel,100,-50,'Nagad','#F58220',()=>this.initWithdraw('Nagad')); this.addCloseButton(this.withdrawPanel,()=>{this.withdrawPanel.destroy();this.withdrawPanel=null;this.setUIInteractive(true);}); }
    addPopupOption(c,x,y,t,col,cb) { const b=this.add.text(x,y,` ${t} `,{fontSize:'28px',fill:'#000',backgroundColor:col}).setOrigin(0.5).setInteractive({useHandCursor:true}); b.on('pointerdown',cb); c.add(b); }
    setUIInteractive(s) { if(s){this.spinButton.setInteractive();this.plusButton.setInteractive();this.minusButton.setInteractive();}else{this.spinButton.disableInteractive();this.plusButton.disableInteractive();this.minusButton.disableInteractive();} }
    showInfoPanel(t,c) { alert(`${t}\n\n${c}`); }
}
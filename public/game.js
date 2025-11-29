// ===================================
// ১. গেম কনফিগারেশন
// ===================================
const GAME_WIDTH = 540;   
const GAME_HEIGHT = 960;  

// গ্রিড সাইজ
const REEL_WIDTH = 105;
const SYMBOL_HEIGHT = 140; 
const GAP = 10;
const START_Y = 320;

const REEL_COUNT = 4; 
const ROW_COUNT = 3;        
const TOTAL_GRID_WIDTH = (REEL_WIDTH * REEL_COUNT) + (GAP * (REEL_COUNT - 1));

// *** মিসিং লাইনটি এখানে যোগ করা হলো ***
const START_X = (GAME_WIDTH - TOTAL_GRID_WIDTH) / 2 + (REEL_WIDTH / 2); 

const SPIN_DURATION_PER_REEL = 200; 
const SYMBOL_SHIFT_COUNT = 15; 

// বিটিং এবং লিমিট
const BET_STEP = 1.00;    
const MAX_BET = 1000.00;
const MIN_BET = 1.00;
const MIN_DEPOSIT = 50.00; 
const MAX_DEPOSIT = 5000.00; 
const MIN_WITHDRAW = 100.00; 
const MAX_WITHDRAW = 50000.00; 

// নাম্বার
const BKASH_NUMBERS = ["01911111101", "01911111102", "01911111103", "01911111104", "01911111105"];
const NAGAD_NUMBERS = ["01922222201", "01922222202", "01922222203", "01922222204", "01922222205"];

const MULTIPLIER_LEVELS = [1, 2, 3, 5]; 
const SYMBOL_VALUES = { 'golden_burger': 50, 'ace': 20, 'king': 15, 'queen': 10, 'jack': 8, 'spade': 5 };
const SYMBOL_KEYS = ['golden_burger', 'ace', 'king', 'queen', 'jack', 'spade'];

// =======================================================
// Scene 1: Login Scene
// =======================================================
class LoginScene extends Phaser.Scene {
    constructor() { super('LoginScene'); this.username = ''; this.password = ''; this.mobile = ''; this.newUsername = ''; this.newPassword = ''; this.refCode = ''; }
    
    preload() {
        this.load.image('background', 'assets/new_background.jpg');
    }

    create() {
        const { width, height } = this.scale;
        this.add.image(width/2, height/2, 'background').setDisplaySize(width, height);
        this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7); 

        this.add.text(width/2, 150, 'SuperAce Casino', { font: 'bold 45px Arial', fill: '#FFD700', stroke: '#000', strokeThickness: 6 }).setOrigin(0.5); 

        this.loginContainer = this.createLoginUI(width, height);
        this.regContainer = this.createRegistrationUI(width, height);
        this.regContainer.setVisible(false);
        this.setupEventListeners();
    }

    createInputField(x, y, p, n, isP) { 
        const bg = this.add.rectangle(x, y, 320, 55, 0xFFFFFF).setStrokeStyle(2, 0xFFD700).setInteractive({ useHandCursor: true });
        const txt = this.add.text(x-150, y, p, { fontSize: '20px', fill: '#555', fontStyle: 'bold' }).setOrigin(0, 0.5);
        bg.on('pointerdown', () => {
            let v = prompt(`${p}:`, this[n] || '');
            if (v !== null) { this[n] = v; txt.setText(v ? (isP ? '•'.repeat(v.length) : v) : p).setFill(v ? '#000' : '#555'); }
        });
        return this.add.container(0, 0, [bg, txt]);
    }

    createBtn(x, y, text, color, cb) {
        const bg = this.add.rectangle(0, 0, 250, 60, color).setInteractive({useHandCursor:true});
        const txt = this.add.text(0, 0, text, { fontSize: '26px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5);
        bg.on('pointerdown', () => {
            this.tweens.add({ targets: [bg, txt], scale: 0.9, duration: 50, yoyo: true });
            this.time.delayedCall(100, cb);
        });
        return this.add.container(x, y, [bg, txt]);
    }

    createLoginUI(w, h) {
        const c = this.add.container(0, 0);
        c.add(this.add.text(w/2, 280, 'MEMBER LOGIN', { fontSize: '28px', fill: '#FFF', fontStyle: 'bold' }).setOrigin(0.5));
        c.add(this.createInputField(w/2, 360, 'Username / Mobile', 'username', false));
        c.add(this.createInputField(w/2, 440, 'Password', 'password', true));
        c.add(this.createBtn(w/2, 540, 'LOGIN', 0xFFD700, this.handleLogin.bind(this)).setName('loginBtn'));
        const reg = this.add.text(w/2, 630, 'New User? Register Here', { fontSize: '20px', fill: '#00FF00', fontStyle: 'bold' }).setOrigin(0.5).setInteractive({useHandCursor:true}).setName('registerBtn');
        c.add(reg); return c;
    }

    createRegistrationUI(w, h) {
        const c = this.add.container(0, 0);
        c.add(this.add.text(w/2, 250, 'REGISTRATION', { fontSize: '28px', fill: '#FFF', fontStyle: 'bold' }).setOrigin(0.5));
        c.add(this.createInputField(w/2, 320, 'Mobile Number', 'mobile', false));
        c.add(this.createInputField(w/2, 390, 'Username', 'newUsername', false));
        c.add(this.createInputField(w/2, 460, 'Password', 'newPassword', true));
        c.add(this.createInputField(w/2, 530, 'Referral Code', 'refCode', false));
        c.add(this.createBtn(w/2, 630, 'REGISTER', 0x00FF00, this.handleRegistration.bind(this)).setName('confirmRegBtn'));
        const back = this.add.text(w/2, 720, '<< Back to Login', { fontSize: '20px', fill: '#FFD700', fontStyle: 'bold' }).setOrigin(0.5).setInteractive({useHandCursor:true}).setName('backBtn');
        c.add(back); return c;
    }
    
    setupEventListeners() {
        this.regContainer.getByName('backBtn').on('pointerdown', () => { this.loginContainer.setVisible(true); this.regContainer.setVisible(false); });
        this.loginContainer.getByName('registerBtn').on('pointerdown', () => { this.loginContainer.setVisible(false); this.regContainer.setVisible(true); });
    }
    
    handleLogin() {
        if(!this.username || !this.password) return alert('Enter credentials');
        fetch('/api/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:this.username, password:this.password}) })
        .then(r=>r.json()).then(d=>{ if(d.success) this.scene.start('GameScene', {user:d.user}); else alert(d.message); })
        .catch(e => alert("Server Error. Check connection."));
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
        this.depositData = { method: '', amount: 0, phone: '', trx: '' }; 
        this.multiplierIndex = 0; 
        this.multiplierTexts = []; 
        this.forceWin = false;
        this.currentWinRate = 30;
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
        
        SYMBOL_KEYS.forEach(k => this.load.image(k, `assets/${k}.png`));
        
        this.load.audio('spin_start', 'assets/spin_start.mp3');
        this.load.audio('reel_stop', 'assets/reel_stop.mp3');
        this.load.audio('win_sound', 'assets/win_sound.mp3');
    }

    create() {
        try {
            this.isSpinning = false; this.currentBet = 10.00; this.reelsStopped = 0;
            const { width, height } = this.scale;
            
            this.add.image(width/2, height/2, 'background').setDisplaySize(width, height);

            const maskShape = this.make.graphics().fillStyle(0xffffff).fillRect(START_X-REEL_WIDTH/2-5, START_Y-SYMBOL_HEIGHT/2-5, TOTAL_GRID_WIDTH+10, (SYMBOL_HEIGHT*ROW_COUNT)+(GAP*ROW_COUNT)+20);
            const gridMask = maskShape.createGeometryMask();
            
            const frameCenterY = START_Y + ((ROW_COUNT-1)*(SYMBOL_HEIGHT+GAP))/2;
            this.add.image(width/2, frameCenterY, 'reel_frame_img').setDisplaySize(TOTAL_GRID_WIDTH+50, (SYMBOL_HEIGHT*ROW_COUNT)+60).setDepth(0); 
        
            this.symbols = [];
            for (let reel=0; reel<REEL_COUNT; reel++) {
                this.symbols[reel] = []; 
                for (let row=0; row<ROW_COUNT; row++) {
                    const x = START_X + reel*(REEL_WIDTH+GAP); 
                    const y = START_Y + row*(SYMBOL_HEIGHT+GAP); 
                    
                    this.add.image(x, y, 'golden_frame').setDisplaySize(REEL_WIDTH, SYMBOL_HEIGHT).setDepth(1); 
                    const s = this.add.image(x, y, Phaser.Utils.Array.GetRandom(SYMBOL_KEYS)).setDisplaySize(REEL_WIDTH-20, SYMBOL_HEIGHT-20).setDepth(2).setMask(gridMask);
                    s.originalX = x; s.originalY = y; s.rowIndex = row; 
                    this.symbols[reel][row] = s;
                }
            }

            this.add.text(width/2, 60, 'SuperAce', { font: 'bold 48px Arial', fill: '#FFD700', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5); 
            this.multiplierTexts = MULTIPLIER_LEVELS.map((l, i) => this.add.text((width/2-120)+i*80, 130, `x${l}`, { font: 'bold 28px Arial', fill: '#888' }).setOrigin(0.5));

            const uiY = height - 100; 
            
            this.spinButton = this.add.image(width/2, uiY, 'bet_button').setScale(0.08).setInteractive().setDepth(50);
            this.spinButton.on('pointerdown', this.startSpin, this);
            this.add.text(width/2, uiY, 'SPIN', { font: 'bold 18px Arial', fill: '#FFD700' }).setOrigin(0.5).setDepth(51);

            this.add.image(width-80, uiY-50, 'plus_button').setScale(0.2).setInteractive().on('pointerdown', () => this.adjustBet(1));
            this.add.image(width-80, uiY+50, 'minus_button').setScale(0.2).setInteractive().on('pointerdown', () => this.adjustBet(-1));
            this.betAdjustText = this.add.text(width-80, uiY+5, `Tk ${this.currentBet}`, { fontSize: '24px', fill: '#FFF' }).setOrigin(0.5).setDepth(50);
            
            this.balanceText = this.add.text(20, height-40, `Balance: Tk ${this.balance.toFixed(2)}`, { fontSize: '20px', fill: '#FFF' }).setDepth(50);
            this.menuButton = this.add.text(20, 40, '≡', { fontSize: '50px', fill: '#FFF' }).setOrigin(0, 0.5).setInteractive().setDepth(200); 
            this.menuButton.on('pointerdown', this.toggleMenu, this);

            this.centerWinText = this.add.text(width/2, height/2, '', { font: 'bold 60px Arial', fill: '#FF0', stroke:'#F00', strokeThickness:8 }).setOrigin(0.5).setVisible(false).setDepth(100);

            this.createMenuBar(width, height);
            this.time.addEvent({ delay: 5000, callback: this.refreshUserData, callbackScope: this, loop: true });

        } catch (e) {
            alert("Game Error: " + e.message + "\nPlease clear cache and reload.");
        }
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
        this.spinButton.setAlpha(0.5);
        this.centerWinText.setVisible(false);

        fetch('/api/update-balance', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:this.currentUser.username, amount: -this.currentBet}) })
        .then(r=>r.json()).then(d => {
            if(d.success) {
                this.balance = d.newBalance; 
                this.updateUI();
                try { this.sound.play('spin_start'); } catch(e){} 
                
                const result = this.getSpinResult();
                this.reelsStopped = 0;
                
                for (let reel=0; reel<REEL_COUNT; reel++) {
                    for (let row=0; row<ROW_COUNT; row++) {
                        const s = this.symbols[reel][row];
                        this.tweens.add({
                            targets: s, y: s.y - SYMBOL_SHIFT_COUNT*(SYMBOL_HEIGHT+GAP), duration: SPIN_DURATION_PER_REEL*(reel*1.5+4), ease: 'Quad.easeOut',
                            onUpdate: (t, tg) => { if(Math.random()>0.5) tg.setTexture(Phaser.Utils.Array.GetRandom(SYMBOL_KEYS)); },
                            onComplete: (t, tg) => {
                                const trg = tg[0]; trg.setTexture(result[reel][trg.rowIndex]); trg.y = START_Y + trg.rowIndex*(SYMBOL_HEIGHT+GAP);
                                if(trg.rowIndex === ROW_COUNT-1) this.stopReel();
                            }
                        });
                    }
                }
            }
        });
    }

    stopReel() {
        this.reelsStopped++; 
        try { this.sound.play('reel_stop'); } catch(e){}
        if (this.reelsStopped === REEL_COUNT) {
            this.isSpinning = false; this.spinButton.setAlpha(1);
            const grid = this.symbols.map(r => r.map(s => s.texture.key));
            const win = this.checkWin(grid);
            
            if (win > 0) {
                try { this.sound.play('win_sound'); } catch(e){}
                this.centerWinText.setText(`WIN: Tk ${win}`).setVisible(true);
                fetch('/api/update-balance', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:this.currentUser.username, amount: win}) })
                .then(r=>r.json()).then(d => { this.balance = d.newBalance; this.updateUI(); });
                this.time.delayedCall(2000, () => this.centerWinText.setVisible(false));
            }
        }
    }

    checkWin(grid) {
        let total = 0;
        for (let r=0; r<ROW_COUNT; r++) {
            let sym = grid[0][r], m = 1;
            for (let c=1; c<REEL_COUNT; c++) { if (grid[c][r] === sym) m++; else break; }
            if (m >= 3) total += this.currentBet * SYMBOL_VALUES[sym] * (m-2);
        }
        return total;
    }

    getSpinResult() {
        const grid = Array.from({length:REEL_COUNT},()=>[]);
        const isWin = this.forceWin || (Phaser.Math.Between(1,100) <= this.currentWinRate);
        const winSym = isWin ? Phaser.Utils.Array.GetRandom(SYMBOL_KEYS) : null;
        const winRow = isWin ? Phaser.Math.Between(0, ROW_COUNT-1) : -1;
        const match = isWin ? Phaser.Math.Between(3, REEL_COUNT) : 0;

        for (let c=0; c<REEL_COUNT; c++) {
            for (let r=0; r<ROW_COUNT; r++) {
                if (isWin && r===winRow && c < match) grid[c][r] = winSym;
                else {
                    let s; do { s = Phaser.Utils.Array.GetRandom(SYMBOL_KEYS); } while(c>=2 && s===grid[c-1][r] && s===grid[c-2][r]);
                    grid[c][r] = s;
                }
            }
        }
        return grid;
    }

    createMenuBar(w, h) {
        const c = this.add.container(-350, 0).setDepth(200); this.menuBar = c;
        c.add(this.add.rectangle(0, h/2, 350, h, 0x111111).setOrigin(0, 0.5).setStrokeStyle(2, 0xFFD700));
        c.add(this.add.text(175, 60, 'MENU', { fontSize: '40px', fill: '#FFD700', fontStyle: 'bold' }).setOrigin(0.5));
        
        let y = 150;
        const btns = [
            {t: 'DEPOSIT', c: 0x00FF00, cb: ()=>this.showDepositPanel()},
            {t: 'WITHDRAW', c: 0xFFA500, cb: ()=>this.showWithdrawPanel()},
            {t: 'HISTORY', c: 0x00AAFF, cb: ()=>this.showHistoryPanel()}
        ];
        btns.forEach(b => { c.add(this.createGlossyBtn(175, y, b.t, b.c, b.cb)); y+=80; });

        if(this.isAdmin) {
            c.add(this.add.text(175, y+20, 'ADMIN TOOLS', {fontSize:'24px', fill:'#F00'}).setOrigin(0.5)); y+=60;
            c.add(this.createGlossyBtn(175, y, 'USER LIST', 0x555555, ()=>this.showUserListPanel())); y+=80;
            c.add(this.createGlossyBtn(175, y, 'DEPOSIT REQ', 0x00AAFF, ()=>this.showAdminRequestsPanel('Deposit'))); y+=80;
            c.add(this.createGlossyBtn(175, y, 'WITHDRAW REQ', 0xFFA500, ()=>this.showAdminRequestsPanel('Withdraw'))); y+=80;
            
            const wb = this.add.text(175, y, ` Win: ${this.forceWin?'FORCE':this.currentWinRate+'%'} `, {fontSize:'20px', fill:'#FFF', backgroundColor:'#F00', padding:10}).setOrigin(0.5).setInteractive({useHandCursor:true});
            wb.on('pointerdown', ()=>{ this.forceWin=!this.forceWin; wb.setText(` Win: ${this.forceWin?'FORCE':this.currentWinRate+'%'} `); }); c.add(wb);
        }
        c.add(this.createGlossyBtn(175, h-100, 'LOGOUT', 0xFF0000, ()=>location.reload()));
    }

    createGlossyBtn(x, y, text, color, cb) {
        const bg = this.add.rectangle(0, 0, 220, 60, color).setInteractive({useHandCursor:true});
        const txt = this.add.text(0, 0, text, { fontSize: '24px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5);
        const c = this.add.container(x, y, [bg, txt]);
        bg.on('pointerdown', () => { 
            this.tweens.add({targets:c, scale:0.9, yoyo:true, duration:50}); 
            this.toggleMenu();
            this.time.delayedCall(150, cb); 
        });
        return c;
    }

    showDepositPanel() { this.showPaymentModal('DEPOSIT', 0xE2136E, 0xF58220); }
    showWithdrawPanel() { this.showPaymentModal('WITHDRAW', 0xE2136E, 0xF58220); }

    showPaymentModal(type, col1, col2) {
        const { width, height } = this.scale;
        const c = this.add.container(width/2, height/2).setDepth(300);
        c.add(this.add.rectangle(0, 0, width, height, 0x000000, 0.8)); // Dim background
        
        const panel = this.add.rectangle(0, 0, 480, 600, 0xFFFFFF).setStrokeStyle(4, type==='DEPOSIT'?0x00FF00:0xFF0000);
        c.add(panel);
        
        c.add(this.add.text(0, -250, `${type} METHOD`, { fontSize: '32px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5));

        const btn1 = this.add.rectangle(0, -150, 350, 70, col1).setInteractive({useHandCursor:true});
        const txt1 = this.add.text(0, -150, "bKash", { fontSize: '32px', fill: '#FFF', fontStyle: 'bold' }).setOrigin(0.5);
        btn1.on('pointerdown', () => { c.destroy(); this.initTransaction(type, 'bKash'); });
        c.add([btn1, txt1]);

        const btn2 = this.add.rectangle(0, -50, 350, 70, col2).setInteractive({useHandCursor:true});
        const txt2 = this.add.text(0, -50, "Nagad", { fontSize: '32px', fill: '#FFF', fontStyle: 'bold' }).setOrigin(0.5);
        btn2.on('pointerdown', () => { c.destroy(); this.initTransaction(type, 'Nagad'); });
        c.add([btn2, txt2]);

        const cls = this.add.text(0, 200, " CLOSE ", { fontSize: '24px', fill: '#FFF', backgroundColor: '#555', padding: 10 }).setOrigin(0.5).setInteractive({useHandCursor:true});
        cls.on('pointerdown', () => c.destroy());
        c.add(cls);
    }

    initTransaction(type, method) {
        const amount = parseFloat(prompt(`Enter Amount (Min ${type==='DEPOSIT'?MIN_DEPOSIT:MIN_WITHDRAW}):`));
        if(!amount || isNaN(amount)) return alert("Invalid Amount");
        this.showVerificationPanel(type, method, amount);
    }

    showVerificationPanel(type, method, amount) {
        const { width, height } = this.scale;
        const c = this.add.container(width/2, height/2).setDepth(400);
        const color = method === 'bKash' ? 0xE2136E : 0xF58220;
        
        c.add(this.add.rectangle(0, 0, 480, 600, 0xFFFFFF));
        c.add(this.add.rectangle(0, -250, 480, 100, color));
        c.add(this.add.text(0, -250, `${method} ${type}`, { fontSize: '36px', fill: '#FFF', fontStyle: 'bold' }).setOrigin(0.5));

        const num = (method==='bKash'?BKASH_NUMBERS:NAGAD_NUMBERS)[0];
        
        if (type === 'DEPOSIT') {
            c.add(this.add.text(0, -150, `Send Tk ${amount} to:`, { fontSize: '24px', fill: '#000' }).setOrigin(0.5));
            c.add(this.add.text(0, -100, num, { fontSize: '36px', fill: color, fontStyle: 'bold' }).setOrigin(0.5));
            c.add(this.add.text(0, -20, "Enter TrxID below:", { fontSize: '20px', fill: '#555' }).setOrigin(0.5));
        } else {
            c.add(this.add.text(0, -100, `Withdraw Tk ${amount}`, { fontSize: '24px', fill: '#000' }).setOrigin(0.5));
            c.add(this.add.text(0, -20, "Enter Wallet Number:", { fontSize: '20px', fill: '#555' }).setOrigin(0.5));
        }

        const inputBox = this.add.rectangle(0, 40, 350, 60, 0xEEEEEE).setStrokeStyle(2, 0x000000).setInteractive({useHandCursor:true});
        const inputText = this.add.text(0, 40, type==='DEPOSIT' ? "Tap to paste TrxID" : "Tap to type Number", { fontSize: '22px', fill: '#888' }).setOrigin(0.5);
        
        let userInput = "";
        inputBox.on('pointerdown', () => {
            userInput = prompt(type==='DEPOSIT' ? "Enter Transaction ID:" : "Enter Wallet Number:");
            if(userInput) { inputText.setText(userInput); inputText.setFill('#000'); }
        });
        c.add([inputBox, inputText]);

        const sub = this.add.rectangle(0, 150, 250, 60, 0x00AA00).setInteractive({useHandCursor:true});
        const subTxt = this.add.text(0, 150, "SUBMIT", { fontSize: '28px', fill: '#FFF', fontStyle: 'bold' }).setOrigin(0.5);
        sub.on('pointerdown', () => {
            if(!userInput) return alert("Please fill the input box!");
            fetch('/api/transaction', {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({
                    type: type === 'DEPOSIT' ? 'Deposit' : 'Withdraw',
                    method, amount, phone: type==='DEPOSIT'?this.currentUser.mobile:userInput, trx: type==='DEPOSIT'?userInput:'N/A',
                    username: this.currentUser.username
                })
            }).then(r=>r.json()).then(d => { alert(d.message); c.destroy(); });
        });
        c.add([sub, subTxt]);

        const cls = this.add.text(0, 250, "CANCEL", { fontSize: '20px', fill: '#F00', fontStyle: 'bold' }).setOrigin(0.5).setInteractive({useHandCursor:true});
        cls.on('pointerdown', () => c.destroy());
        c.add(cls);
    }

    showUserListPanel() {
        const { width, height } = this.scale;
        const c = this.add.container(width/2, height/2).setDepth(500);
        c.add(this.add.rectangle(0, 0, 520, 800, 0x222222).setStrokeStyle(2, 0xFFD700));
        c.add(this.add.text(0, -350, "USER MANAGEMENT", { fontSize: '28px', fill: '#FFD700' }).setOrigin(0.5));
        
        this.addCloseButton(c, ()=>c.destroy(), 350);

        fetch('/api/admin/users').then(r=>r.json()).then(users => {
            let y = -280;
            c.add(this.add.text(-240, y, "USER | MOBILE | BAL", { fontSize: '16px', fill: '#AAA', fontStyle: 'bold' }));
            y += 40;

            users.slice(0, 8).forEach(u => {
                if(u.username === 'admin') return;
                const info = `${u.username}\n${u.mobile}\nTk ${u.balance}`;
                c.add(this.add.text(-240, y, info, { fontSize: '16px', fill: '#FFF' }));
                
                const banTxt = u.isBanned ? "UNBAN" : "BAN";
                const banCol = u.isBanned ? 0x00AA00 : 0xFF0000;
                
                const btn = this.add.rectangle(180, y+20, 80, 40, banCol).setInteractive({useHandCursor:true});
                const txt = this.add.text(180, y+20, banTxt, { fontSize: '14px', fill: '#FFF' }).setOrigin(0.5);
                
                btn.on('pointerdown', () => {
                    fetch('/api/admin/ban-user', {
                        method: 'POST', headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ username: u.username, banStatus: !u.isBanned })
                    }).then(() => { c.destroy(); this.showUserListPanel(); });
                });
                c.add([btn, txt]);
                c.add(this.add.rectangle(0, y+55, 480, 1, 0x444444)); 
                y += 80;
            });
        });
    }

    showAdminRequestsPanel(type) {
        const { width, height } = this.scale;
        const c = this.add.container(width/2, height/2).setDepth(500);
        c.add(this.add.rectangle(0, 0, 520, 800, 0x222222).setStrokeStyle(2, 0xFFD700));
        c.add(this.add.text(0, -350, `${type.toUpperCase()} REQUESTS`, { fontSize: '28px', fill: '#FFD700' }).setOrigin(0.5));
        this.addCloseButton(c, ()=>c.destroy(), 350);

        fetch('/api/admin/transactions').then(r=>r.json()).then(data => {
            const list = data.filter(t => t.status === 'Pending' && t.type === type);
            if(list.length === 0) return c.add(this.add.text(0, 0, "No Pending Requests", { fontSize: '20px', fill: '#AAA' }).setOrigin(0.5));

            let y = -250;
            list.slice(0, 5).forEach(req => {
                const txt = `User: ${req.username}\nAmt: ${req.amount}\n${req.type==='Deposit' ? 'Trx: '+req.trx : 'Ph: '+req.phone}`;
                c.add(this.add.text(-230, y, txt, { fontSize: '18px', fill: '#FFF' }));

                const okBtn = this.add.rectangle(150, y+20, 60, 40, 0x00AA00).setInteractive({useHandCursor:true});
                const okTxt = this.add.text(150, y+20, "✔", { fontSize: '24px', fill: '#FFF' }).setOrigin(0.5);
                okBtn.on('pointerdown', () => this.handleAdminAction(req.trx||req.phone, 'approve', req, c, type));

                const noBtn = this.add.rectangle(220, y+20, 60, 40, 0xFF0000).setInteractive({useHandCursor:true});
                const noTxt = this.add.text(220, y+20, "X", { fontSize: '24px', fill: '#FFF' }).setOrigin(0.5);
                noBtn.on('pointerdown', () => this.handleAdminAction(req.trx||req.phone, 'reject', req, c, type));

                c.add([okBtn, okTxt, noBtn, noTxt]);
                c.add(this.add.rectangle(0, y+60, 480, 1, 0x444444));
                y += 90;
            });
        });
    }

    handleAdminAction(id, action, req, panel, type) {
        fetch('/api/admin/action', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ trxId: id, action, type: req.type, amount: req.amount, username: req.username })
        }).then(() => { panel.destroy(); this.showAdminRequestsPanel(type); });
    }

    showHistoryPanel() {
        const { width, height } = this.scale;
        const c = this.add.container(width/2, height/2).setDepth(300);
        c.add(this.add.rectangle(0, 0, 480, 700, 0x111111).setStrokeStyle(2, 0xFFFFFF));
        c.add(this.add.text(0, -320, "HISTORY", { fontSize: '28px', fill: '#FFF' }).setOrigin(0.5));
        this.addCloseButton(c, ()=>c.destroy(), 320);

        fetch(`/api/history?username=${this.currentUser.username}`).then(r=>r.json()).then(d => {
            let y = -250;
            d.slice(0, 7).forEach(h => {
                const col = h.status==='Success' ? '#0F0' : (h.status==='Failed'?'#F00':'#FF0');
                const t = `${h.type} | Tk ${h.amount}\n${new Date(h.date).toLocaleDateString()} | ${h.status}`;
                c.add(this.add.text(-200, y, t, { fontSize: '18px', fill: col }));
                c.add(this.add.rectangle(0, y+50, 400, 1, 0x333));
                y += 70;
            });
        });
    }

    addCloseButton(c, cb, y) {
        const b = this.add.rectangle(0, y, 200, 50, 0x555555).setInteractive({useHandCursor:true});
        const t = this.add.text(0, y, "CLOSE", { fontSize: '20px', fill: '#FFF' }).setOrigin(0.5);
        b.on('pointerdown', cb); c.add([b, t]);
    }

    updateUI() { 
        if(this.balanceText) this.balanceText.setText(`Balance: Tk ${this.balance.toFixed(2)}`); 
        if(this.betAdjustText) this.betAdjustText.setText(`Tk ${this.currentBet}`);
    }
    adjustBet(n) { let b=this.currentBet+n; if(b>=1 && b<=1000){this.currentBet=b; this.updateUI();} }
    toggleMenu() { this.isMenuOpen=!this.isMenuOpen; this.tweens.add({targets:this.menuBar, x:this.isMenuOpen?0:-350, duration:300}); }
}
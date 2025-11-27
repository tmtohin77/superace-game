const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ১. স্ট্যাটিক ফাইল ফোল্ডার চিনিয়ে দেওয়া
app.use(express.static(path.join(__dirname, 'public')));

// --- SERVER DATABASE (Mock) ---
let users = [
    { username: 'testuser', password: 'password123', mobile: '01111111111', balance: 0.00 },
    { username: 'admin', password: 'admin', mobile: '01000000000', balance: 999999999.00 }
];
let transactions = [];

// --- APIs ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => (u.username === username || u.mobile === username) && u.password === password);
    if (user) {
        const { password, ...userInfo } = user; 
        res.json({ success: true, user: userInfo });
    } else {
        res.json({ success: false, message: 'Invalid Credentials' });
    }
});

app.post('/api/register', (req, res) => {
    const { mobile, username, password } = req.body;
    const exists = users.some(u => u.mobile === mobile || u.username === username);
    if (exists) return res.json({ success: false, message: 'User already exists!' });
    users.push({ username, password, mobile, balance: 0.00 });
    res.json({ success: true, message: 'Registration Successful!' });
});

app.post('/api/transaction', (req, res) => {
    const trxData = req.body; 
    transactions.push({ ...trxData, status: 'Pending', date: new Date() });
    
    if (trxData.type === 'Withdraw') {
        const user = users.find(u => u.username === trxData.username);
        if (user && user.balance >= trxData.amount) {
            user.balance -= trxData.amount;
            res.json({ success: true, message: 'Request Submitted' });
        } else {
            res.json({ success: false, message: 'Insufficient Balance' });
        }
    } else {
        res.json({ success: true, message: 'Request Submitted' });
    }
});

app.post('/api/update-balance', (req, res) => {
    const { username, amount } = req.body;
    const user = users.find(u => u.username === username);
    if (user) {
        user.balance += amount;
        user.balance = parseFloat(user.balance.toFixed(2));
        res.json({ success: true, newBalance: user.balance });
    } else {
        res.json({ success: false });
    }
});

app.get('/api/admin/transactions', (req, res) => res.json(transactions));

app.post('/api/admin/action', (req, res) => {
    const { trxId, action, type, amount, username } = req.body;
    const trx = transactions.find(t => t.trx == trxId || t.phone == trxId); 

    if (trx) {
        trx.status = action === 'approve' ? 'Success' : 'Failed';

        if (action === 'approve' && type === 'Deposit') {
            const user = users.find(u => u.username === username);
            if (user) user.balance += amount;
        }
        if (action === 'reject' && type === 'Withdraw') {
            const user = users.find(u => u.username === username);
            if (user) user.balance += amount;
        }
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Transaction not found' });
    }
});

// ২. মেইন রুট (সমস্যা সমাধান করা হয়েছে)
// '*' বা '/(.*)' এর বদলে আমরা সরাসরি রুট ব্যবহার করছি অথবা স্ট্যাটিক ফাইলের উপর নির্ভর করছি
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ৩. সার্ভার চালু
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
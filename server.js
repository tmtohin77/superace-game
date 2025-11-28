const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Security Library

const app = express();
const PORT = process.env.PORT || 3000;

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://tmtohin177:superace123@cluster0.nsyah8t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// --- SCHEMAS ---
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0.00 },
    isAdmin: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false } // Ban Feature
});
const User = mongoose.model('User', UserSchema);

const TransactionSchema = new mongoose.Schema({
    type: String, amount: Number, method: String, phone: String, trx: String, username: String,
    status: { type: String, default: 'Pending' },
    date: { type: Date, default: Date.now },
    seenByAdmin: { type: Boolean, default: false } // For Notification
});
const Transaction = mongoose.model('Transaction', TransactionSchema);

// --- AUTO ADMIN WITH SECURE PASSWORD ---
async function initAdmin() {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
        // পাসওয়ার্ড এনক্রিপ্ট করা হচ্ছে
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin', salt);
        
        await new User({ 
            username: 'admin', 
            password: hashedPassword, 
            mobile: '01000000000', 
            balance: 999999999, 
            isAdmin: true 
        }).save();
        console.log("🔥 Admin Account Created Securely!");
    }
}
initAdmin();

// --- ROUTES ---

// 1. Secure Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ $or: [{ username }, { mobile: username }] });
        if (!user) return res.json({ success: false, message: 'User not found' });

        // Ban Check
        if (user.isBanned) return res.json({ success: false, message: 'ACCOUNT BANNED! Contact Admin.' });

        // Password Check (Hash Comparison)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.json({ success: false, message: 'Invalid Password' });

        const userData = user.toObject();
        delete userData.password; // পাসওয়ার্ড লুকিয়ে পাঠানো
        res.json({ success: true, user: userData });

    } catch (err) { res.status(500).json({ success: false }); }
});

// 2. Secure Register (Strict Duplicate Check)
app.post('/api/register', async (req, res) => {
    const { mobile, username, password } = req.body;
    try {
        const exists = await User.findOne({ $or: [{ mobile }, { username }] });
        if (exists) return res.json({ success: false, message: 'Username or Mobile already exists!' });

        // Password Encryption
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ username, password: hashedPassword, mobile, balance: 0.00 });
        await newUser.save();
        res.json({ success: true, message: 'Registration Successful!' });
    } catch (err) { res.status(500).json({ success: false }); }
});

// 3. Transactions
app.post('/api/transaction', async (req, res) => {
    const trxData = req.body;
    try {
        if (trxData.type === 'Withdraw') {
            const user = await User.findOne({ username: trxData.username });
            if (user && user.balance >= trxData.amount) {
                user.balance -= trxData.amount;
                await user.save();
                const newTrx = new Transaction(trxData);
                await newTrx.save();
                res.json({ success: true, message: 'Withdraw Request Submitted', newBalance: user.balance });
            } else {
                res.json({ success: false, message: 'Insufficient Balance' });
            }
        } else {
            const newTrx = new Transaction(trxData);
            await newTrx.save();
            res.json({ success: true, message: 'Deposit Request Submitted' });
        }
    } catch (err) { res.status(500).json({ success: false }); }
});

app.post('/api/update-balance', async (req, res) => {
    const { username, amount } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user) {
            user.balance += amount;
            user.balance = parseFloat(user.balance.toFixed(2));
            await user.save();
            res.json({ success: true, newBalance: user.balance });
        } else res.json({ success: false });
    } catch (err) { res.status(500).json({ success: false }); }
});

// 4. Admin APIs
app.get('/api/admin/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 }).limit(50);
        res.json(transactions);
    } catch (err) { res.json([]); }
});

app.get('/api/admin/users', async (req, res) => {
    try {
        // ইউজার লিস্টে Ban Status পাঠানো হচ্ছে
        const users = await User.find({}, 'username mobile balance isBanned').sort({ _id: -1 });
        res.json(users);
    } catch (err) { res.json([]); }
});

app.post('/api/admin/action', async (req, res) => {
    const { trxId, action, type, amount, username } = req.body;
    try {
        const trx = await Transaction.findOne({ $or: [{ trx: trxId }, { phone: trxId }], status: 'Pending' });
        if (trx) {
            trx.status = action === 'approve' ? 'Success' : 'Failed';
            trx.seenByAdmin = true;
            await trx.save();
            
            const user = await User.findOne({ username });
            if (user) {
                if (action === 'approve' && type === 'Deposit') user.balance += amount;
                if (action === 'reject' && type === 'Withdraw') user.balance += amount;
                user.balance = parseFloat(user.balance.toFixed(2));
                await user.save();
            }
            res.json({ success: true });
        } else res.json({ success: false });
    } catch (err) { res.status(500).json({ success: false }); }
});

// ** NEW: Ban User API **
app.post('/api/admin/ban-user', async (req, res) => {
    const { username, banStatus } = req.body;
    try {
        const user = await User.findOne({ username });
        if(user) {
            user.isBanned = banStatus;
            await user.save();
            res.json({ success: true, message: `User ${banStatus ? 'BANNED' : 'UNBANNED'}` });
        } else {
            res.json({ success: false, message: 'User not found' });
        }
    } catch(err) { res.json({ success: false }); }
});

// ** NEW: Notification API (Check New Deposits) **
app.get('/api/admin/notifications', async (req, res) => {
    try {
        const count = await Transaction.countDocuments({ type: 'Deposit', status: 'Pending', seenByAdmin: false });
        res.json({ count });
    } catch(err) { res.json({ count: 0 }); }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
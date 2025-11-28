const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// ⚠️ আপনার MongoDB লিংকটি নিচে পেস্ট করুন (পাসওয়ার্ড সহ)
// ============================================================
const MONGO_URI = "mongodb+srv://tmtohin177:superace123@cluster0.nsyah8t.mongodb.net/?appName=Cluster0"; 
// উদাহরণ: "mongodb+srv://admin:superace123@cluster0.abcd.mongodb.net/?retryWrites=true&w=majority"

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- DATABASE SCHEMAS & MODELS ---

// 1. User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true },
    balance: { type: Number, default: 0.00 },
    isAdmin: { type: Boolean, default: false }
});
const User = mongoose.model('User', UserSchema);

// 2. Transaction Schema
const TransactionSchema = new mongoose.Schema({
    type: String, // Deposit or Withdraw
    amount: Number,
    method: String,
    phone: String,
    trx: String,
    username: String,
    status: { type: String, default: 'Pending' },
    date: { type: String, default: () => new Date().toLocaleString() }
});
const Transaction = mongoose.model('Transaction', TransactionSchema);

// --- API ROUTES ---

// 1. Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ 
            $or: [{ username: username }, { mobile: username }],
            password: password 
        });
        
        if (user) {
            // Check if admin (Hardcoded security for first admin)
            const userData = user.toObject();
            if(user.username === 'admin') userData.isAdmin = true;
            
            res.json({ success: true, user: userData });
        } else {
            res.json({ success: false, message: 'Invalid Credentials' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// 2. Register
app.post('/api/register', async (req, res) => {
    const { mobile, username, password } = req.body;
    try {
        const exists = await User.findOne({ $or: [{ mobile }, { username }] });
        if (exists) return res.json({ success: false, message: 'User or Mobile already exists!' });

        const newUser = new User({ username, password, mobile, balance: 0.00 });
        await newUser.save();
        res.json({ success: true, message: 'Registration Successful!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error registering user' });
    }
});

// 3. Transaction Request
app.post('/api/transaction', async (req, res) => {
    const trxData = req.body; 
    try {
        const newTrx = new Transaction(trxData);
        await newTrx.save();

        // Withdraw হলে সাথে সাথে ব্যালেন্স কেটে রাখা হবে
        if (trxData.type === 'Withdraw') {
            const user = await User.findOne({ username: trxData.username });
            if (user && user.balance >= trxData.amount) {
                user.balance -= trxData.amount;
                await user.save();
                res.json({ success: true, message: 'Withdraw Request Submitted', newBalance: user.balance });
            } else {
                // ব্যালেন্স না থাকলে ট্রানজেকশন ডিলিট বা ফেইল করা উচিত, আপাতত এরর দিচ্ছি
                await Transaction.findByIdAndDelete(newTrx._id);
                res.json({ success: false, message: 'Insufficient Balance' });
            }
        } else {
            res.json({ success: true, message: 'Deposit Request Submitted' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Transaction Failed' });
    }
});

// 4. Update Balance (Win/Loss/Admin Add)
app.post('/api/update-balance', async (req, res) => {
    const { username, amount } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user) {
            user.balance += amount;
            user.balance = parseFloat(user.balance.toFixed(2));
            await user.save();
            res.json({ success: true, newBalance: user.balance });
        } else {
            res.json({ success: false });
        }
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// 5. Get History
app.get('/api/history', async (req, res) => {
    const { username } = req.query;
    if (!username) return res.json([]);
    try {
        const history = await Transaction.find({ username }).sort({ _id: -1 }).limit(20);
        res.json(history);
    } catch (err) {
        res.json([]);
    }
});

// 6. Admin: Get All Transactions
app.get('/api/admin/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ _id: -1 }).limit(50);
        res.json(transactions);
    } catch (err) {
        res.json([]);
    }
});

// 7. Admin Action
app.post('/api/admin/action', async (req, res) => {
    const { trxId, action, type, amount, username } = req.body; // trxId here is actually the 'trx' string or phone
    
    try {
        // Find by TRX ID or Phone (since we stored trx string, not _id in frontend logic for simplicity)
        const trx = await Transaction.findOne({ 
            $or: [{ trx: trxId }, { phone: trxId }], 
            status: 'Pending' 
        });

        if (trx) {
            trx.status = action === 'approve' ? 'Success' : 'Failed';
            await trx.save();

            const user = await User.findOne({ username });
            
            if (user) {
                if (action === 'approve' && type === 'Deposit') {
                    user.balance += amount;
                }
                if (action === 'reject' && type === 'Withdraw') {
                    user.balance += amount; // Refund
                }
                user.balance = parseFloat(user.balance.toFixed(2));
                await user.save();
            }
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Transaction not found or already processed' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error processing action' });
    }
});

// Serve Game
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
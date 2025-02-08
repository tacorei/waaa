require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const flash = require('express-flash');  // ✅ 追加
const passport = require('passport');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const path = require('path');

const app = express();

// **セッション設定**
app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: false
}));

// **Flash メッセージの設定**
app.use(flash());  // ✅ 追加

// **Passportの設定**
app.use(passport.initialize());
app.use(passport.session());

// **ミドルウェア設定**
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// **ルート設定**
app.get('/', (req, res) => { 
    res.sendFile(path.join(__dirname, 'public', 'login.html'));  
});

// **APIルートの登録**
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// **サーバー起動**
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});

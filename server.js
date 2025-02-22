require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const path = require('path');

const app = express();

// **EJSの設定**
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// **セッション設定**
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key',
    resave: false,
    saveUninitialized: false
}));

// **Flash メッセージの設定**
app.use(flash());

// **Passportの設定**
app.use(passport.initialize());
app.use(passport.session());

// **ミドルウェア設定**
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// **ルート設定**
// ログイン画面（未ログインユーザー向け）
app.get('/', (req, res) => {
    res.render('login', { message: req.flash('error') });
});

// **ログイン後のトップページ**
app.get('/top', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.render('top');
});

// **ログイン中のユーザー向けのパスワード変更ページ**
app.get('/update-password', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login.html');
    }
    res.render('update_password', { message: '' });
});

// **未ログインユーザー向けのパスワードリセットページ**
app.get('/reset-password', (req, res) => {
    res.render('reset_password', { message: '' });
});

// **APIルートの登録**
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// **404エラーハンドリング**
app.use((req, res, next) => {
    res.status(404).render('404', { message: 'ページが見つかりませんでした。' });
});

// **サーバー起動**
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});

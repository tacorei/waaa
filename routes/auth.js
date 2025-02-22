const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('../db/database');

const router = express.Router();

// **ユーザー認証の戦略**
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return done(err);
        if (!user) return done(null, false, { message: 'ユーザーが見つかりません' });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return done(null, false, { message: 'パスワードが間違っています' });

        return done(null, user);
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
        done(err, user);
    });
});

// **ユーザー登録API**
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // **パスワードをハッシュ化**
    const hashedPassword = await bcrypt.hash(password, 10);

    // **データベースに追加**
    db.run('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', [username, email, hashedPassword], (err) => {
        if (err) {
            req.flash('error', 'ユーザー登録に失敗しました');
            return res.redirect('/register');
        }
        req.flash('success', 'ユーザー登録が完了しました');
        res.redirect('/login.html');
    });
});

// **ログインAPI**
router.post('/login', passport.authenticate('local', {
    successRedirect: '/todolist.html',
    failureRedirect: '/login.html',
    failureFlash: true
}));

// **ログアウトAPI**
router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success', 'ログアウトしました');
        res.redirect('/');
    });
});

// **ログインユーザー向けのパスワード更新API**
router.post('/update-password', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'ログインしてください' });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // 現在のパスワードが正しいか確認
    db.get('SELECT password_hash FROM users WHERE id = ?', [userId], async (err, user) => {
        if (err) return res.status(500).json({ message: 'エラーが発生しました' });

        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) return res.status(400).json({ message: '現在のパスワードが間違っています' });

        // 新しいパスワードをハッシュ化
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // データベースに更新
        db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId], (err) => {
            if (err) {
                return res.status(500).json({ message: 'パスワード更新に失敗しました' });
            }
            res.json({ message: 'パスワードが更新されました' });
        });
    });
});

// **未ログインユーザー向けのパスワードリセットAPI**
router.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    // メールアドレスが存在するか確認
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ message: 'エラーが発生しました' });
        if (!user) return res.status(400).json({ message: '登録されていないメールアドレスです' });

        // 新しいパスワードをハッシュ化
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // パスワードの更新
        db.run('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, email], (err) => {
            if (err) {
                return res.status(500).json({ message: 'パスワード更新に失敗しました' });
            }
            res.json({ message: 'パスワードが更新されました。再度ログインしてください。' });
        });
    });
});

module.exports = router;

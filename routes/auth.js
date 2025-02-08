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
            req.flash('error', 'ユーザー登録に失敗しました');  // ✅ 追加
            return res.redirect('/register');
        }
        req.flash('success', 'ユーザー登録が完了しました');  // ✅ 追加
        res.redirect('/login.html');
    });
});

// **ログインAPI**
router.post('/login', passport.authenticate('local', {
    successRedirect: '/todolist.html',
    failureRedirect: '/login.html',
    failureFlash: true  // ✅ 追加
}));

// **ログアウトAPI**
router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success', 'ログアウトしました');  // ✅ 追加
        res.redirect('/');
    });
});

module.exports = router;

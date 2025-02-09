const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// データベース接続
const db = new sqlite3.Database('./db/task_manager.db', (err) => {
    if (err) {
        console.error('データベース接続エラー:', err.message);
    } else {
        console.log('✅ データベースに接続しました');
    }
});

// 登録するデータ
const username = 'ao';
const email = 'waa@gmail.com';
const plainPassword = 'po';

// パスワードをハッシュ化
bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
    if (err) {
        console.error('パスワードのハッシュ化エラー:', err.message);
        return;
    }

    // `users` テーブル作成（存在しない場合）
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password_hash TEXT
    )`, (err) => {
        if (err) {
            console.error('テーブル作成エラー:', err.message);
        } else {
            console.log('✅ users テーブルの準備完了');
        }

        // データの挿入
        const query = `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`;
        db.run(query, [username, email, hashedPassword], function(err) {
            if (err) {
                console.error('データ登録エラー:', err.message);
            } else {
                console.log(`✅ ユーザー ${username} を登録しました (ID: ${this.lastID})`);
            }
            db.close();
        });
    });
});

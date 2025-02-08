const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db/task_manager.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// ユーザーテーブルの作成
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
)`);

// タスクテーブルの作成
db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
)`);

// フレンドテーブルの作成
db.run(`CREATE TABLE IF NOT EXISTS friends (
    user_id INTEGER,
    friend_id INTEGER,
    status TEXT DEFAULT 'pending',
    PRIMARY KEY(user_id, friend_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(friend_id) REFERENCES users(id)
)`);

// ポイントテーブルの作成
db.run(`CREATE TABLE IF NOT EXISTS points (
    user_id INTEGER PRIMARY KEY,
    points INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
)`);

module.exports = db;

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db/task_manager.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('✅ Connected to the SQLite database.');
});

// **ユーザーテーブルの作成**
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
)`);

// **タスクテーブルの作成**
db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    status TEXT DEFAULT '未完了',  -- 初期ステータスは「未完了」
    alarm_time TEXT,               -- 新規追加：アラーム設定時間
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
)`);

// **トリガーの作成（タスク更新時の updated_at を自動更新）**
db.run(`CREATE TRIGGER IF NOT EXISTS update_task_timestamp
AFTER UPDATE ON tasks
BEGIN
    UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;`);

// **フレンドテーブルの作成**
db.run(`CREATE TABLE IF NOT EXISTS friends (
    user_id INTEGER,
    friend_id INTEGER,
    status TEXT DEFAULT 'pending',
    PRIMARY KEY(user_id, friend_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(friend_id) REFERENCES users(id)
)`);

// **ポイントテーブルの作成**
db.run(`CREATE TABLE IF NOT EXISTS points (
    user_id INTEGER PRIMARY KEY,
    points INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
)`);

module.exports = db;

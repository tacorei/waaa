const express = require('express');
const db = require('../db/database');
const router = express.Router();

// **ログインチェックのミドルウェア**
function isAuthenticated(req, res, next) {
    if (typeof req.isAuthenticated === "function" && req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ error: 'ログインが必要です' });
}

// **タスク一覧の取得（ログインユーザーのタスクのみ）**
router.get('/', isAuthenticated, (req, res) => {
    const userId = req.user.id;
    db.all('SELECT * FROM tasks WHERE user_id = ? ORDER BY status', [userId], (err, tasks) => {
        if (err) {
            return res.status(500).json({ error: 'タスクの取得に失敗しました' });
        }
        res.json(tasks);
    });
});

// **タスクの追加**
router.post('/add', isAuthenticated, (req, res) => {
    const { title, due_date } = req.body;
    const userId = req.user.id;

    db.run(
        'INSERT INTO tasks (title, due_date, status, user_id) VALUES (?, ?, ?, ?)',
        [title, due_date, '未完了', userId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'タスクの追加に失敗しました' });
            }
            res.json({ message: 'タスクが追加されました', taskId: this.lastID });
        }
    );
});

// **タスクの編集**
router.put('/edit/:id', isAuthenticated, (req, res) => {
    const { title, due_date } = req.body;
    const userId = req.user.id;
    const taskId = req.params.id;

    db.run(
        'UPDATE tasks SET title = ?, due_date = ? WHERE id = ? AND user_id = ?',
        [title, due_date, taskId, userId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'タスクの編集に失敗しました' });
            }
            res.json({ message: 'タスクが更新されました' });
        }
    );
});

// **タスクの削除**
router.delete('/delete/:id', isAuthenticated, (req, res) => {
    const userId = req.user.id;
    const taskId = req.params.id;

    db.run(
        'DELETE FROM tasks WHERE id = ? AND user_id = ?',
        [taskId, userId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'タスクの削除に失敗しました' });
            }
            res.json({ message: 'タスクが削除されました' });
        }
    );
});

// **タスクのステータスを更新**
router.put('/:id', isAuthenticated, (req, res) => {
    const { status } = req.body;
    const userId = req.user.id;
    const taskId = req.params.id;

    db.run(
        'UPDATE tasks SET status = ? WHERE id = ? AND user_id = ?',
        [status, taskId, userId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'タスクの更新に失敗しました' });
            }
            res.json({ message: 'タスクの状態を更新しました' });
        }
    );
});

module.exports = router;

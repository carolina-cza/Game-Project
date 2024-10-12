const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'game_db'
});

db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('MySQL connected...');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.send({ success: true, user: results });
        } else {
            res.send({ success: false, message: 'Invalid credentials' });
        }
    });
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, password], (err, results) => {
        if (err) throw err;
        res.send({ success: true, userId: results.insertId });
    });
});

app.post('/save-game', (req, res) => {
    const { userId, score } = req.body;
    const query = 'INSERT INTO game_scores (user_id, score) VALUES (?, ?)';
    db.query(query, [userId, score], (err, results) => {
        if (err) throw err;
        res.send({ success: true });
    });
});

app.get('/scores', (req, res) => {
    const query = 'SELECT * FROM game_scores ORDER BY score DESC';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});

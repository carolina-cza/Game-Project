// /backend/index.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database/game.db');

// Spielzug speichern
app.post('/move', (req, res) => {
    const { player, position } = req.body; // player: 'X' oder 'O', position: 0-8 (index im Spielfeld)

    db.get("SELECT * FROM game_state ORDER BY id DESC LIMIT 1", (err, row) => {
        if (!row || row.winner) {
            // Neues Spiel starten, wenn es kein aktives gibt
            const newBoard = Array(9).fill(null);
            newBoard[position] = player;

            db.run("INSERT INTO game_state (board, current_player) VALUES (?, ?)", [JSON.stringify(newBoard), player === 'X' ? 'O' : 'X'], function (err) {
                if (err) return res.status(500).send(err.message);
                res.json({ id: this.lastID });
            });
        } else {
            const board = JSON.parse(row.board);
            if (board[position] || row.winner) return res.status(400).send("Invalid move");

            board[position] = player;
            const winner = checkWinner(board);

            db.run("UPDATE game_state SET board = ?, current_player = ?, winner = ? WHERE id = ?", 
                [JSON.stringify(board), player === 'X' ? 'O' : 'X', winner, row.id], (err) => {
                    if (err) return res.status(500).send(err.message);
                    res.json({ board, winner });
                });
        }
    });
});

// Spielstatus abrufen
app.get('/state', (req, res) => {
    db.all("SELECT * FROM game_state ORDER BY id DESC", (err, rows) => {
        if (err) res.status(500).send(err.message);
        else res.json(rows);
    });
});

function checkWinner(board) {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Reihen
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Spalten
        [0, 4, 8], [2, 4, 6]             // Diagonalen
    ];
    
    for (let [a, b, c] of winningCombinations) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a]; // Gewinner: 'X' oder 'O'
        }
    }
    
    if (board.every(cell => cell)) return 'draw'; // Unentschieden
    return null; // Spiel läuft weiter
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

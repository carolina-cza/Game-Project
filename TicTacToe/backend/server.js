const { Server } = require('socket.io');
const http = require('http');
const { Sequelize, DataTypes } = require('sequelize');
const express = require('express');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        methods: ["GET", "POST"]
    }
});

app.use(express.json());
app.use(cors());

// Im Server-Code (server.js) diese neue Route hinzufügen:

app.get('/api/game-moves/:gameId', async (req, res) => {
    try {
        const moves = await db.Move.findAll({
            where: { gameId: req.params.gameId },
            order: [['createdAt', 'ASC']],  // Sortiert nach Zeitpunkt
            attributes: ['player', 'positionX', 'positionY', 'createdAt']
        });
        res.json(moves);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get moves' });
    }
});

// Zusätzlich einen Endpoint für alle aktiven Spiele:
app.get('/api/games', async (req, res) => {
    try {
        const games = await db.Game.findAll({
            attributes: ['gameId', 'status', 'currentTurn', 'winner', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });
        res.json(games);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get games' });
    }
});

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});
var db = {};

// Überprüfe auf Gewinner
function checkWinner(board) {
    const lines = [
        // Horizontal
        [[0,0], [0,1], [0,2]],
        [[1,0], [1,1], [1,2]],
        [[2,0], [2,1], [2,2]],
        // Vertikal
        [[0,0], [1,0], [2,0]],
        [[0,1], [1,1], [2,1]],
        [[0,2], [1,2], [2,2]],
        // Diagonal
        [[0,0], [1,1], [2,2]],
        [[0,2], [1,1], [2,0]]
    ];

    for (let line of lines) {
        const [[a1,a2], [b1,b2], [c1,c2]] = line;
        if (board[a1][a2] && 
            board[a1][a2] === board[b1][b2] && 
            board[a1][a2] === board[c1][c2]) {
            return board[a1][a2];
        }
    }
    return null;
}

// Überprüfe auf Unentschieden
function checkDraw(board) {
    return board.every(row => row.every(cell => cell !== ''));
}

async function setupDB() {
    try {
        // Game Model
        db.Game = sequelize.define('Game', {
            gameId: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false
            },
            currentTurn: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'X'
            },
            status: {
                type: DataTypes.STRING,
                defaultValue: 'active'
            },
            winner: {
                type: DataTypes.STRING,
                allowNull: true
            }
        });

        // Move Model für Spielzüge
        db.Move = sequelize.define('Move', {
            gameId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            player: {
                type: DataTypes.STRING,
                allowNull: false
            },
            positionX: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            positionY: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        });

        await sequelize.sync({ force: true });
    } catch (error) {
        console.error('Database setup error:', error);
    }
}

// Rekonstruiere Spielbrett aus Moves
async function getBoardState(gameId) {
    try {
        const moves = await db.Move.findAll({
            where: { gameId },
            order: [['createdAt', 'ASC']]
        });

        let board = [['', '', ''], ['', '', ''], ['', '', '']];
        moves.forEach(move => {
            board[move.positionX][move.positionY] = move.player;
        });

        return board;
    } catch (error) {
        console.error('Error getting board state:', error);
        return [['', '', ''], ['', '', ''], ['', '', '']];
    }
}

async function startServer() {
    try {
        await setupDB();

        io.on('connection', (socket) => {
            console.log('User connected:', socket.id);

            // Spiel erstellen
            socket.on('createGame', async () => {
                try {
                    const gameId = Math.random().toString(36).substring(7);
                    await db.Game.create({ gameId });
                    socket.emit('gameCreated', gameId);
                } catch (error) {
                    socket.emit('error', 'Failed to create game');
                }
            });

            // Spiel beitreten
            socket.on('joinGame', async (gameId) => {
                try {
                    const game = await db.Game.findOne({ where: { gameId } });
                    if (!game) {
                        socket.emit('error', 'Game not found');
                        return;
                    }

                    socket.join(gameId);
                    socket.emit('gameJoined', gameId);

                    const board = await getBoardState(gameId);
                    io.to(gameId).emit('gameState', {
                        board,
                        currentTurn: game.currentTurn,
                        winner: game.winner
                    });
                } catch (error) {
                    socket.emit('error', 'Failed to join game');
                }
            });

            socket.on('playerJoined', async ({ gameId, player }) => {
                try {
                    console.log(`Player ${player} joined game ${gameId}`);
                    const game = await db.Game.findOne({ where: { gameId } });
                    if (game) {
                        socket.join(gameId); // Spieler dem Raum hinzufügen
                        
                        // Aktuellen Spielstand holen
                        const board = await getBoardState(gameId);
                        
                        // Allen Spielern im Raum den aktuellen Stand schicken
                        io.to(gameId).emit('gameState', {
                            board: board,
                            currentTurn: game.currentTurn,
                            winner: game.winner
                        });
                    }
                } catch (error) {
                    console.error('Player joined error:', error);
                }
            });
            
            socket.on('makeMove', async ({ x, y, player, gameId }) => {
                try {
                    const game = await db.Game.findOne({ where: { gameId } });
                    if (!game || game.status !== 'active' || game.currentTurn !== player) {
                        return;
                    }
            
                    const board = await getBoardState(gameId);
                    if (board[x][y] !== '') return;
            
                    // Spielzug speichern
                    await db.Move.create({
                        gameId,
                        player,
                        positionX: x,
                        positionY: y
                    });
            
                    // Board aktualisieren
                    board[x][y] = player;
            
                    // Gewinner- und Unentschieden-Prüfung
                    const winnerPlayer = checkWinner(board);
                    const isDraw = !winnerPlayer && checkDraw(board);
            
                    // Spielstatus aktualisieren
                    await game.update({
                        currentTurn: player === 'X' ? 'O' : 'X',
                        status: winnerPlayer || isDraw ? 'ended' : 'active',
                        winner: winnerPlayer || (isDraw ? 'Draw' : null)
                    });
            
                    // Broadcast an alle Spieler im Raum
                    io.to(gameId).emit('gameState', {
                        board,
                        currentTurn: game.currentTurn,
                        winner: game.winner,
                        isDraw  // Unentschieden-Status mitgeben
                    });
                } catch (error) {
                    console.error('Error making move:', error);
                }
            });
            
              
            
            // Hilfsfunktion für Gewinner-Prüfung
            function checkWinner(board) {
                const lines = [
                    // Horizontale
                    [[0,0], [0,1], [0,2]],
                    [[1,0], [1,1], [1,2]],
                    [[2,0], [2,1], [2,2]],
                    // Vertikale
                    [[0,0], [1,0], [2,0]],
                    [[0,1], [1,1], [2,1]],
                    [[0,2], [1,2], [2,2]],
                    // Diagonale
                    [[0,0], [1,1], [2,2]],
                    [[0,2], [1,1], [2,0]]
                ];
            
                for (let line of lines) {
                    const [[a1,a2], [b1,b2], [c1,c2]] = line;
                    if (board[a1][a2] && 
                        board[a1][a2] === board[b1][b2] && 
                        board[a1][a2] === board[c1][c2]) {
                        return board[a1][a2];
                    }
                }
                return null;
            }
            
            function checkDraw(board) {
                return board.every(row => row.every(cell => cell !== ''));
            }

            // Spiel zurücksetzen
            socket.on('resetGame', async (gameId) => {
                try {
                    // Alle Züge löschen
                    await db.Move.destroy({ where: { gameId } });
                    
                    // Spiel zurücksetzen
                    await db.Game.update({
                        currentTurn: 'X',
                        status: 'active',
                        winner: null
                    }, { 
                        where: { gameId } 
                    });

                    // Alle Spieler informieren
                    io.to(gameId).emit('gameState', {
                        board: [['', '', ''], ['', '', ''], ['', '', '']],
                        currentTurn: 'X',
                        winner: null
                    });
                } catch (error) {
                    console.error('Error resetting game:', error);
                }
            });

            // Spieler verlässt Spiel
            socket.on('playerLeft', async ({ gameId, player }) => {
                try {
                    const game = await db.Game.findOne({ where: { gameId } });
                    if (game) {
                        await game.update({ 
                            status: 'ended',
                            winner: player === 'X' ? 'O' : 'X'
                        });
                        io.to(gameId).emit('playerLeft');
                    }
                } catch (error) {
                    console.error('Error player leaving:', error);
                }
            });
        });

        const port = 3001;
        server.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });

    } catch (error) {
        console.error(error);
    }
}

startServer();
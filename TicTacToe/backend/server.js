const { Server } = require('socket.io');
const http = require('http');
const { Sequelize, DataTypes } = require('sequelize');
const express = require('express');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Aktive Spiele speichern
const activeGames = new Map();

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});
var db = {};

async function setupDB() {
    try {
        db.Game = sequelize.define('Game', {
            player: {
                type: DataTypes.STRING,
                allowNull: false
            },
            score: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            date: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            }
        });
        await sequelize.sync({ force: true });
        await db.Game.create({ player: "Player1", score: 10 });
        await db.Game.create({ player: "Player2", score: 20 });
        await db.Game.create({ player: "Player3", score: 15 });
    } catch (error) {
        console.error(error);
    }
}

async function startServer() {
    try {
        await setupDB();
        
        app.use(express.json());

        app.get('/', (req, res) => {
            res.send('hello world');
        });

        app.get('/api/games', (req, res) => {
            db.Game.findAll().then(games => {
                res.json(games);
            });
        });

        app.post('/api/games', (req, res) => {
            db.Game.create(req.body).then(game => {
                res.json(game);
            });
        });

        app.delete('/api/games/:id', (req, res) => {
            db.Game.destroy({
                where: { id: req.params.id }
            }).then(() => {
                res.sendStatus(204);
            }).catch((error) => {
                console.error(error);
                res.sendStatus(500);
            });
        });

        // Socket.io Event Handler
        io.on('connection', (socket) => {
            console.log('User connected:', socket.id);

            socket.on('createGame', () => {
                const gameId = Math.random().toString(36).substring(7);
                console.log('Creating new game with ID:', gameId);
                
                activeGames.set(gameId, {
                    board: [['', '', ''], ['', '', ''], ['', '', '']],
                    currentTurn: 'X',
                    players: { X: null, O: null }
                });
                
                socket.emit('gameCreated', gameId);
                console.log('Game created and ID sent to client');
            });

            socket.on('joinGame', (gameId) => {
                const game = activeGames.get(gameId);
                if (!game) {
                    socket.emit('error', 'Game not found');
                    return;
                }

                if (game.players.X && game.players.O) {
                    socket.emit('error', 'Game is full');
                    return;
                }

                socket.join(gameId);
                socket.emit('gameJoined', gameId);

                io.to(gameId).emit('gameState', {
                    board: game.board,
                    currentTurn: game.currentTurn
                });
            });

            socket.on('makeMove', ({ x, y, player, gameId }) => {
                const game = activeGames.get(gameId);
                if (!game) return;

                if (game.currentTurn !== player || game.board[x][y] !== '') return;

                game.board[x][y] = player;
                game.currentTurn = player === 'X' ? 'O' : 'X';

                io.to(gameId).emit('gameState', {
                    board: game.board,
                    currentTurn: game.currentTurn
                });
            });

            socket.on('playerJoined', ({ gameId, player }) => {
                console.log(`Player ${player} joined game ${gameId}`);
                const game = activeGames.get(gameId);
                if (game) {
                    game.players[player] = socket.id;
                    socket.join(gameId);
                    
                    io.to(gameId).emit('gameState', {
                        board: game.board,
                        currentTurn: game.currentTurn
                    });
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
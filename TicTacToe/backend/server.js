const { Server } = require("socket.io");
const http = require("http");
const { Sequelize, DataTypes } = require("sequelize");
const express = require("express");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cors());

// Add a new route to get game moves by gameId
app.get("/api/game-moves/:gameId", async (req, res) => {
  try {
    const moves = await db.Move.findAll({
      where: { gameId: req.params.gameId },
      order: [["createdAt", "ASC"]], // Sort by creation time
      attributes: ["player", "positionX", "positionY", "createdAt"],
    });
    res.json(moves);
  } catch (error) {
    res.status(500).json({ error: "Failed to get moves" });
  }
});

// Add an endpoint to get all active games
app.get("/api/games", async (req, res) => {
  try {
    const games = await db.Game.findAll({
      attributes: ["gameId", "status", "currentTurn", "winner", "createdAt"],
      order: [["createdAt", "DESC"]],
    });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: "Failed to get games" });
  }
});

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
});
var db = {};

// Check for a winner
function checkWinner(board) {
  const lines = [
    // Horizontal
    [
      [0, 0],
      [0, 1],
      [0, 2],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [2, 0],
      [2, 1],
      [2, 2],
    ],
    // Vertical
    [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    [
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [0, 2],
      [1, 2],
      [2, 2],
    ],
    // Diagonal
    [
      [0, 0],
      [1, 1],
      [2, 2],
    ],
    [
      [0, 2],
      [1, 1],
      [2, 0],
    ],
  ];

  for (let line of lines) {
    const [[a1, a2], [b1, b2], [c1, c2]] = line;
    if (
      board[a1][a2] &&
      board[a1][a2] === board[b1][b2] &&
      board[a1][a2] === board[c1][c2]
    ) {
      return board[a1][a2];
    }
  }
  return null;
}

// Check for a draw
function checkDraw(board) {
  return board.every((row) => row.every((cell) => cell !== ""));
}

// Setup the database models
async function setupDB() {
  try {
    // Game Model
    db.Game = sequelize.define("Game", {
      gameId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      currentTurn: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "X",
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "active",
      },
      winner: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    });

    // Move Model for game moves
    db.Move = sequelize.define("Move", {
      gameId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      player: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      positionX: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      positionY: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    });

    await sequelize.sync({ force: true });
  } catch (error) {
    console.error("Database setup error:", error);
  }
}

// Reconstruct the game board from moves
async function getBoardState(gameId) {
  try {
    const moves = await db.Move.findAll({
      where: { gameId },
      order: [["createdAt", "ASC"]],
    });

    let board = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
    moves.forEach((move) => {
      board[move.positionX][move.positionY] = move.player;
    });

    return board;
  } catch (error) {
    console.error("Error getting board state:", error);
    return [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
  }
}

// Start the server and setup socket.io events
async function startServer() {
  try {
    await setupDB();

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      // Create a new game
      socket.on("createGame", async () => {
        try {
          const gameId = Math.random().toString(36).substring(7);
          await db.Game.create({ gameId });
          socket.emit("gameCreated", gameId);
        } catch (error) {
          socket.emit("error", "Failed to create game");
        }
      });

      // Join an existing game
      socket.on("joinGame", async (gameId) => {
        try {
          const game = await db.Game.findOne({ where: { gameId } });
          if (!game) {
            socket.emit("error", "Game not found");
            return;
          }

          socket.join(gameId);
          socket.emit("gameJoined", gameId);

          const board = await getBoardState(gameId);
          io.to(gameId).emit("gameState", {
            board,
            currentTurn: game.currentTurn,
            winner: game.winner,
          });
        } catch (error) {
          socket.emit("error", "Failed to join game");
        }
      });

      // Handle player joining a game
      socket.on("playerJoined", async ({ gameId, player }) => {
        try {
          console.log(`Player ${player} joined game ${gameId}`);
          const game = await db.Game.findOne({ where: { gameId } });
          if (game) {
            socket.join(gameId); // Add player to the room

            // Get the current game state
            const board = await getBoardState(gameId);

            // Send the current state to all players in the room
            io.to(gameId).emit("gameState", {
              board: board,
              currentTurn: game.currentTurn,
              winner: game.winner,
            });
          }
        } catch (error) {
          console.error("Player joined error:", error);
        }
      });

      // Handle making a move
      socket.on("makeMove", async ({ x, y, player, gameId }) => {
        try {
          const game = await db.Game.findOne({ where: { gameId } });
          if (
            !game ||
            game.status !== "active" ||
            game.currentTurn !== player
          ) {
            return;
          }

          const board = await getBoardState(gameId);
          if (board[x][y] !== "") return;

          // Save the move
          await db.Move.create({
            gameId,
            player,
            positionX: x,
            positionY: y,
          });

          // Update the board
          board[x][y] = player;

          // Check for winner or draw
          const winnerPlayer = checkWinner(board);
          const isDraw = !winnerPlayer && checkDraw(board);

          // Update game status
          await game.update({
            currentTurn: player === "X" ? "O" : "X",
            status: winnerPlayer || isDraw ? "ended" : "active",
            winner: winnerPlayer || (isDraw ? "Draw" : null),
          });

          // Broadcast the game state to all players in the room
          io.to(gameId).emit("gameState", {
            board,
            currentTurn: game.currentTurn,
            winner: game.winner,
            isDraw, // Include draw status
          });
        } catch (error) {
          console.error("Error making move:", error);
        }
      })
      // Helper function to check for a winner
      function checkWinner(board) {
        const lines = [
          // Horizontale
          [
            [0, 0],
            [0, 1],
            [0, 2],
          ],
          [
            [1, 0],
            [1, 1],
            [1, 2],
          ],
          [
            [2, 0],
            [2, 1],
            [2, 2],
          ],
          // Verticale
          [
            [0, 0],
            [1, 0],
            [2, 0],
          ],
          [
            [0, 1],
            [1, 1],
            [2, 1],
          ],
          [
            [0, 2],
            [1, 2],
            [2, 2],
          ],
          // Diagonale
          [
            [0, 0],
            [1, 1],
            [2, 2],
          ],
          [
            [0, 2],
            [1, 1],
            [2, 0],
          ],
        ];

        for (let line of lines) {
          const [[a1, a2], [b1, b2], [c1, c2]] = line;
          if (
            board[a1][a2] &&
            board[a1][a2] === board[b1][b2] &&
            board[a1][a2] === board[c1][c2]
          ) {
            return board[a1][a2];
          }
        }
        return null;
      }

      function checkDraw(board) {
        return board.every((row) => row.every((cell) => cell !== ""));
      }

      // reset game
      socket.on("resetGame", async (gameId) => {
        try {
          // delete all moves
          await db.Move.destroy({ where: { gameId } });

          // reset game state
          await db.Game.update(
            {
              currentTurn: "X",
              status: "active",
              winner: null,
            },
            {
              where: { gameId },
            }
          );

          // inform all players
          io.to(gameId).emit("gameState", {
            board: [
              ["", "", ""],
              ["", "", ""],
              ["", "", ""],
            ],
            currentTurn: "X",
            winner: null,
          });
        } catch (error) {
          console.error("Error resetting game:", error);
        }
      });

      // Player left
      socket.on("playerLeft", async ({ gameId, player }) => {
        try {
          const game = await db.Game.findOne({ where: { gameId } });
          if (game) {
            await game.update({
              status: "ended",
              winner: player === "X" ? "O" : "X",
            });
            io.to(gameId).emit("playerLeft");
          }
        } catch (error) {
          console.error("Error player leaving:", error);
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

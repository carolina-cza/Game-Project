const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});
var db = {};

// Diese Funktion erstellt Dummy-Daten in der Datenbanktabelle
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

// APIs erstellen, um Daten zu erstellen und zu löschen
async function startServer() {
    try {
        await setupDB();
        const port = 3001;
        const express = require('express');
        const app = express();
        app.use(express.json());
        app.get('/', (req, res) => {
            res.send('hello world');
        });

        // GET-Methode API-URL | Daten abrufen
        app.get('/api/games', (req, res) => {
            db.Game.findAll().then(games => {
                res.json(games);
            });
        });

        // POST-Methode API-URL | Daten erstellen
        app.post('/api/games', (req, res) => {
            db.Game.create(req.body).then(game => {
                res.json(game);
            });
        });

        // DELETE-Methode API-URL | Daten löschen
        app.delete('/api/games/:id', (req, res) => {
            db.Game.destroy({
                where: {
                    id: req.params.id
                }
            }).then(() => {
                res.sendStatus(204);
            }).catch((error) => {
                console.error(error);
                res.sendStatus(500); // Interner Serverfehler
            });
        });

        app.listen(port, () => {
            console.log(`App listening on port ${port}`);
        });
    } catch (error) {
        console.error(error);
    }
}
startServer();

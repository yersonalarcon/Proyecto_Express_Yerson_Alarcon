import express from 'express';
import usersRouter from './routes/user.Route.js';
import verifyToken from './controllers/middleware/auth.middleware.js';
import "dotenv/config";
import { MongoClient } from "mongodb";

const server = express();
server.use(express.json());

const client = new MongoClient('mongodb://localhost:27017');

await client.connect()

export const db = client.db('CineAcmeDb');

server.use('/users', usersRouter());
server.use('/movie', verifyToken, (req, res) => {
    res.send('Rutas de películas - en construcción');
});

server.listen(
    {
        port: process.env.APP_PORT,
        hostname: process.env.APP_HOSTNAME
    },
    () => {
        console.log(`Server running on ${process.env.APP_HOSTNAME}:${process.env.APP_PORT}`);
    }
);
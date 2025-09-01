import express from 'express';
import cinemaRouter from './routes/cinema.route.js';
import usersRouter from './routes/user.Route.js';
import verifyToken from './controllers/middleware/auth.middleware.js';
import "dotenv/config";
import { MongoClient } from "mongodb";
import cors from 'cors'
import roomRouter from './routes/room.route.js';
import movieRouter from './routes/movie.route.js';
import functionRouter from './routes/function.route.js';


const server = express();
server.use(express.json());

server.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'], // Permite Live Server de VSCode
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const client = new MongoClient('mongodb://localhost:27017');
await client.connect();
export const db = client.db('CineAcmeDb');

// ✅ Pasa solo la db al router
server.use('/users', usersRouter(db));

server.use('/cinemas', verifyToken, cinemaRouter(db));

server.use('/rooms', verifyToken, roomRouter(db));

server.use('/movies', verifyToken, movieRouter(db));

server.use('/functions', verifyToken, functionRouter(db));

server.listen(
    {
        port: process.env.APP_PORT,
        hostname: process.env.APP_HOSTNAME
    },
    () => {
        console.log(`Server running on ${process.env.APP_HOSTNAME}:${process.env.APP_PORT}`);
    }
);

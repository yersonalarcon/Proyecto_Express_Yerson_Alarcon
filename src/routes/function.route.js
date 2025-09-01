import express from 'express';
import { body, validationResult } from 'express-validator';
import Function from '../models/function.model.js';
import Cinema from '../models/cinema.model.js';
import Room from '../models/room.model.js';
import Movie from '../models/movie.model.js';
import FunctionController from '../controllers/function.controller.js';
import verifyToken from '../controllers/middleware/auth.middleware.js';

export default function functionRouter(db) {
    const route = express.Router();
    
    const functionModel = new Function(db);
    const cinemaModel = new Cinema(db);
    const roomModel = new Room(db);
    const movieModel = new Movie(db);
    const functionController = new FunctionController(functionModel, cinemaModel, roomModel, movieModel);

    // Validaciones
    const functionValidator = [
        body('cinemaId').notEmpty().withMessage('El cine es requerido'),
        body('roomId').notEmpty().withMessage('La sala es requerida'),
        body('movieId').notEmpty().withMessage('La película es requerida'),
        body('date').isISO8601().withMessage('La fecha es inválida'),
        body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('La hora debe tener formato HH:MM')
    ];

    // Rutas principales
    route.get('/', verifyToken, async (req, res) => {
        try {
            const result = await functionController.getAll();
            if (result.error) {
                return res.status(400).json(result);
            }
            res.status(200).json(result.functions);
        } catch (error) {
            res.status(500).json({ 
                error: true, 
                message: 'Error interno del servidor' 
            });
        }
    });

    // Endpoint para reporte: Funciones por cine y película
    route.get('/report/movie-cinema', verifyToken, async (req, res) => {
        try {
            const { cinemaId, movieId } = req.query;
            
            if (!cinemaId || !movieId) {
                return res.status(400).json({ 
                    error: true, 
                    message: 'Se requieren cinemaId y movieId' 
                });
            }

            const result = await functionController.getByMovieAndCinema(movieId, cinemaId);
            if (result.error) {
                return res.status(400).json(result);
            }
            res.status(200).json(result.functions);
        } catch (error) {
            res.status(500).json({ 
                error: true, 
                message: 'Error interno del servidor' 
            });
        }
    });

    // Endpoint para reporte: Funciones por cine y fecha
    route.get('/report/date-cinema', verifyToken, async (req, res) => {
        try {
            const { cinemaId, date } = req.query;
            
            if (!cinemaId || !date) {
                return res.status(400).json({ 
                    error: true, 
                    message: 'Se requieren cinemaId y date' 
                });
            }

            const result = await functionController.getByCinemaAndDate(cinemaId, date);
            if (result.error) {
                return res.status(400).json(result);
            }
            res.status(200).json(result.functions);
        } catch (error) {
            res.status(500).json({ 
                error: true, 
                message: 'Error interno del servidor' 
            });
        }
    });

    // Endpoint para reporte: Funciones por rango de fechas
    route.get('/report/date-range', verifyToken, async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            
            if (!startDate || !endDate) {
                return res.status(400).json({ 
                    error: true, 
                    message: 'Se requieren startDate y endDate' 
                });
            }

            const result = await functionController.getByDateRange(startDate, endDate);
            if (result.error) {
                return res.status(400).json(result);
            }
            res.status(200).json(result.functions);
        } catch (error) {
            res.status(500).json({ 
                error: true, 
                message: 'Error interno del servidor' 
            });
        }
    });

    route.get('/:id', verifyToken, async (req, res) => {
        try {
            const { id } = req.params;
            const result = await functionController.getById(id);
            
            if (result.error) {
                return res.status(404).json(result);
            }
            res.status(200).json(result.function);
        } catch (error) {
            res.status(500).json({ 
                error: true, 
                message: 'Error interno del servidor' 
            });
        }
    });

    route.post('/', verifyToken, functionValidator, async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const result = await functionController.create(req.body);
            
            if (result.error) {
                return res.status(400).json(result);
            }
            
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ 
                error: true, 
                message: 'Error interno del servidor' 
            });
        }
    });

    route.put('/:id', verifyToken, functionValidator, async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { id } = req.params;
            const result = await functionController.update(id, req.body);
            
            if (result.error) {
                return res.status(400).json(result);
            }
            
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ 
                error: true, 
                message: 'Error interno del servidor' 
            });
        }
    });

    route.delete('/:id', verifyToken, async (req, res) => {
        try {
            const { id } = req.params;
            const result = await functionController.delete(id);
            
            if (result.error) {
                return res.status(400).json(result);
            }
            
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ 
                error: true, 
                message: 'Error interno del servidor' 
            });
        }
    });

    return route;
}
import express from 'express';
import { body, validationResult } from 'express-validator';
import Room from '../models/room.model.js';
import Cinema from '../models/cinema.model.js';
import RoomController from '../controllers/room.controller.js';
import verifyToken from '../controllers/middleware/auth.middleware.js';

export default function roomRouter(db) {
    const route = express.Router();
    
    const roomModel = new Room(db);
    const cinemaModel = new Cinema(db);
    const roomController = new RoomController(roomModel, cinemaModel);

    // Validaciones
    const roomValidator = [
        body('code')
            .notEmpty().withMessage('El código es requerido'),
        body('numSeats')
            .isInt({ min: 1 }).withMessage('El número de sillas debe ser mayor a 0'),
        body('cinemaId')
            .notEmpty().withMessage('El cine es requerido')
    ];

    // Middleware de validación
    const validateRequest = (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: true,
                message: 'Error de validación',
                details: errors.array()
            });
        }
        next();
    };

    // Rutas
    route.get('/', verifyToken, async (req, res) => {
        try {
            const result = await roomController.getAll();
            if (result.error) {
                return res.status(400).json(result);
            }
            return res.status(200).json(result.rooms);
        } catch (error) {
            return res.status(500).json({ 
                error: true, 
                message: 'Error interno del servidor' 
            });
        }
    });

    route.get('/cinema/:cinemaId', verifyToken, async (req, res) => {
        try {
            const { cinemaId } = req.params;
            const result = await roomController.getByCinema(cinemaId);
            
            if (result.error) {
                return res.status(400).json(result);
            }
            return res.status(200).json(result.rooms);
        } catch (error) {
            return res.status(500).json({ 
                error: true, 
                message: 'Error interno del servidor' 
            });
        }
    });

    route.get('/:id', verifyToken, async (req, res) => {
        try {
            const { id } = req.params;
            const result = await roomController.getById(id);
            
            if (result.error) {
                return res.status(404).json(result);
            }
            return res.status(200).json(result.room);
        } catch (error) {
            return res.status(500).json({ 
                error: true, 
                message: 'Error interno del servidor' 
            });
        }
    });

    route.post('/', verifyToken, roomValidator, validateRequest, async (req, res) => {
        try {
            const result = await roomController.create(req.body);
            
            if (result.error) {
                return res.status(400).json(result);
            }
            
            return res.status(201).json(result);
        } catch (error) {
            return res.status(500).json({ 
                error: true, 
                message: 'Error interno del servidor' 
            });
        }
    });

    route.put('/:id', verifyToken, roomValidator, validateRequest, async (req, res) => {
        try {
            const { id } = req.params;
            const result = await roomController.update(id, req.body);
            
            if (result.error) {
                return res.status(400).json(result);
            }
            
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ 
                error: true, 
                message: 'Error interno del servidor' 
            });
        }
    });

    route.delete('/:id', verifyToken, async (req, res) => {
        try {
            const { id } = req.params;
            const result = await roomController.delete(id);
            
            if (result.error) {
                return res.status(400).json(result);
            }
            
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ 
                error: true, 
                message: 'Error interno del servidor' 
            });
        }
    });

    return route;
}

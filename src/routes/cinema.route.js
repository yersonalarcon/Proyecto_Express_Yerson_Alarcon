import express from 'express';
import { body, validationResult } from 'express-validator';
import Cinema from '../models/cinema.model.js';
import CinemaController from '../controllers/cinema.controller.js';
import verifyToken from '../controllers/middleware/auth.middleware.js';

export default function cinemaRouter(db) {
    const route = express.Router();
    
    const cinemaModel = new Cinema(db);
    const cinemaController = new CinemaController(cinemaModel);

    // Validaciones
    const cinemaValidator = [
        body('code').notEmpty().withMessage('El código es requerido'),
        body('name').notEmpty().withMessage('El nombre es requerido'),
        body('address').notEmpty().withMessage('La dirección es requerida'),
        body('city').notEmpty().withMessage('La ciudad es requerida')
    ];

    // Rutas
    route.get('/', verifyToken, async (req, res) => {
        try {
            const result = await cinemaController.getAll();
            if (result.error) {
                return res.status(400).json(result);
            }
            res.status(200).json(result.cinemas);
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
            const result = await cinemaController.getById(id);
            
            if (result.error) {
                return res.status(404).json(result);
            }
            res.status(200).json(result.cinema);
        } catch (error) {
            res.status(500).json({ 
                error: true, 
                message: 'Error interno del servidor' 
            });
        }
    });

    route.post('/', verifyToken, cinemaValidator, async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const result = await cinemaController.create(req.body);
            
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

    route.put('/:id', verifyToken, cinemaValidator, async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { id } = req.params;
            const result = await cinemaController.update(id, req.body);
            
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
            const result = await cinemaController.delete(id);
            
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
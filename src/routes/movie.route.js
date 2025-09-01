import express from 'express';
import { body, validationResult } from 'express-validator';
import Movie from '../models/movie.model.js';
import MovieController from '../controllers/movie.controller.js';
import verifyToken from '../controllers/middleware/auth.middleware.js';

export default function movieRouter(db) {
    const route = express.Router();
    
    const movieModel = new Movie(db);
    const movieController = new MovieController(movieModel);

    // Validaciones
    const movieValidator = [
        body('code').notEmpty().withMessage('El código es requerido'),
        body('title').notEmpty().withMessage('El título es requerido'),
        body('synopsis').isLength({ min: 10 }).withMessage('La sinopsis debe tener al menos 10 caracteres'),
        body('duration').isInt({ min: 1 }).withMessage('La duración debe ser mayor a 0'),
        body('releaseDate').isISO8601().withMessage('La fecha de estreno es inválida')
    ];

    // Rutas
    route.get('/', verifyToken, async (req, res) => {
        try {
            const result = await movieController.getAll();
            if (result.error) {
                return res.status(400).json(result);
            }
            res.status(200).json(result.movies);
        } catch (error) {
            res.status(500).json({ 
                error: true, 
                message: 'Error interno del servidor' 
            });
        }
    });

    route.get('/search', verifyToken, async (req, res) => {
        try {
            const { q } = req.query;
            if (!q) {
                return res.status(400).json({ error: true, message: 'Query de búsqueda requerido' });
            }
            
            const result = await movieController.search(q);
            if (result.error) {
                return res.status(400).json(result);
            }
            res.status(200).json(result.movies);
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
            const result = await movieController.getById(id);
            
            if (result.error) {
                return res.status(404).json(result);
            }
            res.status(200).json(result.movie);
        } catch (error) {
            res.status(500).json({ 
                error: true, 
                message: 'Error interno del servidor' 
            });
        }
    });

    route.post('/', verifyToken, movieValidator, async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const result = await movieController.create(req.body);
            
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

    route.put('/:id', verifyToken, movieValidator, async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { id } = req.params;
            const result = await movieController.update(id, req.body);
            
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
            const result = await movieController.delete(id);
            
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
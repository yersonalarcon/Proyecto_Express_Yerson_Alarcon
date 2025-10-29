import express from "express";
import { body, validationResult } from 'express-validator';
import Confiteria from "../models/confiteria.model.js";
import ConfiteriaController from "../controllers/confiteria.controller.js";
import verifyToken from "../controllers/middleware/auth.middleware.js";

export default function confiteriaRouter(db) {
    const route = express.Router();
    
    const confiteriamodel = new Confiteria(db);
    const confiteriaController = new ConfiteriaController(confiteriamodel);

    // Validaciones
    const confiteriaValidator = [
        body('code').notEmpty().withMessage('El código es requerido'),
        body('nombre').notEmpty().withMessage('El nombre es requerido'),
        body('descripcion').isLength({ min: 5 }).withMessage('La descripcion debe tener al menos 5 caracteres'),
        body('precio').isInt({ min: 1 }).withMessage('El precio  debe ser mayor a 0'),
    ];

    route.get('/', verifyToken, async (req, res) => {
        try {
            const result = await ConfiteriaController.getAll();
            if (result.error) {
                return res.status(400).json(result);
            }
            res.status(200).json(result.confiteria);
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
            
            const result = await confiteriaController.search(q);
            if (result.error) {
                return res.status(400).json(result);
            }
            res.status(200).json(result.confiteria);
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
            const result = await confiteriaController.getById(id);
            
            if (result.error) {
                return res.status(404).json(result);
            }
            res.status(200).json(result.confiteria);
        } catch (error) {
            res.status(500).json({ 
                error: true, 
                message: 'Error interno del servidor' 
            });
        }
    });

    route.post('/', verifyToken, confiteriaValidator, async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const result = await confiteriaController.create(req.body);
            
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

    route.put('/:id', verifyToken, confiteriaValidator, async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { id } = req.params;
            const result = await confiteriaController.update(id, req.body);
            
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
            const result = await confiteriaController.delete(id);
            
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
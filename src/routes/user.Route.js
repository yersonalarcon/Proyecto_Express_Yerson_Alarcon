import express from 'express';
import usersController from '../controllers/user.controller.js';
import verifyToken from '../controllers/middleware/auth.middleware.js';
import { createUserValidator,loginValidator } from '../../helpers/middleware/uservalidator.js';
import UserDto from '../../dtos/user.create.dto.js';
import { validationResult } from 'express-validator';

export default function usersRouter(db) {
    const route = express.Router();

    route.post('/', createUserValidator, async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userDto = new UserDto(req.body);
        const result = await usersController.create(userDto);
        if (result.error) {
            return res.status(400).json({ message: result.message });
        }
        res.status(201).json({ message: 'Usuario creado exitosamente', userId: result.userId });
    }
    );
    route.post('/login', loginValidator, async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        const result = await usersController.login(email, password);
        if (result.error) {
            return res.status(400).json({ message: result.message });
        }
        res.status(200).json({ message: 'Login exitoso', token: result.token });
    });
    route.get('/', verifyToken, async (req, res) => {
        const users = await usersController.getAll();
        res.status(200).json(users);
    });
    route.get('/:id', verifyToken, async (req, res) => {
        const { id } = req.params;
        const result = await usersController.getById(id);
        if (result.error) {
            return res.status(404).json({ message: result.message });
        }
        res.status(200).json(result);
    });
    route.put('/:id', verifyToken, async (req, res) => {
        const { id } = req.params;
        const userDto = new UserDto(req.body);
        const result = await usersController.update(id, userDto);
        if (result.error) {
            return res.status(400).json({ message: result.message });
        }
        res.status(200).json({ message: 'Usuario actualizado exitosamente' });
    });
    route.delete('/:id', verifyToken, async (req, res) => {
        const { id } = req.params;
        const result = await usersController.delete(id);
        if (result.error) {
            return res.status(400).json({ message: result.message });
        }
        res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    }
    );
    return route;
}

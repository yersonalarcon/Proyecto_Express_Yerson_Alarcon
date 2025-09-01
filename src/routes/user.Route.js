import express from "express";
import UsersController from "../controllers/user.controller.js";
import User from "../models/user.model.js"; // ✅ Importar el modelo
import verifyToken from "../controllers/middleware/auth.middleware.js";
import {
  createUserValidator,
  loginValidator,
} from "../../helpers/middleware/uservalidator.js";
import UserDto from "../dtos/user.create.dto.js";
import { validationResult } from "express-validator";

export default function usersRouter(db) {
  const route = express.Router();

  // ✅ Crear primero el modelo, luego el controlador con el modelo
  const userModel = new User(db);
  const usersController = new UsersController(userModel);

  route.post("/register", createUserValidator, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userDto = new UserDto(req.body);
      const result = await usersController.create(userDto);

      if (result.error) {
        return res.status(400).json({ message: result.message });
      }

      res.status(201).json({
        message: "Usuario creado exitosamente",
        userId: result.userId,
      });
    } catch (error) {
      console.error("Error en registro:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  route.post("/login", loginValidator, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const result = await usersController.login(email, password);

      if (result.error) {
        return res.status(400).json({ message: result.message });
      }

      res.status(200).json({
        message: "Login exitoso",
        token: result.token,
      });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  route.get("/", verifyToken, async (req, res) => {
    try {
      const result = await usersController.getAll();

      if (result.error) {
        return res.status(500).json({ message: result.message });
      }

      res.status(200).json(result.users);
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  route.get("/:id", verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await usersController.getById(id);

      if (result.error) {
        return res.status(404).json({ message: result.message });
      }

      res.status(200).json(result.user);
    } catch (error) {
      console.error("Error obteniendo usuario por ID:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  route.put("/:id", verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userDto = new UserDto(req.body);
      const result = await usersController.update(id, userDto);

      if (result.error) {
        return res.status(400).json({ message: result.message });
      }

      res.status(200).json({ message: "Usuario actualizado exitosamente" });
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  route.delete("/:id", verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await usersController.delete(id);

      if (result.error) {
        return res.status(400).json({ message: result.message });
      }

      res.status(200).json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  return route;
}

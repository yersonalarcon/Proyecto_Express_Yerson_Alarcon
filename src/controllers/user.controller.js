import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { db } from "../app.js"; 
import "dotenv/config";

class UsersController {
    #userModel;

    // El constructor recibe la conexión a la base de datos (db) como parámetro.
    constructor(db) {
        // La instancia de User se crea aquí, pasándole la conexión.
        this.#userModel = new User(db);
        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.login = this.login.bind(this);
    }

    async create(req, res) {
        try {
            const { username, email, password, role } = req.body;
            if (!username || !email || !password || !role) {
                return res.status(400).json({ message: "Faltan datos obligatorios" });
            }

            const existingUser = await this.#userModel.getBy({ email });
            if (existingUser) {
                return res.status(409).json({ message: "El usuario ya existe" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = {
                username,
                email,
                password: hashedPassword,
                role
            };

            const insertedId = await this.#userModel.create(newUser);
            if (insertedId) {
                return res.status(201).json({ message: "Usuario creado", userId: insertedId });
            } else {
                return res.status(500).json({ message: "Error al crear el usuario" });
            }
        } catch (err) {
            return res.status(500).json({ message: "Error del servidor", error: err.message });
        }
    }

    async getAll(req, res) {
        try {
            const users = await this.#userModel.getAll();
            return res.status(200).json(users);
        } catch (err) {
            return res.status(500).json({ message: "Error del servidor", error: err.message });
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            // No se puede usar ObjectId aquí, ya que el modelo lo maneja
            const user = await this.#userModel.getBy({ _id: id });
            if (user) {
                delete user.password;
                return res.status(200).json(user);
            } else {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
        } catch (err) {
            return res.status(500).json({ message: "Error del servidor", error: err.message });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { username, email, password, role } = req.body;
            
            const updateData = {};
            if (username) updateData.username = username;
            if (email) updateData.email = email;
            if (role) updateData.role = role;
            if (password) {
                updateData.password = await bcrypt.hash(password, 10);
            }

            const result = await this.#userModel.update(id, updateData);
            if (result.modifiedCount > 0) {
                return res.status(200).json({ message: "Usuario actualizado" });
            } else {
                return res.status(404).json({ message: "Usuario no encontrado o sin cambios" });
            }
        } catch (err) {
            return res.status(500).json({ message: "Error del servidor", error: err.message });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await this.#userModel.delete(id);
            if (result.deletedCount > 0) {
                return res.status(200).json({ message: "Usuario eliminado" });
            } else {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
        } catch (err) {
            return res.status(500).json({ message: "Error del servidor", error: err.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: "Faltan datos obligatorios" });
            }

            const user = await this.#userModel.getBy({ email });
            if (!user) {
                return res.status(401).json({ message: "Credenciales inválidas" });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ message: "Credenciales inválidas" });
            }

            const token = jwt.sign(
                { userId: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            return res.status(200).json({ message: "Login exitoso", token });
        } catch (err) {
            return res.status(500).json({ message: "Error del servidor", error: err.message });
        }
    }
}

// Se exporta la instancia de la clase, y ahora debe recibir la base de datos
const usersController = new UsersController(db);
export default usersController;

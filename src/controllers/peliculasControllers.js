import brcypt from "bcrypt";
import jwt from "jsonwebtoken";
import { MongoClient, ObjectId } from "mongodb";
import User from "./models/userModale.js";
import "dotenv/config";

export default class PeliculasController {
    #userModel = new User();
    constructor() {
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

            const hashedPassword = await brcypt.hash(password, 10);
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
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ message: "ID inválido" });
            }

            const user = await this.#userModel.getBy({ _id: new ObjectId(id) });
            if (user) {
                delete user.password; // Eliminar la contraseña antes de enviar la respuesta
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

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ message: "ID inválido" });
            }

            const user = await this.#userModel.getBy({ _id: new ObjectId(id) });
            if (!user) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }

            const updatedData = {};
            if (username) updatedData.username = username;
            if (email) updatedData.email = email;
            if (role) updatedData.role = role;
            if (password) {
                updatedData.password = await brcypt.hash(password, 10);
            }

            const result = await this.#userModel.update(id, updatedData);
            if (result.modifiedCount > 0) {
                return res.status(200).json({ message: "Usuario actualizado" });
            } else {
                return res.status(500).json({ message: "Error al actualizar el usuario" });
            }
        } catch (err) {
            return res.status(500).json({ message: "Error del servidor", error: err.message });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ message: "ID inválido" });
            }

            const user = await this.#userModel.getBy({ _id: new ObjectId(id) });
            if (!user) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }

            const result = await this.#userModel.delete(id);
            if (result.deletedCount > 0) {
                return res.status(200).json({ message: "Usuario eliminado" });
            } else {
                return res.status(500).json({ message: "Error al eliminar el usuario" });
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

            const isPasswordValid = await brcypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Credenciales inválidas" });
            }

            const token = jwt.sign(
                { userId: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            );

            return res.status(200).json({ message: "Login exitoso", token });
        } catch (err) {
            return res.status(500).json({ message: "Error del servidor", error: err.message });
        }
    }
}

// src/models/user.model.js
import { ObjectId } from "mongodb";

class User {
    #collection;

    constructor(db) {
        this.#collection = db.collection("users");
    }

    async create(user) {
        try {
            const result = await this.#collection.insertOne(user);
            return result.insertedId;
        } catch (err) {
            console.error("Error al crear usuario:", err);
            return undefined;
        }
    }

    async getAll() {
        try {
            const users = await this.#collection.find({}, { projection: { password: 0 } }).toArray();
            return users;
        } catch (err) {
            console.error("Error al obtener todos los usuarios:", err);
            return [];
        }
    }

    async getBy(filter) {
        try {
            const user = await this.#collection.findOne(filter);
            return user;
        } catch (err) {
            console.error("Error al buscar usuario:", err);
            return null;
        }
    }
    
    // Método para buscar por ID
    async getById(id) {
        try {
            const user = await this.#collection.findOne({ _id: new ObjectId(id) });
            return user;
        } catch (err) {
            console.error("Error al buscar usuario por ID:", err);
            return null;
        }
    }

    async update(id, data) {
        try {
            const result = await this.#collection.updateOne({ _id: new ObjectId(id) }, { $set: data });
            return result;
        } catch (err) {
            console.error("Error al actualizar usuario:", err);
            return { modifiedCount: 0 };
        }
    }

    async delete(id) {
        try {
            const result = await this.#collection.deleteOne({ _id: new ObjectId(id) });
            return result;
        } catch (err) {
            console.error("Error al eliminar usuario:", err);
            return { deletedCount: 0 };
        }
    }
}

export default User;

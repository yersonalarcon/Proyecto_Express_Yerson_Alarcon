import { ObjectId } from "mongodb";

class Movie {
    #collection;

    constructor(db) {
        this.#collection = db.collection("movies");
    }

    async create(movie) {
        try {
            // Verificar si el código ya existe
            const existing = await this.#collection.findOne({ 
                code: movie.code 
            });
            
            if (existing) {
                throw new Error('El código de película ya existe');
            }

            const result = await this.#collection.insertOne(movie);
            return result.insertedId;
        } catch (err) {
            console.error("Error al crear película:", err);
            throw err;
        }
    }

    async getAll() {
        try {
            return await this.#collection.find({}).sort({ releaseDate: -1 }).toArray();
        } catch (err) {
            console.error("Error al obtener películas:", err);
            return [];
        }
    }

    async getByCode(code) {
        try {
            return await this.#collection.findOne({ code });
        } catch (err) {
            console.error("Error al buscar película por código:", err);
            return null;
        }
    }

    async getById(id) {
        try {
            return await this.#collection.findOne({ 
                _id: new ObjectId(id) 
            });
        } catch (err) {
            console.error("Error al buscar película por ID:", err);
            return null;
        }
    }

    async update(id, data) {
        try {
            // Verificar que el código no exista en otra película
            if (data.code) {
                const existing = await this.#collection.findOne({
                    code: data.code,
                    _id: { $ne: new ObjectId(id) }
                });
                if (existing) {
                    throw new Error('El código ya existe en otra película');
                }
            }

            const result = await this.#collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { ...data, updatedAt: new Date() } }
            );
            return result;
        } catch (err) {
            console.error("Error al actualizar película:", err);
            throw err;
        }
    }

    async delete(id) {
        try {
            // Aquí luego agregaremos validación de funciones asociadas
            const result = await this.#collection.deleteOne({ 
                _id: new ObjectId(id) 
            });
            return result;
        } catch (err) {
            console.error("Error al eliminar película:", err);
            throw err;
        }
    }

    async search(query) {
        try {
            return await this.#collection.find({
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { genre: { $regex: query, $options: 'i' } },
                    { director: { $regex: query, $options: 'i' } }
                ]
            }).toArray();
        } catch (err) {
            console.error("Error en búsqueda:", err);
            return [];
        }
    }
}

export default Movie;
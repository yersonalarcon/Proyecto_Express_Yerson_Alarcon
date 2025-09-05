import { ObjectId } from "mongodb";

class Confiteria {
    #collection;

    constructor(db) {
        this.#collection = db.collection("Confiteria");
    }

    async create(confiteria) {
        try {
            const existing = await this.#collection.findOne({ 
                code: confiteria.code 
            });
            
            if (existing) {
                throw new Error('El código de la confiteria ya existe');
            }

            const result = await this.#collection.insertOne(confiteria);
            return result.insertedId;
        } catch (err) {
            console.error("Error al crear la confiteria:", err);
            throw err;
        }
    }

    async getAll() {
        try {
            return await this.#collection.find({}).sort({ releaseDate: -1 }).toArray();
        } catch (err) {
            console.error("Error al obtener la confiteria:", err);
            return [];
        }
    }

    async getByCode(code) {
        try {
            return await this.#collection.findOne({ code });
        } catch (err) {
            console.error("Error al buscar la confiteria por código:", err);
            return null;
        }
    }

    async getById(id) {
        try {
            return await this.#collection.findOne({ 
                _id: new ObjectId(id) 
            });
        } catch (err) {
            console.error("Error al buscar la confiteria por ID:", err);
            return null;
        }
    }

    async update(id, data) {
        try {
            if (data.code) {
                const existing = await this.#collection.findOne({
                    code: data.code,
                    _id: { $ne: new ObjectId(id) }
                });
                if (existing) {
                    throw new Error('El código ya existe en otra confiteria');
                }
            }

            const result = await this.#collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { ...data, updatedAt: new Date() } }
            );
            return result;
        } catch (err) {
            console.error("Error al actualizar confiteria:", err);
            throw err;
        }
    }

    async delete(id) {
        try {
            const result = await this.#collection.deleteOne({ 
                _id: new ObjectId(id) 
            });
            return result;
        } catch (err) {
            console.error("Error al eliminar la confiteria:", err);
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

export default Confiteria;
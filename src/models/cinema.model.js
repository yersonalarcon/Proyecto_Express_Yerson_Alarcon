import { ObjectId } from "mongodb";

class Cinema {
    #collection;

    constructor(db) {
        this.#collection = db.collection("cinemas");
    }

    async create(cinema) {
        try {
            // Verificar si el código ya existe
            const existing = await this.#collection.findOne({ 
                code: cinema.code 
            });
            if (existing) {
                throw new Error('El código de cine ya existe');
            }

            const result = await this.#collection.insertOne(cinema);
            return result.insertedId;
        } catch (err) {
            console.error("Error al crear cine:", err);
            throw err;
        }
    }

    async getAll() {
        try {
            return await this.#collection.find({}).toArray();
        } catch (err) {
            console.error("Error al obtener cines:", err);
            return [];
        }
    }

    async getByCode(code) {
        try {
            return await this.#collection.findOne({ code });
        } catch (err) {
            console.error("Error al buscar cine por código:", err);
            return null;
        }
    }

    async getById(id) {
        try {
            return await this.#collection.findOne({ 
                _id: new ObjectId(id) 
            });
        } catch (err) {
            console.error("Error al buscar cine por ID:", err);
            return null;
        }
    }

    async update(id, data) {
        try {
            // Verificar que el código no exista en otro cine
            if (data.code) {
                const existing = await this.#collection.findOne({
                    code: data.code,
                    _id: { $ne: new ObjectId(id) }
                });
                if (existing) {
                    throw new Error('El código ya existe en otro cine');
                }
            }

            const result = await this.#collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: data }
            );
            return result;
        } catch (err) {
            console.error("Error al actualizar cine:", err);
            throw err;
        }
    }

    async delete(id) {
        try {
            // Verificar si hay salas asociadas
            const roomModel = new RoomModel(this.db); // Necesitarías inyectar db
            const rooms = await roomModel.getByCinema(id);
            
            if (rooms.length > 0) {
                throw new Error('No se puede eliminar: tiene salas asociadas');
            }

            const result = await this.#collection.deleteOne({ 
                _id: new ObjectId(id) 
            });
            return result;
        } catch (err) {
            console.error("Error al eliminar cine:", err);
            throw err;
        }
    }
}

export default Cinema;
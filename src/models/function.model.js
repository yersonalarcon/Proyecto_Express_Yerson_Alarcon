import { ObjectId } from "mongodb";

class Function {
    #collection;

    constructor(db) {
        this.#collection = db.collection("functions");
    }

    // 📌 Crear una función
    async create(functionData) {
        try {
            const { cinemaId, roomId, date, startTime, duration } = functionData;

            // Validar IDs
            if (!ObjectId.isValid(cinemaId) || !ObjectId.isValid(roomId) || !ObjectId.isValid(functionData.movieId)) {
                throw new Error("IDs inválidos para cine, sala o película");
            }

            // Normalizar datos
            const startDateTime = new Date(`${date}T${startTime}`);
            const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

            const newFunction = {
                ...functionData,
                cinemaId: new ObjectId(cinemaId),
                roomId: new ObjectId(roomId),
                movieId: new ObjectId(functionData.movieId),
                endTime: endDateTime.toTimeString().slice(0, 5),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Validar conflicto
            const existingFunction = await this.#checkTimeConflict(
                newFunction.cinemaId,
                newFunction.roomId,
                newFunction.date,
                newFunction.startTime,
                newFunction.endTime
            );
            if (existingFunction) {
                throw new Error("⛔ Ya existe una función en la misma sala y horario");
            }

            const result = await this.#collection.insertOne(newFunction);
            return result.insertedId;
        } catch (err) {
            console.error("❌ Error al crear función:", err);
            throw err;
        }
    }

    // 📌 Validar conflicto de horarios
    async #checkTimeConflict(cinemaId, roomId, date, startTime, endTime) {
        return await this.#collection.findOne({
            cinemaId,
            roomId,
            date,
            $or: [
                // Caso 1: inicio dentro de otra función
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
            ]
        });
    }

    // 📌 Obtener todas las funciones con joins
    async getAll() {
        try {
            return await this.#collection.aggregate([
                { $sort: { date: 1, startTime: 1 } },
                { 
                    $lookup: {
                        from: "cinemas",
                        localField: "cinemaId",
                        foreignField: "_id",
                        as: "cinema"
                    }
                },
                { $lookup: {
                        from: "rooms",
                        localField: "roomId",
                        foreignField: "_id",
                        as: "room"
                }},
                { $lookup: {
                        from: "movies",
                        localField: "movieId",
                        foreignField: "_id",
                        as: "movie"
                }},
                { $unwind: "$cinema" },
                { $unwind: "$room" },
                { $unwind: "$movie" },
                {
                    $project: {
                        date: 1,
                        startTime: 1,
                        endTime: 1,
                        "cinema._id": 1,
                        "cinema.name": 1,
                        "room._id": 1,
                        "room.code": 1,
                        "movie._id": 1,
                        "movie.title": 1,
                        "movie.duration": 1,
                        createdAt: 1,
                        updatedAt: 1
                    }
                }
            ]).toArray();
        } catch (err) {
            console.error("❌ Error al obtener funciones:", err);
            return [];
        }
    }

    // 📌 Obtener función por ID
    async getById(id) {
        try {
            if (!ObjectId.isValid(id)) return null;
            return await this.#collection.findOne({ _id: new ObjectId(id) });
        } catch (err) {
            console.error("❌ Error al buscar función por ID:", err);
            return null;
        }
    }

    // 📌 Obtener funciones por cine y fecha
    async getByCinemaAndDate(cinemaId, date) {
        try {
            return await this.#collection.aggregate([
                { $match: { cinemaId: new ObjectId(cinemaId), date } },
                { $lookup: {
                        from: "movies",
                        localField: "movieId",
                        foreignField: "_id",
                        as: "movie"
                }},
                { $lookup: {
                        from: "rooms",
                        localField: "roomId",
                        foreignField: "_id",
                        as: "room"
                }},
                { $unwind: "$movie" },
                { $unwind: "$room" },
                { $sort: { startTime: 1 } }
            ]).toArray();
        } catch (err) {
            console.error("❌ Error al buscar funciones por cine y fecha:", err);
            return [];
        }
    }

    // 📌 Obtener funciones de una película en un cine
    async getByMovieAndCinema(movieId, cinemaId) {
        try {
            return await this.#collection.aggregate([
                {
                    $match: {
                        movieId: new ObjectId(movieId),
                        cinemaId: new ObjectId(cinemaId),
                        date: { $gte: new Date().toISOString().split("T")[0] }
                    }
                },
                { $lookup: {
                        from: "rooms",
                        localField: "roomId",
                        foreignField: "_id",
                        as: "room"
                }},
                { $unwind: "$room" },
                { $sort: { date: 1, startTime: 1 } }
            ]).toArray();
        } catch (err) {
            console.error("❌ Error al buscar funciones por película y cine:", err);
            return [];
        }
    }

    // 📌 Actualizar
    async update(id, data) {
        try {
            if (!ObjectId.isValid(id)) throw new Error("ID inválido");

            const existing = await this.getById(id);
            if (!existing) throw new Error("La función no existe");

            // recalcular horarios si cambian
            let startTime = data.startTime || existing.startTime;
            let duration = data.duration || existing.duration;
            let date = data.date || existing.date;

            const startDateTime = new Date(`${date}T${startTime}`);
            const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
            const newEndTime = endDateTime.toTimeString().slice(0, 5);

            // validar conflicto
            const conflict = await this.#checkTimeConflict(
                data.cinemaId ? new ObjectId(data.cinemaId) : existing.cinemaId,
                data.roomId ? new ObjectId(data.roomId) : existing.roomId,
                date,
                startTime,
                newEndTime
            );

            if (conflict && conflict._id.toString() !== id) {
                throw new Error("⛔ El nuevo horario entra en conflicto con otra función");
            }

            const result = await this.#collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { ...data, endTime: newEndTime, updatedAt: new Date() } }
            );
            return result;
        } catch (err) {
            console.error("❌ Error al actualizar función:", err);
            throw err;
        }
    }

    // 📌 Eliminar
    async delete(id) {
        try {
            if (!ObjectId.isValid(id)) throw new Error("ID inválido");
            return await this.#collection.deleteOne({ _id: new ObjectId(id) });
        } catch (err) {
            console.error("❌ Error al eliminar función:", err);
            throw err;
        }
    }

    // 📌 Rango de fechas
    async getFunctionsByDateRange(startDate, endDate) {
        try {
            return await this.#collection.aggregate([
                { $match: { date: { $gte: startDate, $lte: endDate } } },
                { $lookup: { from: "cinemas", localField: "cinemaId", foreignField: "_id", as: "cinema" }},
                { $lookup: { from: "movies", localField: "movieId", foreignField: "_id", as: "movie" }},
                { $lookup: { from: "rooms", localField: "roomId", foreignField: "_id", as: "room" }},
                { $unwind: "$cinema" },
                { $unwind: "$movie" },
                { $unwind: "$room" },
                {
                    $group: {
                        _id: { date: "$date", movieId: "$movie._id", cinemaId: "$cinema._id" },
                        movie: { $first: "$movie" },
                        cinema: { $first: "$cinema" },
                        roomCount: { $sum: 1 },
                        functions: { $push: "$$ROOT" }
                    }
                },
                { $sort: { "_id.date": 1 } }
            ]).toArray();
        } catch (err) {
            console.error("❌ Error al obtener funciones por rango de fechas:", err);
            return [];
        }
    }
}

export default Function;

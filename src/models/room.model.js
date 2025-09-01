// models/room.model.js
import { ObjectId } from "mongodb";

export default class Room {
  constructor(db) {
    // Asegúrate que sea "rooms" (plural) como en tu base
    this.col = db.collection("rooms");
  }

  // Normaliza ObjectId -> string
  _normalize(doc) {
    if (!doc) return null;
    return {
      ...doc,
      _id: doc._id?.toString(),
      cinemaId: (doc.cinemaId && typeof doc.cinemaId === "object" && doc.cinemaId._bsontype === "ObjectId")
        ? doc.cinemaId.toString()
        : doc.cinemaId
    };
  }

  async getAll() {
    const docs = await this.col.find({}).sort({ createdAt: -1 }).toArray();
    return docs.map(d => this._normalize(d));
  }

  async getById(id) {
    const _id = ObjectId.isValid(id) ? new ObjectId(id) : id;
    const doc = await this.col.findOne({ _id });
    return this._normalize(doc);
  }

  async getByCinema(cinemaId) {
    const cid = ObjectId.isValid(cinemaId) ? new ObjectId(cinemaId) : cinemaId;
    const docs = await this.col.find({ cinemaId: cid }).toArray();
    return docs.map(d => this._normalize(d));
  }

  async create(payload) {
    const { code, numSeats, cinemaId } = payload;

    const doc = {
      code,
      numSeats: Number(numSeats),
      cinemaId: ObjectId.isValid(cinemaId) ? new ObjectId(cinemaId) : cinemaId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { insertedId } = await this.col.insertOne(doc);
    const created = await this.col.findOne({ _id: insertedId });
    return this._normalize(created);
  }

  async update(id, payload) {
    const _id = ObjectId.isValid(id) ? new ObjectId(id) : id;

    const update = {
      ...("code" in payload ? { code: payload.code } : {}),
      ...("numSeats" in payload ? { numSeats: Number(payload.numSeats) } : {}),
      ...("cinemaId" in payload ? {
        cinemaId: ObjectId.isValid(payload.cinemaId)
          ? new ObjectId(payload.cinemaId)
          : payload.cinemaId
      } : {}),
      updatedAt: new Date(),
    };

    await this.col.updateOne({ _id }, { $set: update });
    const updated = await this.col.findOne({ _id });
    return this._normalize(updated);
  }

  async delete(id) {
    const _id = ObjectId.isValid(id) ? new ObjectId(id) : id;
    await this.col.deleteOne({ _id });
    return { ok: true };
  }
}

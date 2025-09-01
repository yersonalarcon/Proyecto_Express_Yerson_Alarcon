import RoomDto from "../dtos/room.dto.js";

export default class RoomController {
  constructor(roomModel, cinemaModel) {
    this.roomModel = roomModel;
    this.cinemaModel = cinemaModel;
  }

  async create(roomData) {
    try {
      const roomDto = new RoomDto(roomData);
      const validationErrors = roomDto.validate();

      if (validationErrors.length > 0) {
        return {
          error: true,
          message: validationErrors.join(", "),
        };
      }

      // Verificar que el cine existe
      const cinema = await this.cinemaModel.getById(roomDto.cinemaId);
      if (!cinema) {
        return {
          error: true,
          message: "El cine especificado no existe",
        };
      }

      const insertedId = await this.roomModel.create(roomDto);
      return {
        error: false,
        message: "Sala creada exitosamente",
        roomId: insertedId,
      };
    } catch (error) {
      console.error("Error creating room:", error);
      return {
        error: true,
        message: error.message || "Error del servidor al crear sala",
      };
    }
  }

  async getAll() {
    try {
      const rooms = await this.roomModel.getAll(); // ← ya viene normalizado
      return { error: false, rooms };
    } catch (error) {
      console.error("Error getting rooms:", error);
      return { error: true, message: "Error del servidor al obtener salas" };
    }
  }

  async getByCinema(cinemaId) {
    try {
      const rooms = await this.roomModel.getByCinema(cinemaId);
      return { error: false, rooms };
    } catch (error) {
      console.error("Error getting rooms by cinema:", error);
      return {
        error: true,
        message: "Error del servidor al obtener salas",
      };
    }
  }

  async getById(id) {
    try {
      const room = await this.roomModel.getById(id);
      if (!room) {
        return {
          error: true,
          message: "Sala no encontrada",
        };
      }
      return { error: false, room };
    } catch (error) {
      console.error("Error getting room:", error);
      return {
        error: true,
        message: "Error del servidor al buscar sala",
      };
    }
  }

  async update(id, data) {
    try {
      const roomDto = new RoomDto(data);
      const validationErrors = roomDto.validate();

      if (validationErrors.length > 0) {
        return {
          error: true,
          message: validationErrors.join(", "),
        };
      }

      // Verificar que el cine existe
      const cinema = await this.cinemaModel.getById(roomDto.cinemaId);
      if (!cinema) {
        return {
          error: true,
          message: "El cine especificado no existe",
        };
      }

      const result = await this.roomModel.update(id, roomDto);
      if (result.modifiedCount === 0) {
        return {
          error: true,
          message: "Sala no actualizada",
        };
      }
      return {
        error: false,
        message: "Sala actualizada exitosamente",
      };
    } catch (error) {
      console.error("Error updating room:", error);
      return {
        error: true,
        message: error.message || "Error del servidor al actualizar sala",
      };
    }
  }

  async delete(id) {
    try {
      const result = await this.roomModel.delete(id);
      if (result.deletedCount === 0) {
        return {
          error: true,
          message: "Sala no encontrada",
        };
      }
      return {
        error: false,
        message: "Sala eliminada exitosamente",
      };
    } catch (error) {
      console.error("Error deleting room:", error);
      return {
        error: true,
        message: error.message || "Error del servidor al eliminar sala",
      };
    }
  }
}

import CinemaDto from "../dtos/cinema.dto.js";

export default class CinemaController {
  constructor(cinemaModel) {
    this.cinemaModel = cinemaModel;
  }

  async create(cinemaData) {
    try {
      const cinemaDto = new CinemaDto(cinemaData);
      const validationErrors = cinemaDto.validate();

      if (validationErrors.length > 0) {
        return {
          error: true,
          message: validationErrors.join(", "),
        };
      }

      const insertedId = await this.cinemaModel.create(cinemaDto);
      return {
        error: false,
        message: "Cine creado exitosamente",
        cinemaId: insertedId,
      };
    } catch (error) {
      console.error("Error creating cinema:", error);
      return {
        error: true,
        message: error.message || "Error del servidor al crear cine",
      };
    }
  }

  async getAll() {
    try {
      const cinemas = await this.cinemaModel.getAll();
      return { error: false, cinemas };
    } catch (error) {
      console.error("Error getting cinemas:", error);
      return {
        error: true,
        message: "Error del servidor al obtener cines",
      };
    }
  }

  async getById(id) {
    try {
      const cinema = await this.cinemaModel.getById(id);
      if (!cinema) {
        return {
          error: true,
          message: "Cine no encontrado",
        };
      }
      return { error: false, cinema };
    } catch (error) {
      console.error("Error getting cinema:", error);
      return {
        error: true,
        message: "Error del servidor al buscar cine",
      };
    }
  }

  async update(id, data) {
    try {
      const cinemaDto = new CinemaDto(data);
      const validationErrors = cinemaDto.validate();

      if (validationErrors.length > 0) {
        return {
          error: true,
          message: validationErrors.join(", "),
        };
      }

      const result = await this.cinemaModel.update(id, cinemaDto);
      if (result.modifiedCount === 0) {
        return {
          error: true,
          message: "Cine no actualizado",
        };
      }
      return {
        error: false,
        message: "Cine actualizado exitosamente",
      };
    } catch (error) {
      console.error("Error updating cinema:", error);
      return {
        error: true,
        message: error.message || "Error del servidor al actualizar cine",
      };
    }
  }

  async delete(id) {
    try {
      const result = await this.cinemaModel.delete(id);
      if (result.deletedCount === 0) {
        return {
          error: true,
          message: "Cine no encontrado",
        };
      }
      return {
        error: false,
        message: "Cine eliminado exitosamente",
      };
    } catch (error) {
      console.error("Error deleting cinema:", error);
      return {
        error: true,
        message: error.message || "Error del servidor al eliminar cine",
      };
    }
  }
}

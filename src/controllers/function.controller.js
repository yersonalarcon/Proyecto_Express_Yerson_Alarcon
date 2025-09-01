import FunctionDto from "../dtos/function.dto.js";

export default class FunctionController {
    constructor(functionModel, cinemaModel, roomModel, movieModel) {
        this.functionModel = functionModel;
        this.cinemaModel = cinemaModel;
        this.roomModel = roomModel;
        this.movieModel = movieModel;
    }

    async create(functionData) {
        try {
            // Obtener duración de la película
            const movie = await this.movieModel.getById(functionData.movieId);
            if (!movie) {
                return { 
                    error: true, 
                    message: 'La película no existe' 
                };
            }

            const functionDto = new FunctionDto(functionData, movie.duration);
            const validationErrors = functionDto.validate();
            
            if (validationErrors.length > 0) {
                return { 
                    error: true, 
                    message: validationErrors.join(', ') 
                };
            }

            // Verificar que el cine existe
            const cinema = await this.cinemaModel.getById(functionDto.cinemaId);
            if (!cinema) {
                return { 
                    error: true, 
                    message: 'El cine no existe' 
                };
            }

            // Verificar que la sala existe y pertenece al cine
            const room = await this.roomModel.getById(functionDto.roomId);
            if (!room) {
                return { 
                    error: true, 
                    message: 'La sala no existe' 
                };
            }

            if (room.cinemaId.toString() !== functionDto.cinemaId.toString()) {
                return { 
                    error: true, 
                    message: 'La sala no pertenece al cine seleccionado' 
                };
            }

            const insertedId = await this.functionModel.create(functionDto);
            return { 
                error: false, 
                message: 'Función creada exitosamente', 
                functionId: insertedId 
            };
        } catch (error) {
            console.error('Error creating function:', error);
            return { 
                error: true, 
                message: error.message || 'Error del servidor al crear función' 
            };
        }
    }

    async getAll() {
        try {
            const functions = await this.functionModel.getAll();
            return { error: false, functions };
        } catch (error) {
            console.error('Error getting functions:', error);
            return { 
                error: true, 
                message: 'Error del servidor al obtener funciones' 
            };
        }
    }

    async getById(id) {
        try {
            const func = await this.functionModel.getById(id);
            if (!func) {
                return { 
                    error: true, 
                    message: 'Función no encontrada' 
                };
            }
            return { error: false, function: func };
        } catch (error) {
            console.error('Error getting function:', error);
            return { 
                error: true, 
                message: 'Error del servidor al buscar función' 
            };
        }
    }

    async getByCinemaAndDate(cinemaId, date) {
        try {
            const functions = await this.functionModel.getByCinemaAndDate(cinemaId, date);
            return { error: false, functions };
        } catch (error) {
            console.error('Error getting functions by cinema and date:', error);
            return { 
                error: true, 
                message: 'Error del servidor al obtener funciones' 
            };
        }
    }

    async getByMovieAndCinema(movieId, cinemaId) {
        try {
            const functions = await this.functionModel.getByMovieAndCinema(movieId, cinemaId);
            return { error: false, functions };
        } catch (error) {
            console.error('Error getting functions by movie and cinema:', error);
            return { 
                error: true, 
                message: 'Error del servidor al obtener funciones' 
            };
        }
    }

    async getByDateRange(startDate, endDate) {
        try {
            const functions = await this.functionModel.getFunctionsByDateRange(startDate, endDate);
            return { error: false, functions };
        } catch (error) {
            console.error('Error getting functions by date range:', error);
            return { 
                error: true, 
                message: 'Error del servidor al obtener funciones' 
            };
        }
    }

    async update(id, data) {
        try {
            let movieDuration = data.duration;
            
            // Si se cambia la película, obtener nueva duración
            if (data.movieId) {
                const movie = await this.movieModel.getById(data.movieId);
                if (!movie) {
                    return { 
                        error: true, 
                        message: 'La película no existe' 
                    };
                }
                movieDuration = movie.duration;
            }

            const result = await this.functionModel.update(id, {
                ...data,
                duration: movieDuration
            });

            if (result.modifiedCount === 0) {
                return { 
                    error: true, 
                    message: 'Función no actualizada' 
                };
            }
            return { 
                error: false, 
                message: 'Función actualizada exitosamente' 
            };
        } catch (error) {
            console.error('Error updating function:', error);
            return { 
                error: true, 
                message: error.message || 'Error del servidor al actualizar función' 
            };
        }
    }

    async delete(id) {
        try {
            const result = await this.functionModel.delete(id);
            if (result.deletedCount === 0) {
                return { 
                    error: true, 
                    message: 'Función no encontrada' 
                };
            }
            return { 
                error: false, 
                message: 'Función eliminada exitosamente' 
            };
        } catch (error) {
            console.error('Error deleting function:', error);
            return { 
                error: true, 
                message: error.message || 'Error del servidor al eliminar función' 
            };
        }
    }
}
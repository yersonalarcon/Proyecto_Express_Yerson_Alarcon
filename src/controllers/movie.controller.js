import MovieDto from "../dtos/movie.dto.js";

export default class MovieController {
    constructor(movieModel) {
        this.movieModel = movieModel;
    }

    async create(movieData) {
        try {
            const movieDto = new MovieDto(movieData);
            const validationErrors = movieDto.validate();
            
            if (validationErrors.length > 0) {
                return { 
                    error: true, 
                    message: validationErrors.join(', ') 
                };
            }

            const insertedId = await this.movieModel.create(movieDto);
            return { 
                error: false, 
                message: 'Película creada exitosamente', 
                movieId: insertedId 
            };
        } catch (error) {
            console.error('Error creating movie:', error);
            return { 
                error: true, 
                message: error.message || 'Error del servidor al crear película' 
            };
        }
    }

    async getAll() {
        try {
            const movies = await this.movieModel.getAll();
            return { error: false, movies };
        } catch (error) {
            console.error('Error getting movies:', error);
            return { 
                error: true, 
                message: 'Error del servidor al obtener películas' 
            };
        }
    }

    async getById(id) {
        try {
            const movie = await this.movieModel.getById(id);
            if (!movie) {
                return { 
                    error: true, 
                    message: 'Película no encontrada' 
                };
            }
            return { error: false, movie };
        } catch (error) {
            console.error('Error getting movie:', error);
            return { 
                error: true, 
                message: 'Error del servidor al buscar película' 
            };
        }
    }

    async update(id, data) {
        try {
            const movieDto = new MovieDto(data);
            const validationErrors = movieDto.validate();
            
            if (validationErrors.length > 0) {
                return { 
                    error: true, 
                    message: validationErrors.join(', ') 
                };
            }

            const result = await this.movieModel.update(id, movieDto);
            if (result.modifiedCount === 0) {
                return { 
                    error: true, 
                    message: 'Película no actualizada' 
                };
            }
            return { 
                error: false, 
                message: 'Película actualizada exitosamente' 
            };
        } catch (error) {
            console.error('Error updating movie:', error);
            return { 
                error: true, 
                message: error.message || 'Error del servidor al actualizar película' 
            };
        }
    }

    async delete(id) {
        try {
            const result = await this.movieModel.delete(id);
            if (result.deletedCount === 0) {
                return { 
                    error: true, 
                    message: 'Película no encontrada' 
                };
            }
            return { 
                error: false, 
                message: 'Película eliminada exitosamente' 
            };
        } catch (error) {
            console.error('Error deleting movie:', error);
            return { 
                error: true, 
                message: error.message || 'Error del servidor al eliminar película' 
            };
        }
    }

    async search(query) {
        try {
            const movies = await this.movieModel.search(query);
            return { error: false, movies };
        } catch (error) {
            console.error('Error searching movies:', error);
            return { 
                error: true, 
                message: 'Error del servidor al buscar películas' 
            };
        }
    }
}
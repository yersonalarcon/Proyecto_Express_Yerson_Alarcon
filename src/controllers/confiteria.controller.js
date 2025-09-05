import {ConfiteriaDto } from "../dtos/confiteria.js";

export default class ConfiteriaController {
    constructor(confiteriamodel) {
        this.confiteriamodel = confiteriamodel;
    }

    async create(confiteriaData) {
        try {
            const ConfiteriaDto = new ConfiteriaDto(confiteriaData);
            const validationErrors = ConfiteriaDto.validate();

            if (validationErrors.length > 0) {
                return {
                    error: true,
                    message: validationErrors.join(',')
                };
            }
            const insertedId = await this.confiteriamodel.create(confiteriaData);
            return {
                error: false,
                message: 'Confiteria Agregada correctamente',
                confiteriaId: insertedId
            };
        } catch (error) {
            console.error('Error creating confiteria:', error);
            return {
                error: true,
                message: error.message || 'Error del servidor al crear confiteria'
            };
        }
    }

    async getAll() {
        try {
            const confiteria = await this.confiteriamodel.getAll();
            return { error: false, confiteria };
        } catch (error) {
            console.error('Error getting confiteria:', error);
            return {
                error: true,
                message: 'Error del servidor al obtener la confiteria'
            };
        }
    }

    async getById(id) {
        try {
            const confiteria = await this.confiteriamodel.getById(id);
            if (!confiteria) {
                return {
                    error: true,
                    message: 'Confiteria no encontrada'
                };
            }
            return { error: false, confiteria };
        } catch (error) {
            console.error('Error getting confiteria:', error);
            return {
                error: true,
                message: 'Error del servidor al buscar la confiteria'
            };
        }
    }

    async update(id, data) {
        try {
            const ConfiteriaDto = new ConfitiriaDto(data);
            const validationErrors = ConfiteriaDto.validate();

            if (validationErrors.length > 0) {
                return {
                    error: true,
                    message: validationErrors.join(', ')
                };
            }

            const result = await this.confiteriamodel.update(id, ConfiteriaDto);
            if (result.modifiedCount === 0) {
                return {
                    error: true,
                    message: 'confiteria no actualizada'
                };
            }
            return {
                error: false,
                message: 'confiteria actualizada exitosamente'
            };
        } catch (error) {
            console.error('Error updating confiteria:', error);
            return {
                error: true,
                message: error.message || 'Error del servidor al actualizar confiteria'
            };
        }
    }

    async delete(id) {
        try {
            const result = await this.confiteriamodel.delete(id);
            if (result.deletedCount === 0) {
                return {
                    error: true,
                    message: 'confiteria no encontrada'
                };
            }
            return {
                error: false,
                message: 'confitieria eliminada exitosamente'
            };
        } catch (error) {
            console.error('Error deleting confiteria:', error);
            return {
                error: true,
                message: error.message || 'Error del servidor al eliminar confiteria'
            };
        }
    }

    async search(query) {
        try {
            const confiteria = await this.confiteriamodel.search(query);
            return { error: false, confiteria };
        } catch (error) {
            console.error('Error searching confiteria:', error);
            return {
                error: true,
                message: 'Error del servidor al buscar confiteria'
            };
        }
    }
}

export default class RoomDto {
    constructor(data) {
        this.code = data.code;
        this.numSeats = parseInt(data.numSeats);
        this.cinemaId = data.cinemaId;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    validate() {
        const errors = [];

        if (!this.code || this.code.trim().length === 0) {
            errors.push('El código es requerido');
        }

        if (!this.numSeats || isNaN(this.numSeats) || this.numSeats <= 0) {
            errors.push('El número de sillas debe ser mayor a 0');
        }

        if (!this.cinemaId || this.cinemaId.trim().length === 0) {
            errors.push('El cine es requerido');
        }

        if (this.numSeats > 500) {
            errors.push('El número de sillas no puede exceder 500');
        }

        return errors;
    }

    toJSON() {
        return {
            code: this.code,
            numSeats: this.numSeats,
            cinemaId: this.cinemaId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
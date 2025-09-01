export default class CinemaDto {
    constructor(data) {
        this.code = data.code;
        this.name = data.name;
        this.address = data.address;
        this.city = data.city;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    validate() {
        const errors = [];

        if (!this.code || this.code.trim().length === 0) {
            errors.push('El código es requerido');
        }

        if (!this.name || this.name.trim().length === 0) {
            errors.push('El nombre es requerido');
        }

        if (!this.address || this.address.trim().length === 0) {
            errors.push('La dirección es requerida');
        }

        if (!this.city || this.city.trim().length === 0) {
            errors.push('La ciudad es requerida');
        }

        return errors;
    }
}


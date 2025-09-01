export default class FunctionDto {
    constructor(data, movieDuration) {
        this.cinemaId = data.cinemaId;
        this.roomId = data.roomId;
        this.movieId = data.movieId;
        this.date = data.date;
        this.startTime = data.startTime;
        this.duration = movieDuration;
        this.endTime = this.calculateEndTime(data.startTime, movieDuration);
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    calculateEndTime(startTime, duration) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);
        
        const endDate = new Date(startDate.getTime() + duration * 60000);
        return endDate.toTimeString().slice(0, 5);
    }

    validate() {
        const errors = [];

        if (!this.cinemaId) {
            errors.push('El cine es requerido');
        }

        if (!this.roomId) {
            errors.push('La sala es requerida');
        }

        if (!this.movieId) {
            errors.push('La película es requerida');
        }

        if (!this.date) {
            errors.push('La fecha es requerida');
        }

        if (!this.startTime) {
            errors.push('La hora de inicio es requerida');
        }

        // Validar que la fecha no sea anterior a hoy
        const today = new Date().toISOString().split('T')[0];
        if (this.date < today) {
            errors.push('La fecha no puede ser anterior al día de hoy');
        }

        // Validar formato de hora
        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(this.startTime)) {
            errors.push('El formato de hora es inválido (HH:MM)');
        }

        return errors;
    }

    toJSON() {
        return {
            cinemaId: this.cinemaId,
            roomId: this.roomId,
            movieId: this.movieId,
            date: this.date,
            startTime: this.startTime,
            endTime: this.endTime,
            duration: this.duration,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
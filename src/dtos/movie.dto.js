export default class MovieDto {
    constructor(data) {
        this.code = data.code;
        this.title = data.title;
        this.synopsis = data.synopsis;
        this.cast = Array.isArray(data.cast) ? data.cast : (data.cast ? data.cast.split(',') : []);
        this.classification = data.classification;
        this.language = data.language;
        this.director = data.director;
        this.duration = parseInt(data.duration);
        this.genre = data.genre;
        this.releaseDate = new Date(data.releaseDate);
        this.trailer = data.trailer;
        this.poster = data.poster;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    validate() {
        const errors = [];

        if (!this.code || this.code.trim().length === 0) {
            errors.push('El código es requerido');
        }

        if (!this.title || this.title.trim().length === 0) {
            errors.push('El título es requerido');
        }

        if (!this.synopsis || this.synopsis.trim().length < 10) {
            errors.push('La sinopsis debe tener al menos 10 caracteres');
        }

        if (!this.duration || isNaN(this.duration) || this.duration <= 0) {
            errors.push('La duración debe ser mayor a 0 minutos');
        }

        if (!this.releaseDate || isNaN(this.releaseDate.getTime())) {
            errors.push('La fecha de estreno es inválida');
        }

        if (this.trailer && !this.isValidUrl(this.trailer)) {
            errors.push('El enlace del tráiler no es válido');
        }

        if (this.poster && !this.isValidUrl(this.poster)) {
            errors.push('El enlace del póster no es válido');
        }

        return errors;
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    toJSON() {
        return {
            code: this.code,
            title: this.title,
            synopsis: this.synopsis,
            cast: this.cast,
            classification: this.classification,
            language: this.language,
            director: this.director,
            duration: this.duration,
            genre: this.genre,
            releaseDate: this.releaseDate,
            trailer: this.trailer,
            poster: this.poster,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
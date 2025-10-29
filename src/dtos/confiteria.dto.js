export class ConfiteriaDto{
    constructor(data){
        this.code = data.code;
        this.nombre = data.nombre;
        this.descripcion = data.descripcion;
        this.imagen = data.imagen;
        this.price = data.price;
    }
 validate() {
        const errors = [];

        if (!this.code || this.code.trim().length === 0) {
            errors.push('El código es requerido');
        }

        if (!this.nombre || this.nombre.trim().length === 0) {
            errors.push('El nombre es requerido');
        }

        if (!this.descripcion || this.descripcion.trim().length < 5) {
            errors.push('La sinopsis debe tener al menos 5 caracteres');
        }
        if (this.imagen && !this.isValidUrl(this.imagen)) {
            errors.push('El enlace de la imagen no es válido');
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
            nombre: this.nombre,
            descripcion: this.descripcion,
            imagen: this.imagen,
            price:this.price
        };
    }
};

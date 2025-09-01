export class UserDto {
    constructor(data) {
        this.full_name = data.full_name;
        this.id_number = data.id_number;
        this.phone = data.phone;
        this.email = data.email;
        this.role = data.role;
        this.password = data.password;
    }
}

export default UserDto;

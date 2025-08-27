export class UserDto {
    constructor(data){
        this.name=data.name;
        this.phone=data.phone;
        this.email=data.email;
        this.position=data.position;
        this.password=data.password
    }
}

export default UserDto;
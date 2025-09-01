import UserDto from "../dtos/user.create.dto.js";
import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";

export default class UsersController {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async create(userDto) {
    try {
      const existingUser = await this.userModel.getBy({ email: userDto.email });
      if (existingUser) {
        return {
          error: true,
          message: "El correo electrónico ya está registrado.",
        };
      }

      const hashedPassword = await hash(userDto.password, 10);
      const user = { ...userDto, password: hashedPassword };

      const insertedId = await this.userModel.create(user);
      if (!insertedId) {
        return { error: true, message: "No se pudo crear el usuario." };
      }
      return { error: false, message: "Usuario creado", userId: insertedId };
    } catch (error) {
      console.error(error);
      return { error: true, message: "Error del servidor al crear usuario." };
    }
  }

  async login(email, password) {
    try {
      const user = await this.userModel.getBy({ email });
      if (!user) {
        return { error: true, message: "Credenciales inválidas." };
      }

      const isMatch = await compare(password, user.password);
      if (!isMatch) {
        return { error: true, message: "Credenciales inválidas." };
      }

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return { error: false, message: "Login exitoso", token, role: user.role };
    } catch (error) {
      console.error(error);
      return { error: true, message: "Error del servidor al iniciar sesión." };
    }
  }

  async getAll() {
    try {
      const users = await this.userModel.getAll();
      return { error: false, users };
    } catch (error) {
      console.error(error);
      return {
        error: true,
        message: "Error del servidor al obtener usuarios.",
      };
    }
  }

  async getById(id) {
    try {
      const user = await this.userModel.getById(id);
      if (!user) {
        return { error: true, message: "Usuario no encontrado." };
      }
      return { error: false, user };
    } catch (error) {
      console.error(error);
      return { error: true, message: "Error del servidor al buscar usuario." };
    }
  }

  async update(id, data) {
    try {
      const result = await this.userModel.update(id, data);
      if (result.modifiedCount === 0) {
        return {
          error: true,
          message: "Usuario no actualizado. Verifique el ID o los datos.",
        };
      }
      return { error: false, message: "Usuario actualizado exitosamente" };
    } catch (error) {
      console.error(error);
      return {
        error: true,
        message: "Error del servidor al actualizar usuario.",
      };
    }
  }

  async delete(id) {
    try {
      const result = await this.userModel.delete(id);
      if (result.deletedCount === 0) {
        return { error: true, message: "Usuario no encontrado para eliminar." };
      }
      return { error: false, message: "Usuario eliminado exitosamente" };
    } catch (error) {
      console.error(error);
      return {
        error: true,
        message: "Error del servidor al eliminar usuario.",
      };
    }
  }
}

import type { UserRepository } from "../../../domain/repositories/UserRepository.js";
import type { UpdateUserInput } from "../../contracts/user/UpdateUserInput.js";
import type { UserOutput } from "../../contracts/user/UserOutput.js";

export class UpdateUserProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string, data: UpdateUserInput): Promise<UserOutput> {

    //  Validar que venga algo
    if (!data.email && !data.username) {
      throw new Error("No hay datos para actualizar");
    }

    //  Validaciones opcionales
    if (data.email && !data.email.includes("@")) {
      throw new Error("Email inválido");
    }

    if (data.username && data.username.length < 3) {
      throw new Error("Username muy corto");
    }

    //  Si cambia email → verificar duplicado
    if (data.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);

      if (existingUser && existingUser.id !== userId) {
        throw new Error("El email ya está en uso");
      }
    }

    //  Actualizar
    const user = await this.userRepository.update(userId, data);

    // No devolver password
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}

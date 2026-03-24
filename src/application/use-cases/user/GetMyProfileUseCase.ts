import type { UserRepository } from "../../../domain/repositories/UserRepository.js";
import type { UserResponseDTO } from "../../dtos/UserResponseDTO.js";

export class GetMyProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string): Promise<UserResponseDTO> {
    
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

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

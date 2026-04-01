import type { UserRepository } from "../../../domain/repositories/UserRepository.js";
import type { UserOutput } from "../../contracts/user/UserOutput.js";

export class GetMyProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string): Promise<UserOutput> {
    
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

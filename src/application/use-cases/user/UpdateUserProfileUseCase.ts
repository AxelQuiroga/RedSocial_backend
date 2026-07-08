import type { UserRepository } from "../../../domain/repositories/UserRepository.js";
import type { UpdateProfileInput } from "../../contracts/user/UpdateProfileInput.js";
import type { UserPrivateProfileOutput } from "../../contracts/user/UserPrivateProfileOutput.js";
import { ConflictError } from "../../../domain/errors/ConflictError.js";
import { ValidationError } from "../../../domain/errors/ValidationError.js";

export class UpdateUserProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(
    userId: string,
    data: UpdateProfileInput
  ): Promise<UserPrivateProfileOutput> {
    // Guard extra por si algo pasa (Zod ya lo valida)
    if (Object.keys(data).length === 0) {
      throw new ValidationError("No hay datos para actualizar", "NO_DATA_TO_UPDATE");
    }

    // Duplicado email (solo si viene y no es null)
    if (data.email != null) {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictError("El email ya está en uso", "EMAIL_IN_USE");
      }
    }

    // Duplicado username (solo si viene y no es null)
    if (data.username != null) {
      const existingUser = await this.userRepository.findByUsername(data.username);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictError("El username ya está en uso", "USERNAME_IN_USE");
      }
    }

    const user = await this.userRepository.update(userId, data);

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName ?? null,
      bio: user.bio ?? null,
      avatarUrl: user.avatarUrl ?? null,
      coverUrl: user.coverUrl ?? null,
      location: user.location ?? null,
      website: user.website ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}

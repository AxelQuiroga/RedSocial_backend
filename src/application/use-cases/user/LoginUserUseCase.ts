import type { UserRepository } from "../../../domain/repositories/UserRepository.js";
import type { LoginInput } from "../../contracts/user/LoginInput.js";
import type { LoginOutput } from "../../contracts/user/LoginOutput.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../../config/env.js";

export class LoginUserUseCase {
  constructor(private userRepository: UserRepository) { }

  async execute(data: LoginInput): Promise<LoginOutput> {

    //  Validaciones
    if (!data.email || !data.email.includes("@")) {
      throw new Error("Email inválido");
    }

    if (!data.password || data.password.length < 6) {
      throw new Error("Password inválida");
    }

    //  Buscar usuario
    const user = await this.userRepository.findByEmail(data.email);

    // Anti timing attack
    const fakeHash =
      "$2b$10$123456789012345678901uCz9zZzZzZzZzZzZzZzZzZzZzZzZzZ";

    const passwordHash = user?.password || fakeHash;

    const isPasswordValid = await bcrypt.compare(
      data.password,
      passwordHash
    );

    if (!user || !isPasswordValid) {
      throw new Error("Credenciales inválidas");
    }

    // Token
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role
      },
      env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    return { token };
  }
}

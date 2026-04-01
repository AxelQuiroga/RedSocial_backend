import type { Request, Response } from "express";
import { RegisterUserUseCase } from "../../../application/use-cases/user/RegisterUserUseCase.js";
import { LoginUserUseCase } from "../../../application/use-cases/user/LoginUserUseCase.js";
import { PrismaUserRepository } from "../../../infrastructure/repositories/PrismaUserRepository.js";
import { GetMyProfileUseCase } from "../../../application/use-cases/user/GetMyProfileUseCase.js";
import { UpdateUserProfileUseCase } from "../../../application/use-cases/user/UpdateUserProfileUseCase.js";
import type { LoginRequest } from "../dtos/user/LoginRequest.js";
import type { RegisterUserRequest } from "../dtos/user/RegisterUserRequest.js";
import type { UpdateUserRequest } from "../dtos/user/UpdateUserRequest.js";
import {
  toLoginInput,
  toLoginResponse,
  toRegisterUserInput,
  toUpdateUserInput,
  toUserResponse
} from "../mappers/user.mapper.js";
export class UserController {
  async register(req: Request, res: Response) {
    try {
      const userRepo = new PrismaUserRepository();
      const useCase = new RegisterUserUseCase(userRepo);
      const input = toRegisterUserInput(req.body as RegisterUserRequest);
      const user = await useCase.execute(input);

      res.status(201).json(toUserResponse(user));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

   async login(req: Request, res: Response) {
    try {
      const userRepo = new PrismaUserRepository();
      const useCase = new LoginUserUseCase(userRepo);

      const input = toLoginInput(req.body as LoginRequest);
      const result = await useCase.execute(input);

      res.json(toLoginResponse(result));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async me(req: Request, res: Response) {
  try {
    const userRepo = new PrismaUserRepository();
    const useCase = new GetMyProfileUseCase(userRepo);

    const userId = (req as any).user.userId;

    const user = await useCase.execute(userId);

    res.json(toUserResponse(user));
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}




async update(req: Request, res: Response) {
  try {
    const userRepo = new PrismaUserRepository();
    const useCase = new UpdateUserProfileUseCase(userRepo);

    const userId = (req as any).user.userId;

    const input = toUpdateUserInput(req.body as UpdateUserRequest);
    const updatedUser = await useCase.execute(userId, input);

    res.json(toUserResponse(updatedUser));
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}
}

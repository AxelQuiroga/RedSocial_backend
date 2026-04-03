import type { Request, Response } from "express";
import { RegisterUserUseCase } from "../../../application/use-cases/user/RegisterUserUseCase.js";
import { LoginUserUseCase } from "../../../application/use-cases/user/LoginUserUseCase.js";
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
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private loginUserUseCase: LoginUserUseCase,
    private getMyProfileUseCase: GetMyProfileUseCase,
    private updateUserProfileUseCase: UpdateUserProfileUseCase
  ) { }
  async register(req: Request, res: Response) {
    try {

      const input = toRegisterUserInput(
        res.locals.validated.body as RegisterUserRequest
      );

      const user = await this.registerUserUseCase.execute(input);

      res.status(201).json(toUserResponse(user));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {

      const input = toLoginInput(
        res.locals.validated.body as LoginRequest
      );

      const result = await this.loginUserUseCase.execute(input);

      res.json(toLoginResponse(result));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async me(req: Request, res: Response) {
    try {

      const userId = (req as any).user.userId;

      const user = await this.getMyProfileUseCase.execute(userId);

      res.json(toUserResponse(user));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {

      const userId = (req as any).user.userId;

      const input = toUpdateUserInput(
        res.locals.validated.body as UpdateUserRequest
      );

      const updatedUser = await this.updateUserProfileUseCase.execute(userId, input);

      res.json(toUserResponse(updatedUser));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

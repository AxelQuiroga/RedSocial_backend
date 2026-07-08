import type { Request, Response } from "express";
import { RegisterUserUseCase } from "../../../application/use-cases/user/RegisterUserUseCase.js";
import { LoginUserUseCase } from "../../../application/use-cases/user/LoginUserUseCase.js";
import { GetMyProfileUseCase } from "../../../application/use-cases/user/GetMyProfileUseCase.js";
import { GetUserPublicProfileUseCase } from "../../../application/use-cases/user/GetUserPublicProfileUseCase.js";
import { UpdateUserProfileUseCase } from "../../../application/use-cases/user/UpdateUserProfileUseCase.js";
import type { LoginRequest } from "../dtos/user/LoginRequest.js";
import type { RegisterUserRequest } from "../dtos/user/RegisterUserRequest.js";
import type { UpdateProfileRequest } from "../dtos/user/UpdateProfileRequest.js";
import {
  toLoginInput,
  toLoginResponse,
  toRegisterUserInput,
  toUpdateProfileInput,
  toUserPrivateProfileResponse,
  toUserPublicProfileResponse
} from "../mappers/user.mapper.js";

export class UserController {
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private loginUserUseCase: LoginUserUseCase,
    private getMyProfileUseCase: GetMyProfileUseCase,
    private updateUserProfileUseCase: UpdateUserProfileUseCase,
    private getUserPublicProfileUseCase: GetUserPublicProfileUseCase
  ) { }

  async register(req: Request, res: Response) {
    const input = toRegisterUserInput(
      res.locals.validated.body as RegisterUserRequest
    );
    const user = await this.registerUserUseCase.execute(input);
    res.status(201).json(toUserPrivateProfileResponse(user));
  }

  async login(req: Request, res: Response) {
    const input = toLoginInput(
      res.locals.validated.body as LoginRequest
    );
    const result = await this.loginUserUseCase.execute(input);
    res.json(toLoginResponse(result));
  }

  async me(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const userId = req.user.userId;
    const user = await this.getMyProfileUseCase.execute(userId);
    res.json(toUserPrivateProfileResponse(user));
  }

  async update(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const userId = req.user.userId;
    const input = toUpdateProfileInput(
      res.locals.validated.body as UpdateProfileRequest
    );
    const updatedUser = await this.updateUserProfileUseCase.execute(userId, input);
    res.json(toUserPrivateProfileResponse(updatedUser));
  }

  async publicProfile(req: Request, res: Response) {
    const { username } = res.locals.validated.params as { username: string };
    const user = await this.getUserPublicProfileUseCase.execute(username);
    res.json(toUserPublicProfileResponse(user));
  }
}

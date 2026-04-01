import type { LoginRequest } from "../dtos/user/LoginRequest.js";
import type { LoginResponse } from "../dtos/user/LoginResponse.js";
import type { RegisterUserRequest } from "../dtos/user/RegisterUserRequest.js";
import type { UpdateUserRequest } from "../dtos/user/UpdateUserRequest.js";
import type { UserResponse } from "../dtos/user/UserResponse.js";
import type { LoginInput } from "../../../application/contracts/user/LoginInput.js";
import type { LoginOutput } from "../../../application/contracts/user/LoginOutput.js";
import type { RegisterUserInput } from "../../../application/contracts/user/RegisterUserInput.js";
import type { UpdateUserInput } from "../../../application/contracts/user/UpdateUserInput.js";
import type { UserOutput } from "../../../application/contracts/user/UserOutput.js";

export function toLoginInput(body: LoginRequest): LoginInput {
  return {
    email: body.email,
    password: body.password
  };
}

export function toRegisterUserInput(
  body: RegisterUserRequest
): RegisterUserInput {
  return {
    email: body.email,
    password: body.password,
    username: body.username
  };
}

export function toUpdateUserInput(body: UpdateUserRequest): UpdateUserInput {
  const input: UpdateUserInput = {};

  if (body.email !== undefined) {
    input.email = body.email;
  }

  if (body.username !== undefined) {
    input.username = body.username;
  }

  return input;
}

export function toUserResponse(output: UserOutput): UserResponse {
  return {
    id: output.id,
    email: output.email,
    username: output.username,
    role: output.role,
    createdAt: output.createdAt,
    updatedAt: output.updatedAt
  };
}

export function toLoginResponse(output: LoginOutput): LoginResponse {
  return {
    token: output.token
  };
}

import "dotenv/config";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env variable: ${name}`);
  }
  return value;
}

function getNumberEnv(name: string): number {
  const value = Number(getEnv(name));
  if (Number.isNaN(value)) {
    throw new Error(`Invalid numeric env variable: ${name}`);
  }
  return value;
}

export const env = {
  get PORT() { return getNumberEnv("PORT"); },
  get DATABASE_URL() { return getEnv("DATABASE_URL"); },
  get JWT_SECRET() { return getEnv("JWT_SECRET"); },
  get NODE_ENV() { return getEnv("NODE_ENV"); },
  get FRONTEND_URL() { return getEnv("FRONTEND_URL"); },
  get RABBITMQ_URL() { return getEnv("RABBITMQ_URL"); },
  get BCRYPT_SALT_ROUNDS() { return getNumberEnv("BCRYPT_SALT_ROUNDS"); },
  get GEMINI_API_KEY() { return getEnv("GEMINI_API_KEY"); },
  get STORAGE_ENDPOINT() { return getEnv("STORAGE_ENDPOINT"); },
  get STORAGE_ACCESS_KEY() { return getEnv("STORAGE_ACCESS_KEY"); },
  get STORAGE_SECRET_KEY() { return getEnv("STORAGE_SECRET_KEY"); },
  get STORAGE_BUCKET() { return getEnv("STORAGE_BUCKET"); },
  get STORAGE_REGION() { return getEnv("STORAGE_REGION"); },
  get STORAGE_PUBLIC_URL() { return getEnv("STORAGE_PUBLIC_URL"); },
  get STORAGE_PUBLIC_ENDPOINT() { return getEnv("STORAGE_PUBLIC_ENDPOINT"); },
  get IMAGE_MAX_SIZE_MB() { return getNumberEnv("IMAGE_MAX_SIZE_MB"); },
  get IMAGE_MAX_DIMENSION() { return getNumberEnv("IMAGE_MAX_DIMENSION"); },
  get IMAGE_MAX_PER_POST() { return getNumberEnv("IMAGE_MAX_PER_POST"); },
  get IMAGE_QUALITY() { return getNumberEnv("IMAGE_QUALITY"); },
};

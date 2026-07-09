import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Pool DEDICADO para infraestructura de tests (cleanup, factories)
// No pasa por PrismaPg adapter — evita bugs de visibilidad.
export const infraPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
});

// Helper para queries SQL directas de infraestructura
export async function sql(query: string, params?: unknown[]) {
  const client = await infraPool.connect();
  try {
    return await client.query(query, params);
  } finally {
    client.release();
  }
}

// PrismaClient para las operaciones de los casos de uso bajo test
const globalForPrisma = globalThis as unknown as {
  __prismaClientTest: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.__prismaClientTest ??
  new PrismaClient({
    adapter: new PrismaPg(infraPool),
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prismaClientTest = prisma;
}

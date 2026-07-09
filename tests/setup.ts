import { prisma, sql } from './db.js';

// Re-export para test files (misma instancia singleton vía globalThis)
export { prisma };

// Cleanup usando SQL directo (evita bugs del PrismaPg adapter)
export async function cleanupDb() {
  await sql(`DELETE FROM "Notification"`);
  await sql(`DELETE FROM "Like"`);
  await sql(`DELETE FROM "Comment"`);
  await sql(`DELETE FROM "PostImage"`);
  await sql(`DELETE FROM "Post"`);
  await sql(`DELETE FROM "User"`);
}

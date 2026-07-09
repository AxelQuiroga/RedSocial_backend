/**
 * Entry point único para tests de integración.
 *
 * TODOS los tests se importan desde UN solo archivo para evitar
 * bugs de visibilidad de datos del PrismaPg adapter cuando vitest
 * carga módulos desde diferentes archivos.
 *
 * @see https://github.com/prisma/prisma/issues (Driver Adapter + multi-file)
 */
import './comment.integration';
import './like.integration';
import './notification.integration';
import './post.integration';
import './user.integration';

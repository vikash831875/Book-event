import pkg from '@prisma/client/index.js';

const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export default prisma;

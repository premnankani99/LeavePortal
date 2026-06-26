import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

// Adapter directly takes the connection string
const adapter = new PrismaMariaDb(connectionString as string);
const prisma = new PrismaClient({ adapter });

export default prisma;

import app from './app.js';
import prisma from './config/db.js';

const PORT = process.env.PORT || 5001;

let server;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL Database Connected Successfully');

    server = app.listen(PORT, () => {
      console.log(`🚀 BookIt server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database Connection Failed:', error.message);
    process.exit(1);
  }
};

const gracefulShutdown = async () => {
  console.log('\n🛑 Shutting down gracefully...');

  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      console.log('✅ Database disconnected');
      process.exit(0);
    });
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();
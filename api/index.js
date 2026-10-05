import app from '../server.js';
import connectDB from '../config/db.js';
import { initAdminUser } from '../routes/authRoutes.js';

export default async function handler(req, res) {
  try {
    await connectDB();
    await initAdminUser();
  } catch (err) {
    console.warn('Serverless startup db note:', err.message);
  }
  return app(req, res);
}

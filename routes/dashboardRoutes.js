import express from 'express';
import { dataStore } from '../utils/dataStore.js';

const router = express.Router();

router.get('/dashboard/stats', async (req, res) => {
  try {
    const data = await dataStore.getStats();
    res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard stats',
    });
  }
});

export default router;

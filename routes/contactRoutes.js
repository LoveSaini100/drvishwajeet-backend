import express from 'express';
import { dataStore } from '../utils/dataStore.js';

const router = express.Router();

router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and message are required',
      });
    }

    const newQuery = await dataStore.createContact({
      name,
      email,
      subject: subject || 'General Academic Inquiry',
      message,
      status: 'unread',
    });

    res.status(201).json({
      success: true,
      message: 'Inquiry received successfully!',
      data: newQuery,
    });
  } catch (error) {
    console.error('Error creating contact query:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating contact query',
    });
  }
});

router.get('/contacts', async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const queries = await dataStore.getContacts(filter, search || '');

    res.json({
      success: true,
      count: queries.length,
      data: queries,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching contact queries',
    });
  }
});

router.patch('/contacts/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['unread', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const updated = await dataStore.updateContactStatus(req.params.id, status);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    res.json({
      success: true,
      message: 'Inquiry status updated',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating inquiry status',
    });
  }
});

router.delete('/contacts/:id', async (req, res) => {
  try {
    const deleted = await dataStore.deleteContact(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    res.json({
      success: true,
      message: 'Inquiry deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting contact query:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting inquiry',
    });
  }
});

export default router;

import express from 'express';
import { dataStore } from '../utils/dataStore.js';

const router = express.Router();

export const isBirthdayToday = (dobString) => {
  if (!dobString) return false;
  try {
    const today = new Date();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    const currentDay = String(today.getDate()).padStart(2, '0');
    
    let m = '';
    let d = '';
    if (dobString.includes('-')) {
      const parts = dobString.split('-');
      if (parts[0].length === 4) {
        m = parts[1].padStart(2, '0');
        d = parts[2].padStart(2, '0');
      } else {
        d = parts[0].padStart(2, '0');
        m = parts[1].padStart(2, '0');
      }
    } else if (dobString.includes('/')) {
      const parts = dobString.split('/');
      m = parts[0].padStart(2, '0');
      d = parts[1].padStart(2, '0');
    }

    return m === currentMonth && d === currentDay;
  } catch (err) {
    return false;
  }
};

router.post('/register', async (req, res) => {
  try {
    const { name, whatsapp, dob, email, occupation, address, message } = req.body;

    if (!name || !whatsapp || !dob || !email || !occupation || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, whatsapp, dob, email, occupation, address)',
      });
    }

    const registration = await dataStore.createRegistration({
      name,
      whatsapp,
      dob,
      email,
      occupation,
      address,
      message: message || '',
      status: 'new',
    });

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully!',
      data: registration,
    });
  } catch (error) {
    console.error('Error submitting registration:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error submitting registration',
    });
  }
});

router.get('/registrations', async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const registrations = await dataStore.getRegistrations(filter, search || '');

    res.json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching registrations',
    });
  }
});

router.get('/birthdays/today', async (req, res) => {
  try {
    const allStudents = await dataStore.getRegistrations();
    const todayBirthdays = allStudents.filter(student => isBirthdayToday(student.dob));

    res.json({
      success: true,
      count: todayBirthdays.length,
      data: todayBirthdays,
    });
  } catch (error) {
    console.error('Error fetching today birthdays:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching birthday list',
    });
  }
});

router.patch('/registrations/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'reviewed', 'contacted', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const registration = await dataStore.updateRegistrationStatus(req.params.id, status);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: registration,
    });
  } catch (error) {
    console.error('Error updating registration status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating status',
    });
  }
});

router.delete('/registrations/:id', async (req, res) => {
  try {
    const deleted = await dataStore.deleteRegistration(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    res.json({
      success: true,
      message: 'Registration removed successfully',
    });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting registration',
    });
  }
});

export default router;

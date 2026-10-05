import mongoose from 'mongoose';
import Registration from '../models/Registration.js';
import ContactQuery from '../models/ContactQuery.js';
import EmailLog from '../models/EmailLog.js';
import { isBirthdayToday } from '../routes/registrationRoutes.js';

const today = new Date();
const curMonth = String(today.getMonth() + 1).padStart(2, '0');
const curDay = String(today.getDate()).padStart(2, '0');

let memRegistrations = [
  {
    _id: 'reg_demo_1',
    name: 'Aarav Sharma',
    whatsapp: '+91 98765 43210',
    dob: `2001-${curMonth}-${curDay}`,
    email: 'aarav.sharma@example.com',
    occupation: 'M.Tech Research Scholar, Thermal Engg',
    address: 'IIT Roorkee Campus, Roorkee, Uttarakhand',
    message: 'Looking forward to the upcoming mentorship on biomass gasification and green hydrogen systems.',
    status: 'new',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'reg_demo_2',
    name: 'Pooja Verma',
    whatsapp: '+91 98112 34567',
    dob: '1999-05-18',
    email: 'pooja.verma@example.com',
    occupation: 'Ph.D. Candidate, Clean Energy',
    address: 'New Delhi, India',
    message: 'Interested in joint publications on waste-to-energy lifecycle assessment.',
    status: 'reviewed',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: 'reg_demo_3',
    name: 'Rohan Deshmukh',
    whatsapp: '+91 94231 87654',
    dob: `2000-${curMonth}-${curDay}`,
    email: 'rohan.deshmukh@example.com',
    occupation: 'Senior Undergraduate, Mechanical',
    address: 'Pune, Maharashtra',
    message: 'Requesting guidance for applying to European doctoral programs.',
    status: 'contacted',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  }
];

let memContacts = [
  {
    _id: 'query_demo_1',
    name: 'Prof. Ramesh Kulkarni',
    email: 'ramesh.k@nitk.edu.in',
    subject: 'Keynote / Guest Lecture Invitation',
    message: 'We would be honored to host you for a guest lecture on Sustainable Gasification Systems at our upcoming international conference.',
    status: 'unread',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'query_demo_2',
    name: 'Ananya Roy',
    email: 'ananya.roy@energycorp.com',
    subject: 'Waste-to-Energy Consulting',
    message: 'Our R&D team wants to consult regarding industrial municipal solid waste thermal conversion.',
    status: 'read',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

let memEmailLogs = [
  {
    _id: 'log_demo_1',
    recipients: ['aarav.sharma@example.com'],
    subject: 'Welcome to Dr. Vishwajeet Mentorship Portal',
    message: 'Your registration has been received.',
    sender: 'Dr. Vishwajeet | IIT Roorkee Desk',
    recipientCount: 1,
    status: 'sent',
    details: 'Initial dispatch',
    createdAt: new Date().toISOString(),
  }
];

export const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

export const dataStore = {
  async createRegistration(data) {
    if (isDbConnected()) {
      return await Registration.create(data);
    }
    const newDoc = {
      _id: 'reg_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      ...data,
      status: data.status || 'new',
      createdAt: new Date().toISOString(),
    };
    memRegistrations.unshift(newDoc);
    return newDoc;
  },

  async getRegistrations(filter = {}, search = '') {
    if (isDbConnected()) {
      let query = {};
      if (filter.status && filter.status !== 'all') query.status = filter.status;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { whatsapp: { $regex: search, $options: 'i' } },
          { occupation: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } },
        ];
      }
      return await Registration.find(query).sort({ createdAt: -1 }).lean();
    }

    let results = [...memRegistrations];
    if (filter.status && filter.status !== 'all') {
      results = results.filter(r => r.status === filter.status);
    }
    if (search) {
      const s = search.toLowerCase();
      results = results.filter(r => 
        (r.name && r.name.toLowerCase().includes(s)) ||
        (r.email && r.email.toLowerCase().includes(s)) ||
        (r.whatsapp && r.whatsapp.toLowerCase().includes(s)) ||
        (r.occupation && r.occupation.toLowerCase().includes(s)) ||
        (r.address && r.address.toLowerCase().includes(s))
      );
    }
    return results;
  },

  async updateRegistrationStatus(id, status) {
    if (isDbConnected()) {
      return await Registration.findByIdAndUpdate(id, { status }, { new: true });
    }
    const item = memRegistrations.find(r => r._id === id);
    if (item) {
      item.status = status;
      return item;
    }
    return null;
  },

  async deleteRegistration(id) {
    if (isDbConnected()) {
      return await Registration.findByIdAndDelete(id);
    }
    const index = memRegistrations.findIndex(r => r._id === id);
    if (index !== -1) {
      memRegistrations.splice(index, 1);
      return true;
    }
    return null;
  },

  async createContact(data) {
    if (isDbConnected()) {
      return await ContactQuery.create(data);
    }
    const newDoc = {
      _id: 'query_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      ...data,
      status: data.status || 'unread',
      createdAt: new Date().toISOString(),
    };
    memContacts.unshift(newDoc);
    return newDoc;
  },

  async getContacts(filter = {}, search = '') {
    if (isDbConnected()) {
      let query = {};
      if (filter.status && filter.status !== 'all') query.status = filter.status;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } },
        ];
      }
      return await ContactQuery.find(query).sort({ createdAt: -1 }).lean();
    }

    let results = [...memContacts];
    if (filter.status && filter.status !== 'all') {
      results = results.filter(c => c.status === filter.status);
    }
    if (search) {
      const s = search.toLowerCase();
      results = results.filter(c => 
        (c.name && c.name.toLowerCase().includes(s)) ||
        (c.email && c.email.toLowerCase().includes(s)) ||
        (c.subject && c.subject.toLowerCase().includes(s)) ||
        (c.message && c.message.toLowerCase().includes(s))
      );
    }
    return results;
  },

  async updateContactStatus(id, status) {
    if (isDbConnected()) {
      return await ContactQuery.findByIdAndUpdate(id, { status }, { new: true });
    }
    const item = memContacts.find(c => c._id === id);
    if (item) {
      item.status = status;
      return item;
    }
    return null;
  },

  async deleteContact(id) {
    if (isDbConnected()) {
      return await ContactQuery.findByIdAndDelete(id);
    }
    const index = memContacts.findIndex(c => c._id === id);
    if (index !== -1) {
      memContacts.splice(index, 1);
      return true;
    }
    return null;
  },

  async createEmailLog(data) {
    if (isDbConnected()) {
      return await EmailLog.create(data);
    }
    const newDoc = {
      _id: 'log_' + Date.now().toString(36),
      ...data,
      createdAt: new Date().toISOString(),
    };
    memEmailLogs.unshift(newDoc);
    return newDoc;
  },

  async getEmailLogs() {
    if (isDbConnected()) {
      return await EmailLog.find({}).sort({ createdAt: -1 }).limit(50).lean();
    }
    return memEmailLogs;
  },

  async getStats() {
    const allRegs = await this.getRegistrations();
    const allContacts = await this.getContacts();
    const allLogs = await this.getEmailLogs();

    const todayBirthdays = allRegs.filter(r => isBirthdayToday(r.dob));

    return {
      stats: {
        totalRegistrations: allRegs.length,
        newRegistrations: allRegs.filter(r => r.status === 'new').length,
        totalQueries: allContacts.length,
        unreadQueries: allContacts.filter(c => c.status === 'unread').length,
        totalEmailsSent: allLogs.length,
        todayBirthdaysCount: todayBirthdays.length,
      },
      todayBirthdays,
      recentRegistrations: allRegs.slice(0, 5),
      recentQueries: allContacts.slice(0, 5),
    };
  }
};

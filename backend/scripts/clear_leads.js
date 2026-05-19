require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const Lead = require('../models/Lead');
const Call = require('../models/Call');
const QD = require('../models/QD');
const Notification = require('../models/Notification');
const Incentive = require('../models/Incentive');

const dns = require('dns');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sbi_sales';

async function clearMockLeads() {
  try {
    try {
      dns.setServers(['8.8.8.8', '8.8.4.4']);
    } catch (dnsErr) {
      console.warn('⚠️ DNS warning:', dnsErr.message);
    }
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // Delete leads, calls, QD entries, notifications, and incentives
    const leadsResult = await Lead.deleteMany({});
    const callsResult = await Call.deleteMany({});
    const qdResult = await QD.deleteMany({});
    const notificationsResult = await Notification.deleteMany({});
    const incentivesResult = await Incentive.deleteMany({});

    console.log(`🗑️  Successfully cleared:`);
    console.log(`   - Leads: ${leadsResult.deletedCount}`);
    console.log(`   - Call Logs: ${callsResult.deletedCount}`);
    console.log(`   - QD Submissions: ${qdResult.deletedCount}`);
    console.log(`   - Notifications: ${notificationsResult.deletedCount}`);
    console.log(`   - Incentives: ${incentivesResult.deletedCount}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error clearing database:', err);
    process.exit(1);
  }
}

clearMockLeads();

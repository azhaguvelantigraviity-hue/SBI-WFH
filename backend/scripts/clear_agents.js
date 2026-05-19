require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const dns = require('dns');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sbi_sales';

async function clearSalesPersons() {
  try {
    try {
      dns.setServers(['8.8.8.8', '8.8.4.4']);
    } catch (dnsErr) {
      console.warn('⚠️ DNS warning:', dnsErr.message);
    }
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // Delete only users with role 'sales_person'
    const result = await User.deleteMany({ role: 'sales_person' });

    console.log(`🗑️  Successfully cleared ${result.deletedCount} sales persons from the database.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error clearing sales persons:', err);
    process.exit(1);
  }
}

clearSalesPersons();

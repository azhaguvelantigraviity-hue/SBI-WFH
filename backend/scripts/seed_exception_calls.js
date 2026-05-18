const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const User = require('../models/User');
const Call = require('../models/Call');
require('dotenv').config({ path: '../.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sbi_sales');
    console.log('Connected to database.');

    const arjun = await User.findOne({ email: 'arjun@sbi.com' });
    const ravi = await User.findOne({ email: 'ravi@sbi.com' });

    if (!arjun || !ravi) {
      console.log('Users not found.');
      process.exit(1);
    }

    // Fetch leads
    const leads = await Lead.find({});
    console.log(`Found ${leads.length} leads in database.`);

    if (leads.length >= 4) {
      // Clear existing exception/followup calls to keep it clean
      await Call.deleteMany({ status: { $in: ['exception', 'follow_up'] } });
      console.log('Cleared old flagged calls.');

      // 1. Create an exception call for lead 1
      const l1 = leads[0];
      await Call.create({
        lead: l1._id,
        agent: arjun._id,
        customer_name: l1.customer_name,
        mobile: l1.mobile,
        status: 'exception',
        duration: '1:45',
        duration_seconds: 105,
        lead_status_after: 'in_progress',
        notes: 'Customer reports PAN is locked or incorrect; requested manager override.',
        called_at: new Date(Date.now() - 15 * 60000), // 15 mins ago
      });
      console.log(`Seeded Exception Call for Lead ${l1.lead_number} under Arjun.`);

      // 2. Create a follow-up call for lead 2
      const l2 = leads[1];
      await Call.create({
        lead: l2._id,
        agent: arjun._id,
        customer_name: l2.customer_name,
        mobile: l2.mobile,
        status: 'follow_up',
        duration: '3:10',
        duration_seconds: 190,
        lead_status_after: 'in_progress',
        notes: 'Customer busy, requested callback on Wednesday morning at 10 AM.',
        called_at: new Date(Date.now() - 30 * 60000), // 30 mins ago
      });
      console.log(`Seeded Follow-up Call for Lead ${l2.lead_number} under Arjun.`);

      // 3. Create another exception call for lead 3 under Ravi
      const l3 = leads[2];
      await Call.create({
        lead: l3._id,
        agent: ravi._id,
        customer_name: l3.customer_name,
        mobile: l3.mobile,
        status: 'exception',
        duration: '0:50',
        duration_seconds: 50,
        lead_status_after: 'not_eligible',
        notes: 'Wrong Pincode / customer located outside whitelist region.',
        called_at: new Date(Date.now() - 60 * 60000), // 1 hour ago
      });
      console.log(`Seeded Exception Call for Lead ${l3.lead_number} under Ravi.`);
    }

    console.log('Call seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding calls:', err);
    process.exit(1);
  }
}

run();

const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const User = require('../models/User');
const Notification = require('../models/Notification');
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

    // Clear existing notifications
    await Notification.deleteMany({});
    console.log('Cleared old notifications.');

    // Fetch leads
    const leads = await Lead.find({});
    console.log(`Found ${leads.length} leads.`);

    if (leads.length >= 2) {
      // Assign lead 1 to Arjun
      const l1 = leads[0];
      await Notification.create({
        user: arjun._id,
        title: 'New Lead Assigned',
        message: `Lead ${l1.lead_number} (${l1.customer_name}) has been assigned to you.`,
        type: 'lead_assigned',
      });
      console.log(`Created lead assignment notification for Arjun on lead ${l1.lead_number}.`);

      // Assign lead 2 to Arjun
      const l2 = leads[1];
      await Notification.create({
        user: arjun._id,
        title: 'New Lead Assigned',
        message: `Lead ${l2.lead_number} (${l2.customer_name}) has been assigned to you.`,
        type: 'lead_assigned',
      });
      console.log(`Created second lead assignment notification for Arjun on lead ${l2.lead_number}.`);

      // Assign a lead to Ravi
      const l3 = leads[2] || leads[0];
      await Notification.create({
        user: ravi._id,
        title: 'New Lead Assigned',
        message: `Lead ${l3.lead_number} (${l3.customer_name}) has been assigned to you.`,
        type: 'lead_assigned',
      });
      console.log(`Created lead assignment notification for Ravi on lead ${l3.lead_number}.`);
    }

    console.log('Notification seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding notifications:', err);
    process.exit(1);
  }
}

run();

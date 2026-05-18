const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

async function fix() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sbi_sales');
    
    const arjun = await User.findOne({ email: 'arjun@sbi.com' });
    if (!arjun) {
      console.log('Arjun not found');
      process.exit(1);
    }

    // Find all leads and assign first 5 of them to Arjun as eligible
    const leads = await Lead.find({}).limit(5);
    console.log(`Found ${leads.length} leads in database.`);
    
    for (const lead of leads) {
      lead.assigned_to = arjun._id;
      lead.status = 'eligible';
      await lead.save();
      console.log(`Updated Lead ${lead.lead_number} (${lead.customer_name}) to eligible and assigned to Arjun.`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fix();

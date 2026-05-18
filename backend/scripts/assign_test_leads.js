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

    // Assign L0006 and L0007 to Arjun and set status to 'new'
    const res = await Lead.updateMany(
      { lead_number: { $in: ['L0006', 'L0007'] } },
      { assigned_to: arjun._id, status: 'new' }
    );
    
    console.log('Update result:', res);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fix();

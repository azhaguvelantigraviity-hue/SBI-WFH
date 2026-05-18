const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

const TEST_LEADS = [
  { customer_name: 'Priya Sharma',    mobile: '9876543210', pincode: '600001', state: 'Tamil Nadu',   district: 'Chennai' },
  { customer_name: 'Karthik Raj',     mobile: '9876543211', pincode: '400001', state: 'Maharashtra',  district: 'Mumbai' },
  { customer_name: 'Meera Nair',      mobile: '9876543212', pincode: '110001', state: 'Delhi',        district: 'New Delhi' },
  { customer_name: 'Suresh Babu',     mobile: '9876543213', pincode: '500001', state: 'Telangana',    district: 'Hyderabad' },
  { customer_name: 'Lakshmi Devi',    mobile: '9876543214', pincode: '560001', state: 'Karnataka',    district: 'Bengaluru' },
  { customer_name: 'Venkat Reddy',    mobile: '9876543215', pincode: '682001', state: 'Kerala',       district: 'Kochi' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sbi_sales');

    const arjun = await User.findOne({ email: 'arjun@sbi.com' });
    if (!arjun) {
      console.log('Arjun (arjun@sbi.com) not found!');
      process.exit(1);
    }
    console.log(`Found Arjun: ${arjun.name} (${arjun._id})`);

    let created = 0;
    for (const data of TEST_LEADS) {
      // Check if lead with same mobile already exists
      const existing = await Lead.findOne({ mobile: data.mobile });
      if (existing) {
        console.log(`Lead for ${data.customer_name} already exists (${existing.lead_number}), skipping.`);
        continue;
      }
      const lead = new Lead({
        ...data,
        status: 'assigned',
        assigned_to: arjun._id,
        source: 'manual',
      });
      await lead.save();
      console.log(`Created lead ${lead.lead_number} — ${lead.customer_name} (assigned to Arjun, status: assigned)`);
      created++;
    }

    console.log(`\nDone! Created ${created} new leads for Arjun in Verification dropdown.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

seed();

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Lead = require('../models/Lead');

const leadsData = [
  { customer_name: 'Rajesh Sharma', mobile: '9812345678', pincode: '600001', status: 'assigned', source: 'upload' },
  { customer_name: 'Amit Patel', mobile: '8812345678', pincode: '400001', status: 'assigned', source: 'manual' },
  { customer_name: 'Siddharth Roy', mobile: '7812345678', pincode: '110001', status: 'assigned', source: 'upload' },
  { customer_name: 'Vikram Singh', mobile: '9512345678', pincode: '500001', status: 'in_progress', source: 'upload' },
  { customer_name: 'Nikhil Nair', mobile: '6512345678', pincode: '560001', status: 'eligible', source: 'manual' }
];

async function seedLeads() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/sbi_sales';
  console.log('Connecting to database:', uri);
  await mongoose.connect(uri);
  console.log('Connected!');

  const arjun = await User.findOne({ email: 'arjun@sbi.com' });
  const admin = await User.findOne({ role: 'admin' });

  if (!arjun) {
    console.error('❌ Error: Sales Person Arjun Kumar not found! Please run node scripts/seed.js first.');
    process.exit(1);
  }

  // Clear existing leads first to ensure a perfectly clean test state
  await Lead.deleteMany({});
  console.log('🗑️ Cleared previous leads.');

  const createdLeads = [];
  for (const data of leadsData) {
    const lead = await Lead.create({
      ...data,
      assigned_to: arjun._id,
      status_history: [
        { status: 'new', changed_by: admin ? admin._id : arjun._id, note: 'Lead created.' },
        { status: data.status, changed_by: admin ? admin._id : arjun._id, note: 'Assigned to Arjun Kumar.' }
      ]
    });
    createdLeads.push(lead);
  }

  console.log(`\n✅ Successfully seeded ${createdLeads.length} leads assigned to Arjun Kumar!`);
  createdLeads.forEach(l => console.log(`   - ${l.customer_name} • ${l.mobile} (${l.status})`));

  await mongoose.disconnect();
  console.log('\nDisconnected.');
}

seedLeads().catch(err => {
  console.error(err);
  process.exit(1);
});

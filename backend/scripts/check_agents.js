const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

async function checkAgents() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sbi_sales');
    const agents = await User.find({ role: 'sales_person' });
    console.log('Total Sales Persons:', agents.length);
    agents.forEach(a => {
      console.log(`- ${a.name} (${a.employee_id}), Status: ${a.status}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAgents();

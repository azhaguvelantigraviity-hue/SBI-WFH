const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

async function checkAllUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sbi_sales');
    const users = await User.find({});
    console.log('Total Users:', users.length);
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}), EmployeeID: ${u.employee_id}, Mobile: ${u.mobile}, Role: ${u.role}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAllUsers();

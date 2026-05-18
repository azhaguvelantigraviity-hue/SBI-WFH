const axios = require('axios');

async function testProtected() {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@sbi.com',
      password: 'Admin@123'
    });
    const token = loginRes.data.token;
    console.log('Login success, token obtained.');
    
    const usersRes = await axios.get('http://localhost:5000/api/users?role=sales_person', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Protected call success:', usersRes.data.success);
  } catch (err) {
    console.error('Error:', err.response?.status, err.response?.data || err.message);
  }
}

testProtected();

const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@sbi.com',
      password: 'wrongpass'
    });
    console.log('Login success:', res.data);
  } catch (err) {
    console.error('Login failed:', err.response?.data || err.message);
  }
}

testLogin();

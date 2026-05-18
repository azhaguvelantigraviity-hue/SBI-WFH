/**
 * Seed Script — run with: node scripts/seed.js
 * Populates MongoDB with initial admin, sales persons, leads, calls, QD, and incentives.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Lead = require('../models/Lead');
const Call = require('../models/Call');
const QD = require('../models/QD');
const Incentive = require('../models/Incentive');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sbi_sales';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ─── Clear existing data ──────────────────────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      Lead.deleteMany({}),
      Call.deleteMany({}),
      QD.deleteMany({}),
      Incentive.deleteMany({}),
    ]);
    console.log('🗑️  Cleared all collections');

    // ─── Create Users ─────────────────────────────────────────────────────────
    const users = await User.create([
      { employee_id: 'ADM001', name: 'System Admin', email: 'admin@sbi.com', password: 'Admin@123', mobile: '9999999999', role: 'admin', status: 'active' },
      { employee_id: 'EMP001', name: 'Arjun Kumar', email: 'arjun@sbi.com', password: 'Sales@123', mobile: '9876543210', role: 'sales_person', status: 'active' },
      { employee_id: 'EMP002', name: 'Priya Sharma', email: 'priya@sbi.com', password: 'Sales@123', mobile: '8765432109', role: 'sales_person', status: 'active' },
      { employee_id: 'EMP003', name: 'Ravi Patel', email: 'ravi@sbi.com', password: 'Sales@123', mobile: '7654321098', role: 'sales_person', status: 'active' },
      { employee_id: 'EMP004', name: 'Meena Nair', email: 'meena@sbi.com', password: 'Sales@123', mobile: '9543210987', role: 'sales_person', status: 'active' },
      { employee_id: 'EMP005', name: 'Kiran Raj', email: 'kiran@sbi.com', password: 'Sales@123', mobile: '6543219876', role: 'sales_person', status: 'suspended' },
      { employee_id: 'EMP006', name: 'Deepa Rao', email: 'deepa@sbi.com', password: 'Sales@123', mobile: '9876501234', role: 'sales_person', status: 'active' },
    ]);
    console.log(`👤 Created ${users.length} users`);

    const [admin, arjun, priya, ravi, meena, kiran, deepa] = users;

    // ─── Create Leads ─────────────────────────────────────────────────────────
    const leadsData = [
      { customer_name: 'Ravi Kumar',    mobile: '9876543210', pincode: '600001', status: 'eligible',     assigned_to: arjun._id, source: 'upload', status_history: [{ status: 'new', changed_by: admin._id }, { status: 'assigned', changed_by: admin._id }, { status: 'eligible', changed_by: arjun._id }] },
      { customer_name: 'Sunita Devi',   mobile: '8765432109', pincode: '400001', status: 'qd_submitted', assigned_to: priya._id, source: 'upload', status_history: [{ status: 'new', changed_by: admin._id }, { status: 'assigned', changed_by: admin._id }, { status: 'qd_submitted', changed_by: priya._id }] },
      { customer_name: 'Mohan Lal',     mobile: '7654321098', pincode: '110001', status: 'not_eligible', assigned_to: ravi._id,  source: 'upload', status_history: [{ status: 'new', changed_by: admin._id }, { status: 'not_eligible', changed_by: ravi._id }] },
      { customer_name: 'Anjali Singh',  mobile: '9543210987', pincode: '500001', status: 'dispatched',   assigned_to: arjun._id, source: 'upload', status_history: [{ status: 'new', changed_by: admin._id }, { status: 'dispatched', changed_by: admin._id }] },
      { customer_name: 'Kiran Bala',    mobile: '6543219876', pincode: '560001', status: 'in_progress',  assigned_to: meena._id, source: 'manual', status_history: [{ status: 'new', changed_by: admin._id }, { status: 'in_progress', changed_by: meena._id }] },
      { customer_name: 'Deepa Rao',     mobile: '9876501234', pincode: '600002', status: 'new',          assigned_to: null,       source: 'manual', status_history: [{ status: 'new', changed_by: admin._id }] },
      { customer_name: 'Suresh Menon',  mobile: '8901234567', pincode: '682001', status: 'new',          assigned_to: null,       source: 'upload', status_history: [{ status: 'new', changed_by: admin._id }] },
      { customer_name: 'Radha K.',      mobile: '7890123456', pincode: '700001', status: 'assigned',     assigned_to: priya._id, source: 'upload', status_history: [{ status: 'new', changed_by: admin._id }, { status: 'assigned', changed_by: admin._id }] },
    ];

    const leads = [];
    for (const data of leadsData) {
      const lead = await Lead.create(data);
      leads.push(lead);
    }
    console.log(`📋 Created ${leads.length} leads`);

    // ─── Create Calls ─────────────────────────────────────────────────────────
    const calls = await Call.create([
      { lead: leads[0]._id, agent: arjun._id, customer_name: 'Ravi Kumar',   mobile: '9876543210', status: 'connected',     duration: '5:24', duration_seconds: 324, lead_status_after: 'eligible' },
      { lead: leads[1]._id, agent: priya._id, customer_name: 'Sunita Devi',  mobile: '8765432109', status: 'connected',     duration: '8:02', duration_seconds: 482, lead_status_after: 'qd_submitted' },
      { lead: leads[2]._id, agent: ravi._id,  customer_name: 'Mohan Lal',    mobile: '7654321098', status: 'connected',     duration: '2:11', duration_seconds: 131, lead_status_after: 'not_eligible' },
      { lead: leads[4]._id, agent: meena._id, customer_name: 'Kiran Bala',   mobile: '6543219876', status: 'not_connected', duration: '—',    duration_seconds: 0,   lead_status_after: 'in_progress' },
      { lead: leads[3]._id, agent: arjun._id, customer_name: 'Anjali Singh', mobile: '9543210987', status: 'connected',     duration: '6:18', duration_seconds: 378, lead_status_after: 'dispatched' },
    ]);
    console.log(`📞 Created ${calls.length} call logs`);

    // ─── Create QDs ───────────────────────────────────────────────────────────
    const qds = await QD.create([
      { lead: leads[1]._id, agent: priya._id, customer_name: 'Sunita Devi',  mobile: '8765432109', employment_type: 'salaried',      status: 'pending',    monthly_income: 45000 },
      { lead: leads[0]._id, agent: arjun._id, customer_name: 'Ravi Kumar',   mobile: '9876543210', employment_type: 'self_employed',  status: 'pending',    annual_income: 600000 },
      { lead: leads[3]._id, agent: arjun._id, customer_name: 'Anjali Singh', mobile: '9543210987', employment_type: 'salaried',      status: 'dispatched', monthly_income: 52000, dispatched_at: new Date() },
    ]);
    console.log(`📄 Created ${qds.length} QD records`);

    // ─── Create Incentives ────────────────────────────────────────────────────
    const incData = [
      { agent: arjun._id, month: '2025-06', month_label: 'June 2025', dispatched_count: 28, status: 'paid', paid_at: new Date(), paid_by: admin._id },
      { agent: priya._id, month: '2025-06', month_label: 'June 2025', dispatched_count: 22, status: 'paid', paid_at: new Date(), paid_by: admin._id },
      { agent: ravi._id,  month: '2025-06', month_label: 'June 2025', dispatched_count: 19, status: 'pending' },
      { agent: meena._id, month: '2025-06', month_label: 'June 2025', dispatched_count: 14, status: 'pending' },
      { agent: kiran._id, month: '2025-06', month_label: 'June 2025', dispatched_count: 8,  status: 'paid', paid_at: new Date(), paid_by: admin._id },
      { agent: deepa._id, month: '2025-06', month_label: 'June 2025', dispatched_count: 11, status: 'pending' },
    ];
    const incentives = await Incentive.create(incData);
    console.log(`💰 Created ${incentives.length} incentive records`);

    console.log('\n✅ Seed complete!\n');
    console.log('─────────────────────────────────────────');
    console.log('Login credentials:');
    console.log('  Admin:  admin@sbi.com   /  Admin@123');
    console.log('  Agent:  arjun@sbi.com   /  Sales@123');
    console.log('─────────────────────────────────────────\n');

  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();

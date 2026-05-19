const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  try {
    // Set DNS servers to Google Public DNS to resolve MongoDB Atlas SRV records
    try {
      dns.setServers(['8.8.8.8', '8.8.4.4']);
      console.log('🌐 Configured Google DNS for Atlas SRV resolution');
    } catch (dnsErr) {
      console.warn('⚠️ Failed to configure public DNS servers:', dnsErr.message);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // Self-healing migration for call_status
    try {
      const Lead = require('../models/Lead');
      const Call = require('../models/Call');
      
      const leadsWithoutCallStatus = await Lead.find({ call_status: { $exists: false } });
      if (leadsWithoutCallStatus.length > 0) {
        console.log(`🔧 Running call_status self-healing migration for ${leadsWithoutCallStatus.length} leads...`);
        let migratedCount = 0;
        for (const lead of leadsWithoutCallStatus) {
          const latestCall = await Call.findOne({ lead: lead._id }).sort({ called_at: -1 });
          lead.call_status = latestCall ? latestCall.status : 'pending';
          await lead.save();
          migratedCount++;
        }
        console.log(`✅ Migrated ${migratedCount} leads successfully.`);
      }
    } catch (migErr) {
      console.error('⚠️ Self-healing migration error:', migErr);
    }

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.error('   Make sure MongoDB is running: mongod');
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed (app terminated)');
  process.exit(0);
});

module.exports = connectDB;

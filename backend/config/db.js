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
      maxPoolSize: 10,          // allow up to 10 concurrent connections
      bufferCommands: false,    // fail fast instead of silently queuing
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // Self-healing migration: only runs if there are leads missing call_status
    try {
      const Lead = require('../models/Lead');
      const Call = require('../models/Call');

      // Quick count check — avoids loading all leads on every boot
      const missingCount = await Lead.countDocuments({ call_status: { $exists: false } });
      if (missingCount > 0) {
        console.log(`🔧 Running call_status self-healing migration for ${missingCount} leads...`);
        const leadsWithoutCallStatus = await Lead.find({ call_status: { $exists: false } }, '_id');
        const bulkOps = [];
        for (const lead of leadsWithoutCallStatus) {
          const latestCall = await Call.findOne({ lead: lead._id }, 'status').sort({ called_at: -1 }).lean();
          bulkOps.push({
            updateOne: {
              filter: { _id: lead._id },
              update: { $set: { call_status: latestCall ? latestCall.status : 'pending' } },
            },
          });
        }
        if (bulkOps.length > 0) {
          await Lead.bulkWrite(bulkOps);
          console.log(`✅ Migrated ${bulkOps.length} leads successfully.`);
        }
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

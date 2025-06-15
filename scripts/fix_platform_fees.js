// scripts/fix_platform_fees.js
const mongoose = require('mongoose');
require('dotenv').config();

// Define Order schema
const OrderSchema = new mongoose.Schema({
  customerClerkId: String,
  products: Array,
  vendorOrders: [{
    vendorId: mongoose.Schema.Types.ObjectId,
    products: Array,
    subtotal: Number,
    commission: Number,
    vendorEarnings: Number,
    status: String
  }],
  shippingAddress: Object,
  shippingRate: String,
  totalAmount: Number,
  platformFee: Number,
  status: String,
  paymentStatus: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

async function fixPlatformFees() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all orders
    const orders = await Order.find();
    console.log(`Found ${orders.length} orders to process`);
    
    let updatedCount = 0;
    
    for (const order of orders) {
      // Recalculate platformFee based on the 7% commission rate
      const newCommissionRate = 0.07; // 7%
      
      // Calculate new commissions for each vendor order
      let totalNewCommission = 0;
      
      for (const vendorOrder of order.vendorOrders) {
        const subtotal = vendorOrder.subtotal;
        const newCommission = subtotal * newCommissionRate;
        
        // Update vendor order with new commission and earnings
        vendorOrder.commission = parseFloat(newCommission.toFixed(2));
        vendorOrder.vendorEarnings = parseFloat((subtotal - newCommission).toFixed(2));
        
        totalNewCommission += newCommission;
      }
      
      // Update order platformFee
      const oldPlatformFee = order.platformFee;
      order.platformFee = parseFloat(totalNewCommission.toFixed(2));
      
      // Only update if the fee has changed
      if (oldPlatformFee !== order.platformFee) {
        await order.save();
        console.log(`Updated order ${order._id}: Platform fee changed from $${oldPlatformFee.toFixed(2)} to $${order.platformFee.toFixed(2)}`);
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} orders with the new 7% platform fee.`);
  } catch (error) {
    console.error('Error updating platform fees:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
fixPlatformFees();

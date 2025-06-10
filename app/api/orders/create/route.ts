import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import Vendor from "@/lib/models/Vendor";
import Customer from "@/lib/models/Customer";

export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    const { 
      customerClerkId, 
      customerEmail, 
      customerName, 
      cartItems, 
      shippingDetails, 
      totalAmount 
    } = await req.json();

    // Create or update customer record
    let customer = await Customer.findOne({ clerkId: customerClerkId });
    if (!customer) {
      customer = await Customer.create({
        clerkId: customerClerkId,
        email: customerEmail,
        name: customerName,
        orders: []
      });
    }

    // Process cart items and group by vendor - NO MAPS
    const vendorOrders: any[] = [];
    const orderProducts: any[] = [];
    const vendorUpdates: { vendorId: string; earnings: number }[] = [];

    for (const cartItem of cartItems) {
      const product = await Product.findById(cartItem.item._id).populate('vendor');
      
      if (!product) continue;

      const vendorId = product.vendor._id.toString();
      const orderItem = {
        product: product._id,
        vendor: vendorId,
        color: cartItem.color,
        size: cartItem.size,
        quantity: cartItem.quantity,
        priceAtTime: product.price
      };

      orderProducts.push(orderItem);

      // Find existing vendor order or create new one
      let existingVendorOrder = null;
      for (let i = 0; i < vendorOrders.length; i++) {
        if (vendorOrders[i].vendor === vendorId) {
          existingVendorOrder = vendorOrders[i];
          break;
        }
      }

      if (!existingVendorOrder) {
        existingVendorOrder = {
          vendor: vendorId,
          products: [],
          subtotal: 0,
          commission: 0,
          vendorEarnings: 0,
          status: "pending"
        };
        vendorOrders.push(existingVendorOrder);
      }

      // Add product to vendor order
      existingVendorOrder.products.push({
        product: product._id,
        color: cartItem.color,
        size: cartItem.size,
        quantity: cartItem.quantity,
        priceAtTime: product.price
      });

      const itemTotal = product.price * cartItem.quantity;
      existingVendorOrder.subtotal += itemTotal;
      
      // Calculate commission (10% platform fee)
      const commissionRate = 0.10;
      existingVendorOrder.commission += itemTotal * commissionRate;
      existingVendorOrder.vendorEarnings += itemTotal * (1 - commissionRate);
    }

    // Create the order
    const newOrder = await Order.create({
      customerClerkId,
      products: orderProducts,
      vendorOrders: vendorOrders,
      shippingAddress: {
        street: shippingDetails.address.street,
        city: shippingDetails.address.city,
        state: shippingDetails.address.state,
        postalCode: shippingDetails.address.postalCode,
        country: shippingDetails.address.country
      },
      totalAmount,
      platformFee: totalAmount * 0.10,
      status: "pending",
      paymentStatus: "pending",
      createdAt: new Date()
    });

    // Update customer's orders
    customer.orders.push(newOrder._id);
    await customer.save();

    // Update vendor revenue - simple loop
    for (let i = 0; i < vendorOrders.length; i++) {
      const vendorOrder = vendorOrders[i];
      await Vendor.findByIdAndUpdate(vendorOrder.vendor, {
        $inc: { 
          totalRevenue: vendorOrder.vendorEarnings,
          totalOrders: 1
        }
      });
    }

    return NextResponse.json(newOrder, { 
      status: 201,
      headers: {
        "Access-Control-Allow-Origin": `${process.env.ECOMMERCE_STORE_URL || 'http://localhost:3001'}`,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export const OPTIONS = async () => {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": `${process.env.ECOMMERCE_STORE_URL || 'http://localhost:3001'}`,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
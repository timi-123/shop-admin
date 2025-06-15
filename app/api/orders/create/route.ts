// app/api/orders/create/route.ts - ADMIN
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

    // Validate stock availability before processing order
    const stockValidationResults = [];
    const productsToUpdate = [];

    for (const cartItem of cartItems) {
      const product = await Product.findById(cartItem.item._id).populate('vendor');
      
      if (!product) {
        return new NextResponse(
          JSON.stringify({ error: `Product ${cartItem.item.title} not found` }), 
          { status: 400 }
        );
      }

      // Check stock availability
      const currentStock = product.stockQuantity || 0;
      const requestedQuantity = cartItem.quantity;

      if (currentStock < requestedQuantity) {
        return new NextResponse(
          JSON.stringify({ 
            error: `Insufficient stock for ${product.title}. Available: ${currentStock}, Requested: ${requestedQuantity}` 
          }), 
          { status: 400 }
        );
      }

      stockValidationResults.push({
        productId: product._id,
        currentStock,
        requestedQuantity,
        newStock: currentStock - requestedQuantity
      });

      productsToUpdate.push({
        productId: product._id,
        newStock: currentStock - requestedQuantity
      });
    }

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

    // Process cart items and group by vendor
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

      // Find or create vendor order
      let vendorOrder = vendorOrders.find(vo => vo.vendor.toString() === vendorId);
      
      if (!vendorOrder) {        vendorOrder = {
          vendor: vendorId,
          products: [],
          subtotal: 0,
          commission: 0,
          vendorEarnings: 0,
          status: "order_received", // Changed from "pending" to match the enum in the Order model
          statusHistory: [{
            status: "order_received",
            updatedAt: new Date(),
            updatedBy: "system",
            customerMessage: "Order received by vendor"
          }],
          customerStatusMessage: "Vendor has seen your order",
          lastStatusUpdate: new Date()
        };
        vendorOrders.push(vendorOrder);
      }

      vendorOrder.products.push({
        product: product._id,
        color: cartItem.color,
        size: cartItem.size,
        quantity: cartItem.quantity,
        priceAtTime: product.price
      });

      const itemTotal = product.price * cartItem.quantity;      vendorOrder.subtotal += itemTotal;      // Calculate commission (platform fee)
      // For a $18.59 order, a fee of $1.30 is approximately 7%
      const commissionRate = 0.07;
      const commission = itemTotal * commissionRate;
      vendorOrder.commission += commission;
      vendorOrder.vendorEarnings += (itemTotal - commission);

      // Track vendor earnings for updates
      let vendorUpdate = vendorUpdates.find(vu => vu.vendorId === vendorId);
      if (!vendorUpdate) {
        vendorUpdate = { vendorId, earnings: 0 };
        vendorUpdates.push(vendorUpdate);
      }
      vendorUpdate.earnings += (itemTotal - commission);
    }

    // Calculate platform fee (total commission)
    const platformFee = vendorOrders.reduce((total, vo) => total + vo.commission, 0);

    // Create the order
    const newOrder = await Order.create({
      customerClerkId,
      products: orderProducts,
      vendorOrders,
      shippingAddress: shippingDetails.address,
      shippingRate: "standard",
      totalAmount,
      platformFee,
      status: "pending",
      paymentStatus: "paid", // Assuming payment is already processed
      createdAt: new Date()
    });

    // Update customer orders
    customer.orders.push(newOrder._id);
    await customer.save();

    // Update product stock quantities
    for (const update of productsToUpdate) {
      await Product.findByIdAndUpdate(
        update.productId,
        { 
          stockQuantity: update.newStock,
          updatedAt: new Date()
        }
      );
    }

    // Populate the order for response
    const populatedOrder = await Order.findById(newOrder._id)
      .populate({
        path: "products.product",
        model: Product,
        select: "title media price stockQuantity"
      })
      .populate({
        path: "vendorOrders.vendor",
        model: Vendor,
        select: "businessName email"
      });

    return NextResponse.json({
      success: true,
      order: populatedOrder,
      stockUpdates: stockValidationResults,
      message: "Order created successfully and stock updated"
    }, { status: 201 });

  } catch (error) {
    console.error("[ORDER_CREATE]", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to create order" }), 
      { status: 500 }
    );
  }
}
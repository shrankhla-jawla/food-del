// orderController.js — replaces Stripe with Razorpay
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";

// Init Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const DELIVERY_CHARGE = 50; // ₹50 flat delivery charge

// ─── Place Order & Create Razorpay Order ────────────────────────────────────
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    // 1. Save order in DB with payment pending
    const newOrder = new orderModel({
      userId,
      items,
      address,
      amount: amount + DELIVERY_CHARGE,
      payment: false,
    });
    await newOrder.save();

    // 2. Clear user cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // 3. Create Razorpay order (amount in paise)
    const razorpayOrder = await razorpay.orders.create({
      amount: (amount + DELIVERY_CHARGE) * 100, // convert ₹ to paise
      currency: "INR",
      receipt: newOrder._id.toString(),
    });

    res.json({
      success: true,
      orderId: razorpayOrder.id,       // sent to frontend for checkout
      dbOrderId: newOrder._id,         // our DB order id
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // safe to send to frontend
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error placing order" });
  }
};

// ─── Verify Payment After Razorpay Checkout ─────────────────────────────────
const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    dbOrderId,
  } = req.body;

  try {
    // 1. Verify signature using HMAC SHA256
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      // 2. Mark order as paid in DB
      await orderModel.findByIdAndUpdate(dbOrderId, { payment: true });
      res.json({ success: true, message: "Payment verified" });
    } else {
      // 3. Payment tampered — delete order
      await orderModel.findByIdAndDelete(dbOrderId);
      res.json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error verifying payment" });
  }
};

// ─── List All Orders (Admin) ─────────────────────────────────────────────────
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error fetching orders" });
  }
};

// ─── User Orders ─────────────────────────────────────────────────────────────
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error fetching orders" });
  }
};

// ─── Update Order Status (Admin) ─────────────────────────────────────────────
const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    });
    res.json({ success: true, message: "Status updated" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error updating status" });
  }
};

export { placeOrder, verifyPayment, listOrders, userOrders, updateStatus };
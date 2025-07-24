import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Razorpay from "razorpay"


//Place order COD :/api/order/cod
export const placeOrderCod=async(req,res)=>{
    try {
        const {userId,items,address}=req.body;
        if(!address||items.length===0){
            return res.json({success:false,message:"Invalid data"})
        }
        //Calculate Amount Using Items
        let amount=await items.reduce(async(sum,item)=>{
            const product=await Product.findById(item.product);
            return (await sum)+product.offerPrice*item.quantity
        },0)

        //add tax charge(2%)
        amount+=Math.floor(amount*0.02);

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType:"COD",
        })
        return res.json({success:true,message:"Order Placed Successfully"})
    } catch (error) {
        console.log(error.message)
        return res.json({success:false,message:error.message})
        
    }
}

//Get Orders by User Id:/api/order/user
export const getUserOrders=async(req,res)=>{
    try {
        // const {userId}=req.body
        const userId=req.user.userId
        const orders=await Order.find({
            userId,
            $or:[{paymentType:"COD"},{isPaid:true}]
        }).populate("items.product address").sort({createdAt:-1})
        res.json({success:true,orders})
    } catch (error) {
        console.log(error.message)
        return res.json({success:false,message:error.message})
        
    }
}

//Get all orders (for seller/admin):/api/order/seller
export const getAllOrders=async(req,res)=>{
    try {
         const orders=await Order.find({
            $or:[{paymentType:"COD"},{isPaid:true}]
        }).populate("items.product address").sort({createdAt:-1})
        res.json({success:true,orders})
    } catch (error) {
         console.log(error.message)
        return res.json({success:false,message:error.message})
        
    }
}



console.log("Razorpay Key:", process.env.RAZORPAY_API_KEY);
console.log("Razorpay Secret:", process.env.RAZORPAY_API_SECRET);




export const placeOrderRazoryPay = async (req, res) => {
  try {
    const { userId, items, address } = req.body;

    if (!userId || !address || !Array.isArray(items) || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    let totalAmount = 0;

    // Fetch products and calculate amount
    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.json({ success: false, message: "Product not found: " + item.product });
      }
      totalAmount += product.offerPrice * item.quantity;
    }

    // Add ~2% tax or processing fee
    const finalAmount = Math.floor(totalAmount + (0.02 * totalAmount));

    // Create Order (unpaid)
    const order = await Order.create({
      userId,
      items,
      address,
      amount: finalAmount,
      paymentType: "Online",
      isPaid: false,
    });

    // Create Razorpay Order
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_API_KEY,
      key_secret: process.env.RAZORPAY_API_SECRET,
    });

    const razorpayOrder = await instance.orders.create({
      amount: finalAmount * 100, // INR paise
      currency: "INR",
      receipt: `order_rcptid_${order._id}`,
      notes: {
        orderId: order._id.toString(),
        userId,
      }
    });

    return res.json({
      success: true,
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_API_KEY
    });

  } catch (err) {
    console.error("❌ error in Razorpay order:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

import crypto from "crypto";


export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    console.log("🛡️ Verifying Razorpay Payment:", req.body);

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.json({ success: false, message: "Missing Razorpay fields!" });
    }

    // 1. Create digest
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // 2. Compare
    if (expectedSignature !== razorpay_signature) {
      return res.json({ success: false, message: "Invalid payment signature!" });
    }

    // 3. Mark the order as paid
    const order = await Order.findByIdAndUpdate(orderId, {
      isPaid: true,
      status: "Paid",
      paymentType: "Online"
    }, { new: true });

    if (!order) {
      return res.json({ success: false, message: "Order not found!" });
    }

    return res.json({ success: true, message: "Payment verified!", order });
  } catch (err) {
    console.error("❌ Razorpay Verify Error:", err.message);
    return res.status(500).json({ success: false, message: "Verification error" });
  }
};


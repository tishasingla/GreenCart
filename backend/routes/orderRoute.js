import express from 'express'
import authUser from '../middlewares/authUser.js'
import { getAllOrders, getUserOrders, placeOrderCod, placeOrderRazoryPay, verifyRazorpayPayment } from '../controllers/orderController.js'
import authSeller from '../middlewares/authSeller.js'
const orderRouter=express.Router()

orderRouter.post('/cod',authUser,placeOrderCod)
orderRouter.get('/user',authUser,getUserOrders)
orderRouter.post('/razorpay',authUser,placeOrderRazoryPay)
orderRouter.post('/verify',authUser,verifyRazorpayPayment)
orderRouter.get('/seller',authSeller,getAllOrders)

export default orderRouter;
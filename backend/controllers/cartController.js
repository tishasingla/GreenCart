

//update User CartData: /api/cart/update

import User from "../models/User.js"

export const updateCart=async(req,res)=>{
   try {
   //   const {userId,cartItems}=req.body //we will not send the id in body it comes form user middleware
   const userId=req.user.userId
   const {cartItems}=req.body
    await User.findByIdAndUpdate(userId,{cartItems})
    res.json({success:true,message:"cart updated"})
   } catch (error) {
    console.log(error.message)
    res.json({success:false,message:error.message})
   }
}

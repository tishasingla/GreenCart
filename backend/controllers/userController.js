import User from "../models/User.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'




//Register User: /api/user/register
export const register=async(req,res)=>{
    try {
        const {name,email,password}=req.body;
        if(!name||!email||!password){
            return res.json({success:false,message:'Missing Detail'})
        }
        const existingUser=await User.findOne({email})
        if(existingUser){
            return res.json({success:false,message:'User already registered with this email'})
        }
        const hashedPassword=await bcrypt.hash(password,10)

        //create user
        const user=await User.create({name,email,password:hashedPassword})
        //generate token
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'})
        //send cookie to client
        res.cookie('token',token,{
            httpOnly:true,//prevent javascript to access cookie
            secure:process.env.NODE_ENV==='production',//Use secure cookies in production
            sameSite:process.env.NODE_ENV==='production'?'none':'strict',//CSRF protection(cross site seing of cookies)
            maxAge:7*24*60*60*1000//cookie expiration time
        })
        return res.json({success:true,user:{email:user.email,name:user.name}})

    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message})
        
    }

};


//Login User:api/user/login
export const login=async(req,res)=>{
    try {
        const {email,password}=req.body;
        if(!email||!password){
            return res.json({success:false,message:'Email and password required'})
        }
        const user=await User.findOne({email})
        if(!user){
            return res.json({success:false,message:'Invalid email or password'})
        }
        const isMatch=await bcrypt.compare(password,user.password)
         if(!isMatch){
            return res.json({success:false,message:'Invalid email or password'})
        }
       
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'})
       
        res.cookie('token',token,{
            htpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV==='production'?'none':'strict',
            maxAge:7*24*60*60*1000
        })
        return res.json({success:true,user:{email:user.email,name:user.name}})
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message})
        
    }
}

//api/user/is-auth
export const isAuth=async(req,res)=>{
    try {
        // const {userId}=req.body;
        const user=await User.findById(req.user.userId).select("-password")
        return res.json({success:true,user})
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message})
    }


}




//Logout User:/api/user/logout
export const logout=async(req,res)=>{
    try {
        res.clearCookie('token',{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV==='production'?'none':'strict',

        })
        return res.json({success:true,message:"Logged Out"})
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}
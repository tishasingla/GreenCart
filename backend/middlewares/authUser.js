import jwt from 'jsonwebtoken'

const authUser=async(req,res,next)=>{
    const {token}=req.cookies;

    if(!token){
        return res.json({success:false,message:'Not Authorized'})
    }

    try {
        const tokenDecode=jwt.verify(token,process.env.JWT_SECRET)
         if (tokenDecode.id) {
        //  req.user.userId = tokenDecode.id; 
        req.user = { userId: tokenDecode.id }; 
         next(); 
    } else{
            return res.json({success:false,message:'Not Authorized'})
             
        }
        // next();
    } catch (error) {
        // res.json({success:false,message:error.message})
         if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    res.status(500).json({ success: false, message: 'Authentication failed' });
        
    }

}
export default authUser;
//it will be executed befor the controller to fetch the user id from toke by decoding the token
//token is presented in cookie
//next() will execute the controller
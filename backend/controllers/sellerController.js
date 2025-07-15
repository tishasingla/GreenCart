import jwt from "jsonwebtoken";


export const sellerLogin=async(req,res)=>{
    try {
        const {email,password}=req.body;
    if(password===process.env.SELLER_PASSWORD&&email===process.env.SELLER_EMAIL){
        const token=jwt.sign({email},process.env.JWT_SECRET,{expiresIn:'7d'});
         res.cookie('sellerToken',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV==='production'?'none':'strict',
            maxAge:7*24*60*60*1000
        })
        return res.json({success:true,message:"Logged In"})
    }else{
        return res.json({success:false,message:"Invalid Credentials"})
    }
    } catch (error) {
        console.log(error.message);

        res.json({success:false,message:error.message})
    }

}

//api/seller/is-auth
export const isSellerAuth=async(req,res)=>{
    try {
        return res.json({success:true})
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message})
    }


}

// export const isSellerAuth = async (req, res) => {
//     try {
//         const token = req.cookies.token;

//         if (!token) {
//             return res.json({ success: false, message: 'No token provided' });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         // You can also check user's role here if needed
//         return res.json({ success: true, userId: decoded.id });
//     } catch (error) {
//         console.log(error.message);
//         return res.json({ success: false, message: 'Invalid or expired token' });
//     }
// };

//Logout Seller:/api/seller/logout
export const sellerLogout=async(req,res)=>{
    try {
        res.clearCookie('SellerToken',{
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
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from 'axios'

axios.defaults.withCredentials=true//to send the cookies in api

axios.defaults.baseURL=import.meta.env.VITE_BACKEND_URL

export const AppContext=createContext();
export const AppContextProvider=({children})=>{

    const currency=import.meta.env.VITE_CURRENCY
    const navigate=useNavigate()
    const [user,setUser]=useState(null)
    const [isSeller,setIsSeller]=useState(false)
    const [showUserLogin,setShowUserLogin]=useState(false)
    const [products,setProducts]=useState([])
    const [cartItems,setCartItems]=useState({})
    const [searchQuery,setSearchQuery]=useState({})


    //Fetch Seller Status
    const fetchSeller=async()=>{
        try {
            const {data}=await axios.get('/api/seller/is-auth',{withCredentials:true});
            if(data.success){
                setIsSeller(true)
            }
            console.log(data.message)
            // else{
            //     setIsSeller(false)
            // }
        } catch (error) {
            setIsSeller(false);
            
        }
    }

    //Fetch User Auth Status,UserData and Cart Items

    const fetchUser=async()=>{
        try {
            const {data}=await axios.get('api/user/is-auth',{withCredentials:true});
            if(data.success){
                setUser(data.user);
                setCartItems(data.user.cartItems)
            }
            console.log(data.message)
            console.log(data.user)
        } catch (error) {
            setUser(null)
        }
    }

    const fetchProducts=async()=>{
       try {
        const {data}=await axios.get('/api/product/list')
        if(data.success)setProducts(data.products)
        else toast.error(data.message)

       } catch (error) {
        toast.error(error.message)
        
       }
    }

    //add product to card
    const addToCart=(itemId)=>{
       let cartData=structuredClone(cartItems)
       if(cartData[itemId]){
        cartData[itemId]+=1
       } 
       else{
        cartData[itemId]=1
       }
       setCartItems(cartData)
       toast.success("Added to Cart")
    }
    //update Cart item Quantity
    const updateCartItem=(itemId,quantity)=>{
        let cartData=structuredClone(cartItems)
        cartData[itemId]=quantity;
        setCartItems(cartData)
        toast.success("Cart updated")
    }
    //REmove Product from Cart
    const removeFromCart=(itemId)=>{
        let cartData=structuredClone(cartItems)
        if(cartData[itemId]){
            cartData[itemId]-=1;
            if(cartData[itemId]==0){
                delete cartData[itemId]
            }
        }
        toast.success("Removed from Cart")
        setCartItems(cartData)

    }

    // get cart item count
    const getCartCount=()=>{
        let totalCount=0;
        for(const item in cartItems){
            totalCount+=cartItems[item]
        }
        return totalCount
    }

    //get cart Total Amount
    const getCartAmount=()=>{
        let totalAmount=0;
        for(const items in cartItems){
            let itemInfo=products.find((product)=>product._id===items)
            if(cartItems[items]>0){
                totalAmount+=itemInfo.offerPrice*cartItems[items]
            }
        }
        return Math.floor(totalAmount*100)/100
    }


    useEffect(()=>{
        fetchUser()
        fetchSeller()
        fetchProducts()
     
    },[])
    
    //updata database cart items
    useEffect(()=>{
        const updateCart=async()=>{
            try {
                const {data}=await axios.post('/api/cart/update',{cartItems})
                if(!data.success)
                    {toast.error(data.message)}
                    console.log(data.message)
            } catch (error) {
               toast.error(error.message);
            }
        }
    if(user){
        updateCart()
    }

    },[cartItems])

    const value={navigate,user,setUser,isSeller,setIsSeller,showUserLogin,setShowUserLogin,products,currency,addToCart,updateCartItem,removeFromCart,cartItems,searchQuery,setSearchQuery,getCartAmount,getCartCount,axios,fetchProducts,setCartItems}
    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>

}
export const useAppContext=()=>{
    return useContext(AppContext)
}
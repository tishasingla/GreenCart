import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

//Input field component
const InputField=({type,placeholder,name,handleChange,address})=>{
    return (
        <input className='w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition'
        type={type}
        placeholder={placeholder}
        onChange={handleChange}
        name={name}
        value={address[name]}
        required
        >
         </input>

    )
}


const AddAddress = () => {

    const {axios,user,navigate}=useAppContext()
    const [address,setAddress]=useState({
        firstName:'',
        lastName:'',
        email:'',
        street:'',
        city:'',
        state:'',
        zipcode:'',
        country:'',
        phone:'',
    })
    const handleChange=(e)=>{
        const {name,value}=e.target;
        setAddress((prevAddress)=>{
            return{
            ...prevAddress, //spread operator to keep the value intact which are not changed
            [name]:value
            
            }
            
           
        })
        console.log(address)
    }
    const onSubmitHandler=async(e)=>{
        e.preventDefault();
        try {
            const {data}=await axios.post('/api/address/add',{address})
            if(data.success){
                toast.success(data.message)
                navigate('/cart')
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
            
        }
        
    }

    useEffect(()=>{
        if(!user){
            navigate('/cart')
        }
    },[])
  return (
    <div className='mt-16 pb-16'>
        <p className='text-2xl md:text-3xl text-gray-500'>Add Shipping <span className='font-semibold text-primary'>Address</span></p>
        <div className='flex flex-col-reverse md:flex-row justify-between mt-10'>
            <div className='flex-1 max-w-md'>
                
                <form onSubmit={onSubmitHandler} className='space-y-3 mt-6 txt-sm'>
                    <div className='grid grid-cols-2 gap-4'>
                    <InputField 
                    handleChange={handleChange}
                    address={address}
                    name='firstName'
                    type='text'
                    placeholder='Enter firstName'
                    />
                    <InputField 
                    handleChange={handleChange}
                    address={address}
                    name='lastName'
                    type='text'
                    placeholder='Enter LastName'
                    />
                    </div>
                    <InputField 
                    handleChange={handleChange}
                    address={address}
                    name='email'
                    type='text'
                    placeholder='Enter EmailAddress'
                    />
                    <InputField 
                    handleChange={handleChange}
                    address={address}
                    name='street'
                    type='text'
                    placeholder='Enter street'
                    />

                    <div className='grid grid-cols-2 gap-4'>
                    <InputField 
                    handleChange={handleChange}
                    address={address}
                    name='city'
                    type='text'
                    placeholder='Enter city'
                    />
                    <InputField 
                    handleChange={handleChange}
                    address={address}
                    name='state'
                    type='text'
                    placeholder='Enter state'
                    /> 

                    <div className='grid grid-cols-2 gap-4'>
                    <InputField 
                    handleChange={handleChange}
                    address={address}
                    name='zipcode'
                    type='number'
                    placeholder='Enter zipcode'
                    />
                    <InputField 
                    handleChange={handleChange}
                    address={address}
                    name='country'
                    type='text'
                    placeholder='Enter country'
                    />
                    </div>
                    </div>
                    <InputField 
                    handleChange={handleChange}
                    address={address}
                    name='phone'
                    type='number'
                    placeholder='Enter phone'
                    /> 
                    <button className='w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition cursor-pointer'>
                        Save address 
                    </button>
                    
                   

                </form>

            </div>
            <img src={assets.add_address_iamge} alt='Add address' className='md:m4-16 mb-16 md:mt-0'></img>

        </div>

    </div>
  )
}

export default AddAddress
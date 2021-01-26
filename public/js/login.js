/* eslint-disable */
import axios from 'axios'

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'post',
            url: '/api/v1/users/login',
            data: {
                email,
                password
            }
        })
        return (res.data.status === 'success' ? {isLoggedIn: true} : {isLoggedIn:false}) 
    }catch(err) {
        return {isLoggedIn:false, message: err.response.data.message}
    }
}

export const logout = async () =>  {
    try{
        const res = await axios({
            method: 'GET',
            url: '/api/v1/users/logout',
        })
        return res.data.status ==='success'? {isLoggedOut:true}: {isLoggedOut: false};
    } catch(err) {
        return {isLoggedOut:false, message:err.response.data.message}
    }
}
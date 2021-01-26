import axios from 'axios'

export const updateSettings = async (type, data) => {
    try {
        let res;
        if(type === 'user-data'){
            res = await axios({
                method: 'PATCH',
                url: '/api/v1/users/update-me',
                data
            })
        }else if(type === 'password') {
            res = await axios({
                method:'PUT',
                url: '/api/v1/users/update-password',
                data
            })
        }
        return res.data.status === 'success' ? {success: true} : {success:false};
    }catch(err){
        console.log(err);
        return {success: false, message: err.response.data.message}
    }
} 
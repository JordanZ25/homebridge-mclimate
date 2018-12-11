const axios = require('axios');
class axiosClient {
    constructor(access_token, refresh_token) {
        this.refresh_token = refresh_token;
        this.access_token = access_token;
        this.instance = axios.create({
            baseURL: 'https://developer-api.seemelissa.com/v1/',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': ''
            }
        });
        this.instance.interceptors.response.use(undefined, err => {
            const originalRequest = err.config;

                if (err.response.status === 401 && !originalRequest._retry) {
                    return this.instance.post('auth/renew',{
                            "client_id": "5c068a81ab1b0",
                            "client_secret": "5c068a81ab109",
                            "refresh_token": this.refresh_token
                        },{
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept-Response': 'Advanced'
                        }
                    }).then((response) => {
                        this.access_token = response.data.auth.access_token;
                        axios.defaults.headers.common['Authorization'] = `Bearer ${this.access_token}`
                        originalRequest.headers['Authorization'] = `Bearer ${this.access_token}`
                        originalRequest._retry = true;
                        return this.instance(originalRequest);
                    }).catch((error) => {
                       
                        return Promise.reject(error);
                    })
                }
            
            return Promise.reject(err);
        })
    }
}
module.exports = axiosClient;
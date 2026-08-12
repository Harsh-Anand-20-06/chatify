import axios from "axios"

let isRefreshing = false;
let failedQueue = [];          //to prevent race condition, while new token is issues, put rest tasks in queue.

const processQueue = (error,token)=>{
    failedQueue.forEach((prom)=>{
        if(error){
           
            prom.reject(error);  //ab niche ka .error chalega
        }
        else{
            prom.resolve(token)  //ab niche ka .then chalega
        }
    });
    failedQueue = [];
};


export let inMemoryAccessToken = null;

export const setAccessToken = function(token){
    inMemoryAccessToken = token;
}

export const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true, //sends cookies with request
})

axiosInstance.interceptors.request.use((config)=>{
    if(inMemoryAccessToken!=null){
        config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
        // console.log(`Sending request to ${config.url} WITH token:`, inMemoryAccessToken);
    }else {
        
        // console.log(`Sending request to ${config.url} WITHOUT token`);
    }
    //rem harsh - learn by consoling it!
    return config;
})

axiosInstance.interceptors.response.use(
    (response) => {
//   console.log("response: ",response);
  return response;
},
    async(error)=>{
        const originalRequest = error.config;

        if(error.response?.status===401 && !originalRequest._retry){
            
                if(isRefreshing){
                    return new Promise(function(resolve,reject){
                        failedQueue.push({resolve,reject});  //sabke resolve ,reject queue me daal diye, aage tabhi badhega jab reolve ya reject call hoga jo tab hoga jab processqueue call hoga
                    }).then((token)=>{          //will run if promise resolved,token will be received, see processqueue func
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosInstance(originalRequest);
                    }).catch(error=>{return Promise.reject(error)});    //will run if promise is rejected
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try{

                const res = await axios.get("http://localhost:5000/api/auth/newtoken",{withCredentials:true,});
                const {nayaAccessToken} = res.data;
                setAccessToken(nayaAccessToken);
                
                processQueue(null,nayaAccessToken);

                originalRequest.headers.Authorization = `Bearer ${nayaAccessToken}`;
                return axiosInstance(originalRequest);
                
                
                }catch(refreshError){
                    processQueue(refreshError,null);
                 setAccessToken(null);
                 return Promise.reject(refreshError);
            }finally{
                isRefreshing = false;
            }
        }
        return Promise.reject(error)
    }
);
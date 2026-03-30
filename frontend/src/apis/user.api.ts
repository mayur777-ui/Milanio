import { apiClient } from "@/utility/axiosinstance"

type regUser = {
    name: string,
    email:string,
    password: string
}

type LoginUser = {
    email: string,
    password: string,
}

type verifyload = {
    email:string,
    otp:string
}

export const UserService = {
    async ReqOtp(payload : regUser){
        let res = await apiClient.post('/User/register',payload,{
            headers:{
                "Content-Type":"application/json"
            }
        })
        return  res;
    },

    async Login(payload: LoginUser){
        let res = await apiClient.post("/User/login",payload);
        return res;
    },
    async verifyOtp(payload:verifyload){
        let res = await apiClient.post("/User/verifyOtpAndRegister",payload);
        return res;
    },

    async resetPass(payload: LoginUser){
        let res = await apiClient.post("/User/resetPassword", payload);
        return res;
    },

    async resendOtp(email:string){
        let res = await apiClient.post("/User/resendOtp", {email});
        return res;
    },

    async getUsre(){
        let res = await apiClient.get("/User/getUser");
        return res;
    }
}
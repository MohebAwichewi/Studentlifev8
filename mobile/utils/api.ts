import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ✅ Using the production URL as requested
// ✅ Using the production URL (WIN App Vercel Deployment)
// ❌ Production URL (When Deployed)
// const BASE_URL = 'https://win-app-tau.vercel.app/api';

// ✅ Local Development URL (Your PC's IP)
const BASE_URL = 'http://192.168.0.3:3000/api';

// ❌ Local Development URL (Use your computer's IP found in npm run dev logs)
// const BASE_URL = 'http://192.168.0.5:3000/api'; 
// const BASE_URL = 'http://10.0.2.2:3000/api'; // Android Emulator specific

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the Token
api.interceptors.request.use(
    async (config: any) => {
        const token = await SecureStore.getItemAsync('user_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error: any) => Promise.reject(error)
);

export default api;


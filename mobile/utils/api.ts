import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ✅ Using the production URL as requested
const BASE_URL = 'https://student-life.uk/api';

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
        const token = await SecureStore.getItemAsync('student_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error: any) => Promise.reject(error)
);

// Add a response interceptor to handle global errors
(error) => {
    if (!error.response) {
        // Network Error (No response received)
        // Using Alert since no Toast library is installed
        require('react-native').Alert.alert('Connection Error', 'Please check your internet connection.');
    } else if (error.response.status >= 500) {
        // Server Error
        require('react-native').Alert.alert('Server Error', 'Something went wrong on our end. Please try again later.');
    }
    return Promise.reject(error);
}

export default api;

import axios from 'axios';

const baseURL = 'http://localhost:3000/words/';
const authBaseURL = 'http://localhost:3000/auth/';

const handleError = fn => async (...params) => {
    try {
        return await fn(...params);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const api = {
    getWord: handleError(async id => {
        const res = await axios.get(baseURL + id);
        return res.data;
    }),

    getWords: handleError(async () => {
        const res = await axios.get(baseURL);
        return res.data;
    }),

    searchWords: handleError(async query => {
        const res = await axios.get(`${baseURL}search`, { params: { q: query } });
        return res.data;
    }),

    deleteWord: handleError(async id => {
        const res = await axios.delete(baseURL + id);
        return res.data;
    }),

    createWord: handleError(async payload => {
        const res = await axios.post(baseURL, payload);
        return res.data;
    }),

    updateWord: handleError(async payload => {
        const res = await axios.put(baseURL + payload._id, payload);
        return res.data;
    }),
    
    suggestTranslations: handleError(async english => {
        const res = await axios.post(baseURL + 'suggestions', { english });
        return res.data;
    }),

    login: handleError(async credentials => {
        const res = await axios.post(authBaseURL + 'login', credentials);
        return res.data;
    }),

    signup: handleError(async credentials => {
        const res = await axios.post(authBaseURL + 'signup', credentials);
        return res.data;
    }),

    verifyOtp: handleError(async payload => {
        const res = await axios.post(authBaseURL + 'verify-otp', payload);
        return res.data;
    }),

    resendOtp: handleError(async payload => {
        const res = await axios.post(authBaseURL + 'resend-otp', payload);
        return res.data;
    })
};
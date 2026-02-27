import axios from 'axios';
import { UserProfile } from '../types';

const API_BASE_URL = '/api/miniapp';

export const api = {
    getSchedule: async (userId: string) => {
        const response = await axios.get(`${API_BASE_URL}/schedule/${userId}`);
        return response.data;
    },

    getUserProfile: async (userId: string) => {
        const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
        return response.data;
    },

    updateProfile: async (userId: string, profile: Partial<UserProfile>) => {
        const response = await axios.post(`${API_BASE_URL}/profile`, {
            user_id: userId,
            ...profile
        });
        return response.data;
    },

    getFilterOptions: async () => {
        const response = await axios.get(`${API_BASE_URL}/filters`);
        return response.data;
    }
};

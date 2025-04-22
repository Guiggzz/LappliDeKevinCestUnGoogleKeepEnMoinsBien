const BASE_API_URL = process.env.EXPO_PUBLIC_API_URL;

export const API = {
    BASE: BASE_API_URL,
    NOTES: `${BASE_API_URL}/notes`,
    CATEGORIES: `${BASE_API_URL}/categories`,
    TASKS: `${BASE_API_URL}/tasks`,
    LOGIN: `${BASE_API_URL}/login`,
};
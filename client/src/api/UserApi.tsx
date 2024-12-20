import axios from 'axios';

const BASE_URL = 'http://localhost:7000/api/user';

export const signup = async (firstName: string, lastName: string, username: string, email: string, password: string) => {
    return axios.post(`${BASE_URL}/signup`, { firstName, lastName, username, email, password });
};

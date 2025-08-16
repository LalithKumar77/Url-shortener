import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL;


export async function shortenUrl(url){
    try {
        const response = await axios.post(`${API_URL}/api/url`,{
            url : url
        },
        { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error shortening URL:", error);
        throw error;
    }
}


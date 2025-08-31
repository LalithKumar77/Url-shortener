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

export async function getUrlsStats() {
    console.log("entered Urls stats");
    try{
        const response = await axios.get(`${API_URL}/api/user/urls`, { withCredentials: true });
        return response.data;
    }catch(error){
        console.error("Error fetching URL stats:", error);
        throw error;
    }
}


export async function createAdvancedUrl({ alias, redirectUrl, password, expireAt, qr }) {
    try {
        const response = await axios.post(
            `${API_URL}/api/user/url/advanced`,
            {
                alias,
                redirectUrl,
                password,
                expireAt,
                qr,
            },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching advanced URL:", error);
        throw error;
    }
}

export async function getQrCodeForShortUrl(shortId) {
    try {
        const response = await axios.get(`${API_URL}/api/url/${shortId}/qr`,{
            withCredentials: true
        });
        console.log("QR Code fetched successfully:", response);
        return response.data;
    } catch (error) {
        console.error("Error fetching QR code:", error);
        throw error;
    }
}

export async function updateShortUrl(shortId, data) {
    const API_URL = import.meta.env.VITE_API_URL;
    try {
        const response = await axios.put(`${API_URL}/api/user/url/${shortId}`, data, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error updating short URL:", error);
        throw error;
    }
}

// Get analytics for user's URLs (clicks by day, country stats, unique visitors)
export async function getUserUrlAnalytics() {
    try {
        const response = await axios.get(`${API_URL}/api/user/url/analytics`, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error('Error fetching user URL analytics:', error);
        throw error;
    }
}
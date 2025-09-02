import { apiClient } from "./axiosConfig";

export async function shortenUrl(url) {
    try {
        const response = await apiClient.post(`/api/url`, { url });
        return response.data;
    } catch (error) {
        console.error("Error shortening URL:", error);
        throw error;
    }
}

export async function getUrlsStats() {
    console.log("entered Urls stats");
    try {
        const response = await apiClient.get(`/api/user/urls`);
        return response.data;
    } catch (error) {
        console.error("Error fetching URL stats:", error);
        throw error;
    }
}

export async function createAdvancedUrl({ alias, redirectUrl, password, expireAt, qr }) {
    try {
        const response = await apiClient.post(`/api/user/url/advanced`, {
            alias,
            redirectUrl,
            password,
            expireAt,
            qr,
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching advanced URL:", error);
        throw error;
    }
}

export async function getQrCodeForShortUrl(shortId) {
    try {
        const response = await apiClient.get(`/api/url/${shortId}/qr`);
        console.log("QR Code fetched successfully:", response);
        return response.data;
    } catch (error) {
        console.error("Error fetching QR code:", error);
        throw error;
    }
}

export async function updateShortUrl(shortId, data) {
    try {
        const response = await apiClient.put(`/api/user/url/${shortId}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating short URL:", error);
        throw error;
    }
}

// Get analytics for user's URLs (clicks by day, country stats, unique visitors)
export async function getUserUrlAnalytics() {
    try {
        const response = await apiClient.get(`/api/user/url/analytics`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user URL analytics:', error);
        throw error;
    }
}

export async function deleteShortUrl(shortId) {
    try {
        const response = await apiClient.delete(`/api/user/url/${shortId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting short URL:", error);
        throw error;
    }
}
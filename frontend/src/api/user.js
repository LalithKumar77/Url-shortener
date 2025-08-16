import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function profilepic(photo){
    try {
        const response  = await axios.post(`${API_URL}/api/user/profilepic`, {
            photo: photo
        }, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error uploading profile picture:", error);
        throw error;
    }
}

export async function deleteProfile(){
    try{
        const response = await axios.delete(`${API_URL}/api/user/profile`, { withCredentials: true });
        return response.data;
    }catch(error){
        console.error("Error deleting profile:", error);
        throw error;
    }

}
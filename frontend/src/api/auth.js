import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL + "/api/auth";

export async function login({ gmail, password }) {
	try {
		const response = await axios.post(`${API_URL}/login`,
			{ gmail, password },
			{ withCredentials: true } 
		);
		console.log(`response :`, response);
		// On success, set localStorage
		if (response.data && response.data.user) {
			localStorage.setItem('isSignedIn', 'true');
			const userWithSignIn = { ...response.data.user, isSignedIn: true };
			localStorage.setItem('user', JSON.stringify(userWithSignIn));
			console.log(`local storage :`, localStorage);
		}
		return { data: response.data };
	} catch (error) {
		let message = "Network error. Please try again.";
		if (
			error.response &&
			error.response.data &&
			error.response.data.error
		) {
			message = error.response.data.error;
		}
		return { error: message };
	}
}


export async function register({ username, gmail, password }) {
	try{
		const response = await axios.post(`${API_URL}/signup`,{
			username,
			gmail,
			password
		});
		// On success, set localStorage
		if (response.data && response.data.user) {
			const userWithSignIn = { ...response.data.user, isSignedIn: true };
			localStorage.setItem('user', JSON.stringify(userWithSignIn));
		}
		return { data: response.data };
	}catch(error){
		let message = "Network error. Please try again.";
		console.log(error);
		if (
			error.response &&
			error.response.data &&
			error.response.data.error
		) {
			message = error.response.data.error;
		}
		return { error: message };
	}
}


export async function updatePassword({ currentPassword, newPassword }) {
	try {
		const response = await axios.put(`${API_URL}/update-password`, {
			password: currentPassword,
			newPassword
		},
		{ withCredentials: true }
		);
		return { data: response.data };
	} catch (error) {
		let message = "Network error. Please try again.";
		console.log(error);
		if (
			error.response &&
			error.response.data &&
			error.response.data.error
		) {
			message = error.response.data.error;
		}
		return { error: message };
	}
}


export async function logout() {
	try {
		const response = await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
		if (response.status === 200) {
			localStorage.clear();
		}
		console.log(`logout response:`, response);
		return { data: response };
	} catch (error) {
		let message = "Network error. Please try again.";
		console.log(error);
		if (
			error.response &&
			error.response.data &&
			error.response.data.error
		) {
			message = error.response.data.error;
		}
		return { error: message };
	}	
}
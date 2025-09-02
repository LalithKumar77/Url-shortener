import { apiClient } from "./axiosConfig";

export async function login({ gmail, password }) {
	try {
		const response = await apiClient.post(`/api/auth/login`, { gmail, password });
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
	const response = await apiClient.post(`/api/auth/signup`, { username, gmail, password });
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
	const response = await apiClient.put(`/api/auth/update-password`, { password: currentPassword, newPassword });
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
		const response = await apiClient.post(`/api/auth/logout`, {});
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

export async function validateResetToken(token) {
	try {
		const response = await apiClient.post(`/api/auth/validate-reset-token`, { token });
		return { data: response.data };
	} catch (error) {
		let message = 'Network error. Please try again.';
		if (error.response && error.response.data && error.response.data.error) {
			message = error.response.data.error;
		}
		return { error: message };
	}
}

export async function resetPassword({ token, password }) {
	try {
		const response = await apiClient.post(`/api/auth/reset-password`, { token, password });
		return { data: response.data };
	} catch (error) {
		let message = 'Network error. Please try again.';
		console.log(error);
		if (error.response && error.response.data && error.response.data.error) {
			message = error.response.data.error;
		}
		return { error: message };
	}
}

export async function forgotPassword({ gmail }) {
	try {
		const response = await apiClient.post(`/api/auth/forgot-password`, { gmail });
		return { data: response.data };
	} catch (error) {
		let message = 'Network error. Please try again.';
		if (error.response && error.response.data && error.response.data.error) {
			message = error.response.data.error;
		}
		return { error: message };
	}
}
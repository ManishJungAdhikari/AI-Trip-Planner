import axios from "axios";


const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
});


export async function generateItinerary(payload) {
  const response = await api.post("/itinerary/generate/", payload);
  return response.data;
}


export async function registerUser(payload) {
  const response = await api.post("/auth/register/", payload);
  return response.data;
}


export async function loginUser(payload) {
  const response = await api.post("/auth/login/", payload);
  return response.data;
}


export async function requestPasswordReset(payload) {
  const response = await api.post("/auth/forgot-password/", payload);
  return response.data;
}


export async function resetPassword(payload) {
  const response = await api.post("/auth/reset-password/", payload);
  return response.data;
}


export async function changePassword(payload, token) {
  const response = await api.post("/auth/change-password/", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}


export async function deleteAccount(token) {
  await api.delete("/auth/account/", {
    headers: { Authorization: `Bearer ${token}` },
  });
}


export async function updateProfile(payload, token) {
  const response = await api.patch("/auth/account/", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}


export async function testLogin() {
  const response = await api.post("/auth/test-login/");
  return response.data;
}


export async function adminTestLogin() {
  const response = await api.post("/auth/admin-test-login/");
  return response.data;
}


export async function fetchAdminDashboard(token) {
  const response = await api.get("/auth/admin-dashboard/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}


export async function deleteUserAsAdmin(userId, token) {
  await api.delete(`/auth/admin-users/${userId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}


export async function updateUserRoleAsAdmin(userId, payload, token) {
  const response = await api.patch(`/auth/admin-users/${userId}/`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}


export async function saveTrip(payload, token) {
  const response = await api.post("/trips/save/", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}


export async function fetchTrips(token) {
  const response = await api.get("/trips/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}


export async function deleteTrip(tripId, token) {
  await api.delete(`/trips/${tripId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}


export async function updateTripMetadata(tripId, payload, token) {
  const response = await api.patch(`/trips/${tripId}/`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}


export async function duplicateTrip(tripId, token) {
  const response = await api.post(`/trips/${tripId}/duplicate/`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

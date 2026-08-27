import axios from "axios";

const API_BASE = "http://localhost:5000/api/auth";

export async function loginApi(email, password) {
  const res = await axios.post(`${API_BASE}/login`, { email, password });
  return res.data;
}

export async function signupApi(name, email, password) {
  const res = await axios.post(`${API_BASE}/signup`, { name, email, password });
  return res.data;
}

export async function getMeApi(token) {
  const res = await axios.get(`${API_BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function updatePasswordApi(currentPassword, newPassword, token) {
  const res = await axios.put(
    `${API_BASE}/password`,
    { currentPassword, newPassword },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

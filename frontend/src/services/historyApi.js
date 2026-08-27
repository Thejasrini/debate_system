import axios from "axios";

const API_BASE = "http://localhost:5000/api/history";

export async function getThreadsApi(token) {
  const res = await axios.get(`${API_BASE}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function getThreadApi(threadId, token) {
  const res = await axios.get(`${API_BASE}/${threadId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function deleteThreadApi(threadId, token) {
  const res = await axios.delete(`${API_BASE}/${threadId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function getUserStatsApi(token) {
  const res = await axios.get(`${API_BASE}/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

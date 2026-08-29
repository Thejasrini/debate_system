import axios from "axios";

const API_BASE = "http://localhost:5000/api/admin/stats";

export async function getOverviewStats(token) {
  const res = await axios.get(`${API_BASE}/overview`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function getVolumeStats(token) {
  const res = await axios.get(`${API_BASE}/volume`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function getDomainStats(token) {
  const res = await axios.get(`${API_BASE}/domains`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function getConfidenceStats(token) {
  const res = await axios.get(`${API_BASE}/confidence`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function getHallucinationStats(token) {
  const res = await axios.get(`${API_BASE}/hallucinations`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function getFeedbackStats(token) {
  const res = await axios.get(`${API_BASE}/feedback`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function getFeedbackListApi(token) {
  const res = await axios.get(`http://localhost:5000/api/admin/feedback/list`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function getRegisteredUsersApi(token) {
  const res = await axios.get(`http://localhost:5000/api/admin/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function getAllCasesApi(token) {
  const res = await axios.get(`http://localhost:5000/api/admin/cases`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

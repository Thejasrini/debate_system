import axios from "axios";

const API_BASE = "http://localhost:5000/api/export";

export async function downloadVerdictPDF(threadId, turnIndex = 0, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(`${API_BASE}/pdf/${threadId}/${turnIndex}`, {
    headers,
    responseType: "blob"
  });

  const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `LexAgent_Verdict_${threadId}_Turn${turnIndex + 1}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function getCitationGraphApi(threadId, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.get(`${API_BASE}/citation-graph/${threadId}`, { headers });
  return res.data;
}

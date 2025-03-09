import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/",
  timeout: 5000, // Temps max d'attente en ms
  headers: { "Content-Type": "application/json" },
});

export default api;

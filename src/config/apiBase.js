const rawBase = import.meta.env.VITE_API_BASE ?? "http://localhost:5261";

export const API_BASE = rawBase.replace(/\/$/, "");
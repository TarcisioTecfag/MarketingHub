export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  if (options.body && !options.headers) {
    options.headers = { "Content-Type": "application/json" };
  } else if (options.body && options.headers && !("Content-Type" in options.headers)) {
    (options.headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    let message = "Erro na requisição";
    try {
       const err = await response.json();
       message = err.error || err.message || message;
    } catch { }
    throw new Error(message);
  }
  
  return response.json();
}

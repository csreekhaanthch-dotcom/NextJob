const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function searchJobs(query: string, location?: string) {
  const params = new URLSearchParams();
  params.append("query", query);
  if (location) params.append("location", location);

  const response = await fetch(`${API_BASE_URL}/api/jobs/search?${params}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch jobs");
  }
  
  return response.json();
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
}

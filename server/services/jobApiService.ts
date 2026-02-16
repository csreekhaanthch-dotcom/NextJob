import axios from "axios";

export async function searchJobs(query: string, location: string) {
  try {
    const response = await axios.get(
      "https://jsearch.p.rapidapi.com/search",
      {
        params: {
          query: `${query} in ${location}`,
          page: "1",
          num_pages: "1",
          date_posted: "3days"
        },
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      }
    );

    return response.data?.data || [];
  } catch (error: any) {
    console.error("Job API error:", error.message);
    return [];
  }
}

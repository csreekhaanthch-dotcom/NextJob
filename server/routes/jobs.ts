import express from "express";
import { searchJobs } from "../services/jobApiService";

const router = express.Router();

router.get("/search", async (req, res) => {
  const query = (req.query.query as string) || "software engineer";
  const location = (req.query.location as string) || "remote";

  const jobs = await searchJobs(query, location);

  res.json({
    success: true,
    count: jobs.length,
    jobs,
  });
});

export default router;

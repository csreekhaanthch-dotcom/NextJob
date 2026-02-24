import { supabase } from '../lib/supabase';
import { jobs } from '../lib/jobs';
import axios from 'axios';

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HF_MODEL_URL = 'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2';

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await axios.post(HF_MODEL_URL, { inputs: text }, {
      headers: { Authorization: `Bearer ${HF_API_KEY}` }
    });
    return response.data[0];
  } catch (error) {
    console.error("Error generating embedding:", error);
    return [];
  }
}

async function populateJobs() {
  console.log('Starting job population...');
  for (const job of jobs) {
    const combinedText = `${job.title} ${job.company} ${job.description}`;
    const embedding = await generateEmbedding(combinedText);
    if (embedding.length === 0) {
        console.error(`Skipping job ${job.id} due to embedding error.`);
        continue;
    }
    const { error } = await supabase.from('jobs').upsert({
      id: job.id, title: job.title, company: job.company, location: job.location,
      description: job.description, embedding: embedding,
    });
    if (error) console.error(`Error inserting job ${job.id}:`, error);
    else console.log(`Successfully inserted job ${job.id}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Avoid rate limit
  }
  console.log('Job population finished.');
}
populateJobs();

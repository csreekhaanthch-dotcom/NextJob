import Link from 'next/link';
type Job = { id: number; title: string; company: string; location: string; description: string; similarity?: number; };
export default function JobCard({ job }: { job: Job }) {
  return (
    <div className="border p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
      <Link href={`/jobs/${job.id}`}>
        <h2 className="text-xl font-bold">{job.title}</h2>
        <p className="text-gray-600">{job.company} - {job.location}</p>
        {job.similarity && <p className="text-sm text-green-600 mt-1">Match: {(job.similarity * 100).toFixed(1)}%</p>}
      </Link>
    </div>
  );
}

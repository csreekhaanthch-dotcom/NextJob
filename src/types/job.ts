export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  posted: string;
  description: string;
  tags: string[];
  logo: string;
  url: string;
  remote?: boolean;
  experienceLevel?: string;
}
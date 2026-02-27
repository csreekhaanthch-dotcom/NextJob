import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const company = searchParams.get('company') || 'Unknown'
  
  // Return mock company intel data
  return NextResponse.json({
    company,
    avg_rating: 3.8,
    total_reviews: 150,
    avg_salary_min: 90000,
    avg_salary_max: 150000,
    avg_work_life_balance: 3.5,
    avg_compensation: 3.8,
    interview_questions_count: 25,
    interview_difficulty: 3.0,
    recommend_to_friend: 72,
    ceo_approval: 65,
    recent_reviews: [
      {
        job_title: 'Software Engineer',
        rating: 4,
        pros: 'Great work-life balance',
        cons: 'Salary could be higher',
        date: new Date().toISOString()
      }
    ],
    salaries: [
      { job_title: 'Software Engineer', min: 100000, max: 180000, location: 'Remote' }
    ],
    interview_questions: [
      { question: 'Tell me about yourself', difficulty: 'easy', category: 'behavioral' }
    ]
  })
}

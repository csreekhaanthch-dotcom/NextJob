import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for alerts (replace with database in production)
let alertsStore: any[] = []

// GET - Fetch all alerts for a user
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'anonymous'
    const alerts = alertsStore.filter(a => a.user_id === userId)
    return NextResponse.json({ alerts })
  } catch (error: any) {
    console.error('Fetch alerts error:', error)
    return NextResponse.json({ alerts: [] })
  }
}

// POST - Create a new job alert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, name, search_query, location, job_type, min_salary, remote_only, frequency } = body
    
    const alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: user_id || 'anonymous',
      name,
      search_query,
      location,
      job_type,
      min_salary,
      remote_only: remote_only || false,
      frequency: frequency || 'daily',
      is_active: true,
      jobs_sent_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    alertsStore.push(alert)
    return NextResponse.json({ alert })
  } catch (error: any) {
    console.error('Create alert error:', error)
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }
}

// PUT - Update an alert
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, is_active } = body
    
    const index = alertsStore.findIndex(a => a.id === id)
    if (index !== -1) {
      alertsStore[index].is_active = is_active
      alertsStore[index].updated_at = new Date().toISOString()
    }
    return NextResponse.json({ alert: alertsStore[index] })
  } catch (error: any) {
    console.error('Update alert error:', error)
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
  }
}

// DELETE - Delete an alert
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Alert ID required' }, { status: 400 })
    }
    
    alertsStore = alertsStore.filter(a => a.id !== id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete alert error:', error)
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 })
  }
}

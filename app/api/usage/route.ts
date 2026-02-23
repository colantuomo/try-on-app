import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { getUsageSummary } from '@/lib/services/usage.service'

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const summary = await getUsageSummary(userId)

    if (!summary) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('[Usage API] Error fetching usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

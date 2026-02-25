import { connectMongoose } from '@/util/database'
import HabitLog from '@/app/models/HabitLog'
import { NextResponse } from 'next/server'

// GET /api/habit/stats?userId=xxx&habitName=xxx
// → 해당 습관의 1년치 날짜별 count 배열 반환: [{ date, count }]
export async function GET(request) {
    try {
        await connectMongoose()
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const habitName = searchParams.get('habitName')

        if (!userId || !habitName) {
            return NextResponse.json({ error: 'userId와 habitName이 필요합니다.' }, { status: 400 })
        }

        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

        const stats = await HabitLog.aggregate([
            {
                $match: {
                    userId,
                    habitName,
                    date: { $gte: oneYearAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date', timezone: '+09:00' } },
                    count: { $sum: '$count' }
                }
            }
        ])

        const result = stats.map(item => ({
            date: item._id,
            count: item.count
        }))

        return NextResponse.json(result)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: '서버 오류' }, { status: 500 })
    }
}

import { connectMongoose } from '@/util/database'
import HabitLog from '@/app/models/HabitLog'
import { NextResponse } from 'next/server'

// GET /api/habit/today?userId=user_123
// → 오늘 각 habitName별 count 반환: { habitName: count, ... }
export async function GET(request) {
    try {
        await connectMongoose()
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'userId가 필요합니다.' }, { status: 400 })
        }

        // KST(UTC+9) 기준 오늘 자정
        const now = new Date()
        const kstOffset = 9 * 60 * 60 * 1000
        const today = new Date(Math.floor((now.getTime() + kstOffset) / 86400000) * 86400000 - kstOffset)

        const logs = await HabitLog.find({ userId, date: today })

        // { habitName: count } 형태로 변환
        const result = {}
        logs.forEach(log => {
            result[log.habitName] = log.count
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: '서버 오류' }, { status: 500 })
    }
}

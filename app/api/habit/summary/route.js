import { connectMongoose } from '@/util/database'
import HabitLog from '@/app/models/HabitLog'
import Habit from '@/app/models/Habit'
import { NextResponse } from 'next/server'

// GET /api/habit/summary?userId=xxx
// → 습관별 { habitName, totalCount, currentStreak, bestStreak } 반환
export async function GET(request) {
    try {
        await connectMongoose()
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        if (!userId) return NextResponse.json({ error: 'userId 필요' }, { status: 400 })

        const habits = await Habit.find({ userId }).sort({ createdAt: 1 })

        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

        const results = await Promise.all(habits.map(async (habit) => {
            const logs = await HabitLog.find({
                userId,
                habitName: habit.name,
                date: { $gte: oneYearAgo },
            }).sort({ date: 1 })

            const dateSet = new Set(logs.map(l => {
                const d = new Date(l.date)
                return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
            }))

            const totalCount = logs.reduce((s, l) => s + l.count, 0)

            // 스트릭 계산
            let currentStreak = 0
            let bestStreak = 0
            let tempStreak = 0
            let prevDate = null

            const sorted = Array.from(dateSet).sort()
            for (const ds of sorted) {
                if (!prevDate) {
                    tempStreak = 1
                } else {
                    const prev = new Date(prevDate)
                    prev.setDate(prev.getDate() + 1)
                    const prevExpected = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-${String(prev.getDate()).padStart(2, '0')}`
                    if (prevExpected === ds) {
                        tempStreak++
                    } else {
                        tempStreak = 1
                    }
                }
                if (tempStreak > bestStreak) bestStreak = tempStreak
                prevDate = ds
            }

            // currentStreak: 오늘 또는 어제가 마지막이어야 연속
            const nowUtc = new Date()
            const kstOffset = 9 * 60 * 60 * 1000
            const todayKST = new Date(Math.floor((nowUtc.getTime() + kstOffset) / 86400000) * 86400000 - kstOffset)
            const todayStr = `${todayKST.getUTCFullYear()}-${String(todayKST.getUTCMonth() + 1).padStart(2, '0')}-${String(todayKST.getUTCDate()).padStart(2, '0')}`
            const yest = new Date(todayKST)
            yest.setUTCDate(yest.getUTCDate() - 1)
            const yesterdayStr = `${yest.getUTCFullYear()}-${String(yest.getUTCMonth() + 1).padStart(2, '0')}-${String(yest.getUTCDate()).padStart(2, '0')}`

            if (dateSet.has(todayStr) || dateSet.has(yesterdayStr)) {
                // 뒤에서부터 연속 계산
                let streak = 0
                let cursor = new Date(todayKST)
                // 오늘 없으면 어제부터 시작
                if (!dateSet.has(todayStr)) cursor = yest
                while (true) {
                    const cs = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}-${String(cursor.getUTCDate()).padStart(2, '0')}`
                    if (dateSet.has(cs)) { streak++; cursor.setUTCDate(cursor.getUTCDate() - 1) }
                    else break
                }
                currentStreak = streak
            } else {
                currentStreak = 0
            }

            return {
                habitId: habit._id,
                habitName: habit.name,
                totalCount,
                currentStreak,
                bestStreak,
            }
        }))

        return NextResponse.json(results)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: '서버 오류' }, { status: 500 })
    }
}

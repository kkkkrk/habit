import { connectMongoose } from '@/util/database'
import HabitLog from '@/app/models/HabitLog'
import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        await connectMongoose()

        const { userId, habitName } = await request.json()

        // 오늘 날짜 — KST(UTC+9) 기준 자정
        const now = new Date()
        const kstOffset = 9 * 60 * 60 * 1000
        const today = new Date(Math.floor((now.getTime() + kstOffset) / 86400000) * 86400000 - kstOffset)

        // 오늘 이미 기록이 있으면 count +1, 없으면 새로 생성
        const existing = await HabitLog.findOne({ userId, habitName, date: today })

        if (existing) {
            existing.count += 1
            await existing.save()
            return NextResponse.json({ message: '업데이트 완료', count: existing.count })
        } else {
            const log = await HabitLog.create({
                userId,
                habitName: habitName || '기본 습관',
                date: today,
                count: 1,
            })
            return NextResponse.json({ message: '기록 완료', count: log.count })
        }
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: '서버 오류' }, { status: 500 })
    }
}

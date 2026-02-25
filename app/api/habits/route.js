import { connectMongoose } from '@/util/database'
import Habit from '@/app/models/Habit'
import { NextResponse } from 'next/server'

// GET /api/habits?userId=user_123 → 습관 목록 반환
export async function GET(request) {
    try {
        await connectMongoose()
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'userId가 필요합니다.' }, { status: 400 })
        }

        const habits = await Habit.find({ userId }).sort({ order: 1, createdAt: 1 })
        return NextResponse.json(habits)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: '서버 오류' }, { status: 500 })
    }
}

// POST /api/habits → 새 습관 생성
export async function POST(request) {
    try {
        await connectMongoose()
        const { userId, name, frequency, targetCount, activeDays, startDay } = await request.json()

        if (!userId || !name || !name.trim()) {
            return NextResponse.json({ error: 'userId와 name이 필요합니다.' }, { status: 400 })
        }

        const habit = await Habit.create({
            userId,
            name: name.trim(),
            frequency: frequency || 'daily',
            targetCount: targetCount || 1,
            activeDays: activeDays || [0, 1, 2, 3, 4, 5, 6],
            startDay: startDay ?? 1,
        })
        return NextResponse.json(habit)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: '서버 오류' }, { status: 500 })
    }
}

// DELETE /api/habits → 습관 삭제
export async function DELETE(request) {
    try {
        await connectMongoose()
        const { habitId } = await request.json()

        if (!habitId) {
            return NextResponse.json({ error: 'habitId가 필요합니다.' }, { status: 400 })
        }

        await Habit.findByIdAndDelete(habitId)
        return NextResponse.json({ message: '삭제 완료' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: '서버 오류' }, { status: 500 })
    }
}

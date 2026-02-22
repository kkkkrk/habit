import { connectMongoose } from '@/util/database'
import Habit from '@/app/models/Habit'
import { NextResponse } from 'next/server'

// PATCH /api/habits/reorder
// body: { userId, orderedIds: [id1, id2, ...] }
export async function PATCH(request) {
    try {
        await connectMongoose()
        const { userId, orderedIds } = await request.json()
        if (!userId || !Array.isArray(orderedIds)) {
            return NextResponse.json({ error: 'userId와 orderedIds가 필요합니다.' }, { status: 400 })
        }
        await Promise.all(
            orderedIds.map((id, index) =>
                Habit.updateOne({ _id: id, userId }, { $set: { order: index } })
            )
        )
        return NextResponse.json({ message: '순서 저장 완료' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: '서버 오류' }, { status: 500 })
    }
}

import { connectMongoose } from '@/util/database'
import User from '@/app/models/User'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

// POST /api/auth/register
export async function POST(request) {
    try {
        await connectMongoose()
        const { username, password, email, phone, smsConsent } = await request.json()

        if (!username?.trim() || !password) {
            return NextResponse.json({ error: '아이디와 비밀번호를 입력해주세요.' }, { status: 400 })
        }
        if (username.length < 3) {
            return NextResponse.json({ error: '아이디는 3자 이상이어야 합니다.' }, { status: 400 })
        }
        if (password.length < 6) {
            return NextResponse.json({ error: '비밀번호는 6자 이상이어야 합니다.' }, { status: 400 })
        }

        const existing = await User.findOne({ username: username.trim() })
        if (existing) {
            return NextResponse.json({ error: '이미 사용 중인 아이디입니다.' }, { status: 409 })
        }

        const hashed = await bcrypt.hash(password, 12)
        const user = await User.create({
            username: username.trim(),
            password: hashed,

            email: email?.trim() || undefined,
            phone: phone?.trim() || undefined,
            smsConsent: !!smsConsent,
        })

        return NextResponse.json({ message: '가입 완료', userId: user._id.toString() }, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: '서버 오류' }, { status: 500 })
    }
}

import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { connectMongoose } from "@/util/database"
import User from "@/app/models/User"

export const authOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                username: { label: '아이디', type: 'text' },
                password: { label: '비밀번호', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null
                try {
                    await connectMongoose()
                    const user = await User.findOne({ username: credentials.username.trim() })
                    if (!user) return null
                    const valid = await bcrypt.compare(credentials.password, user.password)
                    if (!valid) return null
                    return {
                        id: user._id.toString(),
                        name: user.username,
                        email: null,
                        image: null,
                    }
                } catch (e) {
                    console.error(e)
                    return null
                }
            }
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (token?.sub) session.user.id = token.sub
            if (token?.name) session.user.name = token.name
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id
                token.name = user.name
            }
            return token
        },
    },
    session: { strategy: 'jwt' },
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
}

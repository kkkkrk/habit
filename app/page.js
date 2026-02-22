import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]/authOptions"
import { redirect } from "next/navigation"
import { connectMongoose } from "@/util/database"
import HabitLog from './models/HabitLog'
import MainLayout from './components/MainLayout'

async function getHabitData(userId) {
  await connectMongoose()
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  const stats = await HabitLog.aggregate([
    { $match: { userId, date: { $gte: oneYearAgo } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, count: { $sum: "$count" } } }
  ])
  return stats.map(item => ({ date: item._id, count: item.count }))
}

function getTodayLabel() {
  const now = new Date()
  return now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
}

export default async function HabitPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = session.user.id
  const habitData = await getHabitData(userId)
  const todayLabel = getTodayLabel()

  return <MainLayout allHabitData={habitData} todayLabel={todayLabel} userId={userId} userName={session.user.name} userImage={session.user.image} />
}
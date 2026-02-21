import { connectMongoose } from "@/util/database"
import HabitHeatmap from './components/HabitHeatmap';
// import { connectDB } from '@/lib/mongodb'; // 몽고디비 연결 유틸 (직접 만드신 것 사용)
import HabitLog from './models/HabitLog';
import Button from 'react-bootstrap/Button';

// 서버 사이드에서 데이터 가져오기
async function getHabitData() {
  await connectMongoose();

  // 1년치 데이터 가져오기
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const stats = await HabitLog.aggregate([
    {
      $match: {
        // 실제 앱에서는 로그인한 유저 ID를 넣어야 합니다
        userId: 'user_123',
        date: { $gte: oneYearAgo }
      }
    },
    {
      $group: {
        // 날짜별로 묶어서 카운트 합산
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        count: { $sum: "$count" }
      }
    }
  ]);

  // 프론트엔드에서 쓰기 편하게 변환
  return stats.map(item => ({
    date: item._id,
    count: item.count
  }));
}

export default async function HabitPage() {
  const habitData = await getHabitData();

  return (
    <div className="min-h-screen p-10 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
          🔥 습관 달력
        </h1>

        {/* 잔디 심기 컴포넌트 */}
        <HabitHeatmap data={habitData} /><br />
        <Button variant="primary" className="add-btn">습관 추가하기</Button>
      </div>
    </div>
  );
}
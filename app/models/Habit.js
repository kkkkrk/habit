import mongoose from 'mongoose';

const HabitSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    order: { type: Number, default: 0 },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
    targetCount: { type: Number, default: 1, min: 1, max: 99 },
    activeDays: { type: [Number], default: [0, 1, 2, 3, 4, 5, 6] }, // 0=일 ~ 6=토, daily 전용
    startDay: { type: Number, default: 1, min: 0, max: 6 }, // weekly 시작 요일, 기본 월요일
}, { timestamps: true });

// dev 환경에서 스키마 변경이 반영되도록 기존 모델 캐시 삭제
if (mongoose.models.Habit) {
    delete mongoose.models.Habit;
}
const Habit = mongoose.model('Habit', HabitSchema);

export default Habit;

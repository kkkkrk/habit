import mongoose from 'mongoose';

const HabitLogSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    habitName: { type: String, required: true },
    date: { type: Date, required: true, index: true }, // 시간 없는 날짜 (YYYY-MM-DD)
    count: { type: Number, default: 1 },
}, { timestamps: true });

// 모델이 이미 컴파일 되어있으면 재사용, 아니면 새로 생성
const HabitLog = mongoose.models.HabitLog || mongoose.model('HabitLog', HabitLogSchema);

export default HabitLog;
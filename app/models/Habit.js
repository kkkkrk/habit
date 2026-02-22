import mongoose from 'mongoose';

const HabitSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    order: { type: Number, default: 0 },
}, { timestamps: true });

const Habit = mongoose.models.Habit || mongoose.model('Habit', HabitSchema);

export default Habit;

import mongoose from 'mongoose';

const workLogSchema = new mongoose.Schema(
    {
        member: {
            type: String,
            required: true,
        },
        // YYYY-MM-DD
        date: {
            type: String,
            required: true,
        },
        real_time: {
            type: Number,
            required: true,
        },
        total_time: {
            type: Number,
            required: true,
        },
        efficiency: {
            type: Number,
            required: true,
        },
        add_time: {
            type: String,
            default: '0',
        },
        note: {
            type: String,
        },
    },
    { timestamps: true }
);

export default mongoose.model('WorkLog', workLogSchema);
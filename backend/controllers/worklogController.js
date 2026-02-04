import asyncHandler from 'express-async-handler';
import WorkLog from '../models/workLogModel.js';
export const upsertWorkLog = asyncHandler(async (req, res) => {

    const {
        member_id,
        date,
        work_time,
        total_work_time,
        progress,
        add_time,
    } = req.body;

    // Basic validation (add more as needed)
    if (!member_id || !date) {
        return res.status(400).json({ message: "member_id and date are required" });
    }

    try {
        const workLog = await WorkLog.findOneAndUpdate(
            {
                member: member_id,      // assuming schema uses "member", not "member_id"
                date: date,
                // source: ???          // ← add this if your app actually uses "source"
            },
            {
                $set: {
                    member:     member_id,
                    date:       date,
                    real_time:  work_time,
                    total_time: total_work_time,
                    efficiency: progress,
                    add_time:   add_time,
                    // source:     something || null,   // only if needed
                },
                // Optional: only set fields that are sent
                // $setOnInsert: { createdAt: new Date() }  // example
            },
            {
                upsert: true,           // create if not found
                new: true,              // return the updated/new document
                runValidators: true,    // important if you have schema validators
            }
        );

        return res.status(200).json(workLog);
    } catch (err) {
        console.error(err);

        if (err.code === 11000) {
            return res.status(409).json({
                message: "Duplicate work log entry (unique constraint violation)",
                error: err.message
            });
        }

        return res.status(500).json({ message: "Server error", error: err.message });
    }
});

export const getWorkLogs = async (req, res) => {
  try {
    const { fromDate, toDate, member } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        message: "fromDate and toDate are required",
      });
    }

    // 🔹 Build query dynamically
    const query = {
      date: { $gte: fromDate, $lte: toDate },
    };

    if (member) {
      query.member = member;     // 👈 member case
    }

    const logs = await WorkLog.find(query)
      .select("member date real_time total_time efficiency, add_time note")
      .lean();

    res.json(logs);
  } catch (error) {
    console.error("getWorkLogs error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addTimeToMember = async (req, res) => {
  const { memberId, totalSeconds, description, date } = req.body;

  if (!memberId || !totalSeconds || !date) {
    return res.status(400).json({
      message: "memberId, totalSeconds, and date are required",
    });
  }

  try {
    // Find existing work log for the member on the specified date
    let workLog = await WorkLog.findOne({ member: memberId, date: date });

    if (workLog) {
      // Update existing work log
      workLog.add_time = (
        parseInt(workLog.add_time || '0', 10) + parseInt(totalSeconds, 10)
      ).toString();
      workLog.note = description || workLog.note;
      await workLog.save();
    } else {
      // Create new work log entry
      workLog = new WorkLog({
        member: memberId,
        date: date,
        real_time: 0,
        total_time: 0,
        efficiency: 0,
        add_time: totalSeconds.toString(),
        note: description || '',
      });
      await workLog.save();
    }

    res.status(200).json({ message: "Time added successfully", workLog });
  } catch (error) {
    console.error("addTimeToMember error:", error);
    res.status(500).json({ message: "Server error" });
  } 
}
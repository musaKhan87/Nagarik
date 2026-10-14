const User = require('../models/User');

/**
 * Calculates resolution speed metrics, badges, and recognition note.
 * Updates worker's profile performance metrics.
 */
async function recordWorkerResolution(complaint, worker) {
  const now = new Date();
  const createdAt = complaint.createdAt ? new Date(complaint.createdAt) : now;
  
  // Calculate total hours taken to resolve
  const durationMs = now.getTime() - createdAt.getTime();
  const durationHours = Math.max(0.1, Number((durationMs / (1000 * 60 * 60)).toFixed(1)));

  let aheadHours = 0;
  let isEarly = false;
  let speedBadge = '⏱️ On-Time SLA';
  let appreciationNote = 'Issue resolved successfully on schedule.';

  if (complaint.deadline) {
    const deadlineTime = new Date(complaint.deadline).getTime();
    const timeDiffMs = deadlineTime - now.getTime();

    if (timeDiffMs > 0) {
      aheadHours = Number((timeDiffMs / (1000 * 60 * 60)).toFixed(1));
      isEarly = true;

      if (aheadHours >= 12 || durationHours <= 2) {
        speedBadge = '⚡ Lightning Fast';
        appreciationNote = `Resolved ${aheadHours} hours ahead of SLA deadline in record time! Outstanding civic dedication.`;
      } else if (aheadHours >= 4 || durationHours <= 6) {
        speedBadge = '🏆 Speed Champion';
        appreciationNote = `Completed ${aheadHours} hours ahead of schedule! Exceptional field efficiency.`;
      } else {
        speedBadge = '🎯 Ahead of Schedule';
        appreciationNote = `Finished ${aheadHours} hours before deadline. Commendable work!`;
      }
    } else {
      aheadHours = 0;
      isEarly = false;
      speedBadge = '⏱️ Completed';
      appreciationNote = 'Issue resolved and verified.';
    }
  } else {
    if (durationHours <= 3) {
      speedBadge = '⚡ Lightning Fast';
      appreciationNote = `Resolved in just ${durationHours} hours! Prompt civic action.`;
      isEarly = true;
    }
  }

  const workerName = worker?.name || 'Field Officer';
  const workerDepartment = worker?.department || complaint.assignedDept || 'General Operations';

  const resolutionDetails = {
    resolvedAt: now,
    resolvedByWorker: worker?._id,
    workerName,
    workerDepartment,
    resolutionTimeHours: durationHours,
    aheadOfTimeHours: aheadHours,
    speedBadge,
    appreciationNote,
    isEarly,
    citizenKudosCount: complaint.resolutionDetails?.citizenKudosCount || 0,
    citizenKudosUsers: complaint.resolutionDetails?.citizenKudosUsers || []
  };

  // Update worker's performance accolades in User collection
  if (worker?._id) {
    try {
      const updateDoc = {
        $inc: {
          'workerPerformance.totalResolved': 1,
          ...(isEarly ? { 'workerPerformance.earlyResolutions': 1 } : {})
        },
        $addToSet: {
          'workerPerformance.badges': speedBadge
        }
      };
      await User.findByIdAndUpdate(worker._id, updateDoc);
    } catch (err) {
      console.warn('[APPRECIATION] Worker stats update warning:', err.message);
    }
  }

  return resolutionDetails;
}

module.exports = {
  recordWorkerResolution
};

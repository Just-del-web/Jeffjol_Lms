import { Activity } from '../models/activity.model.js';
import moment from 'moment';

export class EngagementService {
  async logStudentAction(studentId, action, contentId = null, subject = null) {
    return await Activity.create({
      student: studentId,
      action,
      contentId,
      subject
    });
  }

  async getAttendancePercentage(studentId, startDate, endDate) {
    const totalSchoolDays = 60; 
    
    const activeDays = await Activity.distinct('createdAt', {
      student: studentId,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const uniqueDates = new Set(activeDays.map(date => date.toISOString().split('T')[0]));
    
    const percentage = (uniqueDates.size / totalSchoolDays) * 100;
    return Math.min(Math.round(percentage), 100); 
  }
}
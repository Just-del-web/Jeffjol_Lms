import { Announcement } from "../models/announcement.model.js";
import { successResponse } from "../utils/helper.js";

export const getActiveAnnouncements = async (req, res, next) => {
  try {
    const { role } = req; 

    const now = new Date();
    
    const query = {
      [`targetAudience.${role}s`]: true, 
      $or: [
        { expiresAt: { $gt: now } },
        { expiresAt: null }
      ]
    };

    const announcements = await Announcement.find(query)
      .sort({ priority: 1, createdAt: -1 }) 
      .limit(3); 

    return res.status(200).json(successResponse(200, "Active notices fetched.", announcements));
  } catch (error) {
    next(error);
  }
};
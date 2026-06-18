import Ride from '../models/ride.model.js';
import Review from '../models/review.model.js';

/**
 * Get start and end dates for today
 */
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

/**
 * Get start and end dates for the current week (last 7 days)
 */
const getWeeklyRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  start.setHours(0, 0, 0, 0);
  return { start, end };
};

/**
 * Get start and end dates for the current month (last 30 days)
 */
const getMonthlyRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  start.setHours(0, 0, 0, 0);
  return { start, end };
};

/**
 * Get sum of fares for a given driver and time range
 */
const getEarningsByRange = async (driverId, start, end) => {
  const rides = await Ride.find({
    driverId,
    status: 'completed',
    completedAt: { $gte: start, $lte: end },
  });

  return rides.reduce((sum, ride) => {
    const fare = ride.payment?.totalFare || ride.payment?.fare || 0;
    const tip = ride.payment?.driverTip || 0;
    return sum + fare + tip;
  }, 0);
};

export const getTodayEarnings = async (driverId) => {
  const { start, end } = getTodayRange();
  const amount = await getEarningsByRange(driverId, start, end);
  return {
    amount,
    currency: 'INR',
  };
};

export const getWeeklyEarnings = async (driverId) => {
  const { start, end } = getWeeklyRange();
  const amount = await getEarningsByRange(driverId, start, end);
  return {
    amount,
    currency: 'INR',
  };
};

export const getEarningsSummary = async (driverId) => {
  const { start: todayStart, end: todayEnd } = getTodayRange();
  const { start: weeklyStart, end: weeklyEnd } = getWeeklyRange();
  const { start: monthlyStart, end: monthlyEnd } = getMonthlyRange();

  const todayAmount = await getEarningsByRange(driverId, todayStart, todayEnd);
  const weeklyAmount = await getEarningsByRange(driverId, weeklyStart, weeklyEnd);
  const monthlyAmount = await getEarningsByRange(driverId, monthlyStart, monthlyEnd);

  const totalTrips = await Ride.countDocuments({
    driverId,
    status: 'completed',
  });

  // Calculate average rating from Review collection
  const reviews = await Review.find({ driverId });
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 5.0;

  return {
    today: todayAmount,
    weekly: weeklyAmount,
    monthly: monthlyAmount,
    totalTrips,
    avgRating: Number(avgRating.toFixed(1)),
    currency: 'INR',
  };
};

export const getEarningsHistory = async (driverId) => {
  const rides = await Ride.find({
    driverId,
    status: 'completed',
  }).sort({ completedAt: -1 }).limit(50);

  return rides.map((ride) => {
    const amount = ride.payment?.totalFare || ride.payment?.fare || 0;
    const bonus = ride.payment?.driverTip || 0;
    return {
      id: ride._id.toString(),
      rideId: ride.rideNo ? `RIDE-${ride.rideNo}` : ride._id.toString(),
      amount,
      currency: 'INR',
      date: ride.completedAt || ride.updatedAt,
      paymentMethod: ride.payment?.method || 'cash',
      bonus,
    };
  });
};

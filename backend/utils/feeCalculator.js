// Helper function to calculate parking fee
const calculateParkingFee = (entryTime, exitTime) => {
  const durationMs = exitTime - entryTime; // This is milliseconds
  const durationMinutes = Math.ceil(durationMs / (1000 * 60)); // Duration in minutes, rounded up

  // Example simple tiered pricing:
  // First 30 minutes: free
  // Next 30 minutes (up to 1 hour): $5
  // After 1 hour: $3 per additional hour (or part thereof)
  // Or, a simpler flat rate:
  const HOURLY_RATE = 5; // $5 per hour
  const MIN_CHARGE_MINUTES = 15; // Minimum charge after X minutes, e.g., first 15 mins free

  if (durationMinutes <= MIN_CHARGE_MINUTES) {
      return 0; // Free parking for short stays
  }

  // A simpler flat rate per hour (or part of an hour)
  const hours = Math.ceil(durationMinutes / 60); // Round up to the nearest hour
  return hours * HOURLY_RATE;
};
module.exports= calculateParkingFee
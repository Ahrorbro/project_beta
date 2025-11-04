/**
 * Utility functions for subscription and trial management
 */

/**
 * Check if a user has active access (either trial or paid membership)
 */
export function hasActiveAccess(subscription: {
  membershipPaid: boolean;
  trialStartDate: Date | null;
  trialEndDate: Date | null;
} | null): boolean {
  if (!subscription) {
    return false;
  }

  // If membership is paid, they have access
  if (subscription.membershipPaid) {
    return true;
  }

  // Check if trial is still active
  if (subscription.trialStartDate && subscription.trialEndDate) {
    const now = new Date();
    const trialStart = new Date(subscription.trialStartDate);
    const trialEnd = new Date(subscription.trialEndDate);

    // Trial is active if current time is between start and end
    return now >= trialStart && now <= trialEnd;
  }

  return false;
}

/**
 * Check if trial is expired
 */
export function isTrialExpired(subscription: {
  trialEndDate: Date | null;
} | null): boolean {
  if (!subscription || !subscription.trialEndDate) {
    return true; // No trial means it's expired
  }

  const now = new Date();
  const trialEnd = new Date(subscription.trialEndDate);
  return now > trialEnd;
}

/**
 * Get days remaining in trial
 */
export function getTrialDaysRemaining(subscription: {
  trialEndDate: Date | null;
} | null): number {
  if (!subscription || !subscription.trialEndDate) {
    return 0;
  }

  const now = new Date();
  const trialEnd = new Date(subscription.trialEndDate);
  const diffTime = trialEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}


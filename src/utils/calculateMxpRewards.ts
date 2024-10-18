export function calculateReward (actionCount: number): number {
  if (actionCount <= 10) {
    return 15 // Max reward for first 10 actions
  } else if (actionCount <= 20) {
    return 10 // Reduced reward for next 10 actions
  } else if (actionCount <= 30) {
    return 5 // Further reduced reward for last 10 actions
  } else {
    return 0 // No rewards after 30 actions
  }
}

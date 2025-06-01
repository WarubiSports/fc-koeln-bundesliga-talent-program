export const excuseReasons = [
  "Medical appointment",
  "Family emergency", 
  "University exam",
  "School commitment",
  "Injury/illness",
  "Personal matter",
  "Other"
];

export function categorizeReason(reason: string): string {
  const lowerReason = reason.toLowerCase();
  if (lowerReason.includes('medical') || lowerReason.includes('doctor') || lowerReason.includes('dentist') || lowerReason.includes('hospital')) {
    return 'Medical';
  }
  if (lowerReason.includes('family') || lowerReason.includes('emergency')) {
    return 'Family Emergency';
  }
  if (lowerReason.includes('exam') || lowerReason.includes('university') || lowerReason.includes('school')) {
    return 'Academic';
  }
  if (lowerReason.includes('injury') || lowerReason.includes('hurt') || lowerReason.includes('pain') || lowerReason.includes('illness')) {
    return 'Injury/Illness';
  }
  return 'Other';
}
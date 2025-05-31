// Simple in-memory practice excuse system
export interface PracticeExcuse {
  id: number;
  playerName: string;
  date: string;
  reason: string;
  status: "pending" | "approved" | "denied";
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

export interface ExcuseStats {
  totalExcuses: number;
  pendingExcuses: number;
  approvedExcuses: number;
  deniedExcuses: number;
  excusesByReason: Record<string, number>;
}

// In-memory storage for practice excuses
let practiceExcuses: PracticeExcuse[] = [
  {
    id: 1,
    playerName: "Max Mueller",
    date: "2024-06-03",
    reason: "Medical appointment - dentist visit scheduled weeks ago",
    status: "approved",
    submittedAt: "2024-06-01T10:00:00Z",
    reviewedBy: "Coach Schmidt",
    reviewedAt: "2024-06-01T14:00:00Z"
  },
  {
    id: 2,
    playerName: "Hans Weber",
    date: "2024-06-05",
    reason: "Family emergency - grandmother hospitalized",
    status: "approved",
    submittedAt: "2024-06-04T08:30:00Z",
    reviewedBy: "Coach Schmidt",
    reviewedAt: "2024-06-04T09:00:00Z"
  },
  {
    id: 3,
    playerName: "Erik Fischer",
    date: "2024-06-07",
    reason: "Want to sleep in",
    status: "denied",
    submittedAt: "2024-06-06T23:45:00Z",
    reviewedBy: "Coach Schmidt",
    reviewedAt: "2024-06-07T07:00:00Z",
    notes: "Insufficient reason. All players must attend regular training."
  },
  {
    id: 4,
    playerName: "Jan Richter",
    date: "2024-06-10",
    reason: "University exam that cannot be rescheduled",
    status: "pending",
    submittedAt: "2024-06-08T16:20:00Z"
  }
];

let nextId = 5;

export const practiceExcuseService = {
  getAll: (): PracticeExcuse[] => {
    return [...practiceExcuses].sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  },

  create: (excuse: Omit<PracticeExcuse, 'id' | 'submittedAt' | 'status'>): PracticeExcuse => {
    const newExcuse: PracticeExcuse = {
      ...excuse,
      id: nextId++,
      status: "pending",
      submittedAt: new Date().toISOString()
    };
    practiceExcuses.push(newExcuse);
    return newExcuse;
  },

  getStats: (): ExcuseStats => {
    const stats = practiceExcuses.reduce((acc, excuse) => {
      acc.totalExcuses++;
      if (excuse.status === "pending") acc.pendingExcuses++;
      if (excuse.status === "approved") acc.approvedExcuses++;
      if (excuse.status === "denied") acc.deniedExcuses++;

      // Categorize reasons
      const reasonCategory = categorizeReason(excuse.reason);
      acc.excusesByReason[reasonCategory] = (acc.excusesByReason[reasonCategory] || 0) + 1;

      return acc;
    }, {
      totalExcuses: 0,
      pendingExcuses: 0,
      approvedExcuses: 0,
      deniedExcuses: 0,
      excusesByReason: {} as Record<string, number>
    });

    return stats;
  }
};

function categorizeReason(reason: string): string {
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
  if (lowerReason.includes('injury') || lowerReason.includes('hurt') || lowerReason.includes('pain')) {
    return 'Injury';
  }
  return 'Other';
}
export type Role = 'resident' | 'vendor' | 'village';
export type Status = 'draft' | 'collecting' | 'submitted' | 'approved' | 'rejected' | 'cancelled';

export type Block = {
  id: string; label: string; zip: string; eligible: boolean; reason?: string;
  nearest?: string; trees: number; bigTrees: number; parking: string; overnight: boolean;
};

export type PartyRequest = {
  id: string; blockId: string; dateStart: string; dateEnd: string; guests: number;
  barricades: boolean; greenKit: boolean; status: Status; petitionCount: number;
  approvedDate?: string; traffic: 'low' | 'medium' | 'high'; trafficReason: string;
  createdAt: string; organizer: string;
};

export type Vendor = {
  id: string; businessName: string; service: string; price: number; capacity: number;
  jobsPerDay: number; includes: string; days: string[]; zips: string[]; approved: boolean;
};

export type Match = { id: string; requestId: string; vendorId: string; state: 'proposed' | 'accepted' | 'declined'; };

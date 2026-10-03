import type { Block, Match, PartyRequest, Vendor } from './types';

export const blocks: Block[] = [
  { id: 'cuyler', label: '1100 S Cuyler Ave', zip: '60304', eligible: true, trees: 55, bigTrees: 18, parking: '2 hr parking · 8 a.m.–6 p.m. Mon–Fri', overnight: true },
  { id: 'highland', label: '1100 Highland Ave', zip: '60304', eligible: true, trees: 23, bigTrees: 6, parking: 'Residential permit zone', overnight: true },
  { id: 'scoville', label: '1100 S Scoville Ave', zip: '60304', eligible: true, trees: 56, bigTrees: 16, parking: 'Street parking available', overnight: true },
  { id: 'east', label: '600 S East Ave', zip: '60304', eligible: true, trees: 33, bigTrees: 15, parking: '2 hr parking · 8 a.m.–6 p.m. Mon–Fri', overnight: true },
  { id: 'superior', label: '600 Superior St', zip: '60302', eligible: false, reason: "East/west street: the Village doesn't close these for block parties.", nearest: '600 N Oak Park Ave · 54 m away', trees: 12, bigTrees: 2, parking: 'Street parking available', overnight: false },
];

export const initialRequests: PartyRequest[] = [
  { id: 'r1', blockId: 'cuyler', dateStart: '2027-06-12', dateEnd: '2027-06-26', guests: 120, barricades: true, greenKit: true, status: 'approved', petitionCount: 10, approvedDate: '2027-06-19', traffic: 'low', trafficReason: 'Another closure within 200 m', createdAt: '2026-10-01T10:00:00Z', organizer: 'Sample Organizer' },
  { id: 'r2', blockId: 'highland', dateStart: '2027-06-12', dateEnd: '2027-06-26', guests: 80, barricades: true, greenKit: true, status: 'submitted', petitionCount: 10, traffic: 'low', trafficReason: 'Another closure that weekend within 200 m', createdAt: '2026-10-01T11:00:00Z', organizer: 'Sample Organizer B' },
  { id: 'r3', blockId: 'east', dateStart: '2027-07-10', dateEnd: '2027-07-17', guests: 140, barricades: true, greenKit: false, status: 'submitted', petitionCount: 10, traffic: 'medium', trafficReason: '1 busy bus stop on the block', createdAt: '2026-10-01T12:00:00Z', organizer: 'Sample Organizer C' },
  { id: 'r4', blockId: 'scoville', dateStart: '2027-08-07', dateEnd: '2027-08-14', guests: 110, barricades: true, greenKit: true, status: 'approved', petitionCount: 10, approvedDate: '2027-08-14', traffic: 'low', trafficReason: 'No bus stops, schools or nearby closures', createdAt: '2026-10-02T09:00:00Z', organizer: 'Sample Organizer' },
];

export const initialVendors: Vendor[] = [
  { id: 'v1', businessName: 'Sample Ice Cream Co.', service: 'Ice cream', price: 300, capacity: 150, jobsPerDay: 2, includes: 'Ice cream truck for up to 3 hours, soft serve and popsicles.', days: ['Saturday', 'Sunday'], zips: ['60302', '60304'], approved: true },
  { id: 'v2', businessName: 'Sample Taco Cart', service: 'Food truck', price: 425, capacity: 130, jobsPerDay: 1, includes: 'Taco cart and two attendants.', days: ['Saturday'], zips: ['60304'], approved: true },
  { id: 'v3', businessName: 'Sample Face Painting', service: 'Face painting', price: 240, capacity: 90, jobsPerDay: 2, includes: 'Two hours of face painting.', days: ['Saturday', 'Sunday'], zips: ['60301', '60302', '60304'], approved: true },
];

export const initialMatches: Match[] = [
  { id: 'm1', requestId: 'r1', vendorId: 'v1', state: 'accepted' },
  { id: 'm2', requestId: 'r2', vendorId: 'v1', state: 'proposed' },
  { id: 'm3', requestId: 'r3', vendorId: 'v1', state: 'proposed' },
  { id: 'm4', requestId: 'r4', vendorId: 'v1', state: 'accepted' },
];

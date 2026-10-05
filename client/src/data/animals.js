export const statuses = [
  'In treatment',
  'Rehabilitation',
  'Ready for release',
  'Released',
]

// Fictional records only; dates are fixed to keep the prototype reproducible.
export const initialAnimals = [
  {
    id: 'TCSA-001',
    name: 'Willow',
    species: 'Cape tortoise',
    status: 'In treatment',
    admitted: '2026-10-01',
    location: 'Care room A',
    carer: 'Thandi M.',
    reason: 'Shell injury following a roadside rescue.',
    nextCare: '09:00 · Scheduled medication',
    history: [
      {
        date: '2026-10-03',
        note: 'Wound cleaned. Appetite improving; continue observation.',
      },
      {
        date: '2026-10-01',
        note: 'Admitted for shell assessment and stabilisation.',
      },
    ],
  },
  {
    id: 'TCSA-002',
    name: 'Ember',
    species: 'Cape dwarf chameleon',
    status: 'Rehabilitation',
    admitted: '2026-09-22',
    location: 'Habitat 02',
    carer: 'Alex R.',
    reason: 'Recovering from a limb injury.',
    nextCare: '10:30 · Progress photo',
    history: [
      {
        date: '2026-10-03',
        note: 'Climbing steadily. Continue supervised rehabilitation.',
      },
    ],
  },
  {
    id: 'TCSA-003',
    name: 'Nala',
    species: 'Leopard tortoise',
    status: 'Rehabilitation',
    admitted: '2026-09-18',
    location: 'Enclosure 04',
    carer: 'Thandi M.',
    reason: 'Rescued juvenile requiring supportive care.',
    nextCare: '12:00 · Feeding review',
    history: [
      {
        date: '2026-10-02',
        note: 'Feeding independently; monitor weight weekly.',
      },
    ],
  },
  {
    id: 'TCSA-004',
    name: 'River',
    species: 'Parrot-beaked tortoise',
    status: 'Ready for release',
    admitted: '2026-09-12',
    location: 'Enclosure 01',
    carer: 'Alex R.',
    reason: 'Recovered from a leg injury.',
    nextCare: '14:00 · Release assessment',
    history: [
      {
        date: '2026-10-03',
        note: 'Mobility restored. Awaiting final release assessment.',
      },
    ],
  },
  {
    id: 'TCSA-005',
    name: 'Moss',
    species: 'Angulate tortoise',
    status: 'In treatment',
    admitted: '2026-10-03',
    location: 'Care room B',
    carer: 'Sam K.',
    reason: 'Dehydration; admitted for observation.',
    nextCare: '15:00 · Scheduled medication',
    history: [
      {
        date: '2026-10-03',
        note: 'Initial assessment complete; supportive care started.',
      },
    ],
  },
  {
    id: 'TCSA-006',
    name: 'Sky',
    species: 'Leopard tortoise',
    status: 'Released',
    admitted: '2026-08-28',
    location: 'Released',
    carer: 'Alex R.',
    reason: 'Completed rehabilitation following a shell injury.',
    nextCare: null,
    history: [
      {
        date: '2026-10-02',
        note: 'Released following successful final assessment.',
      },
    ],
  },
]

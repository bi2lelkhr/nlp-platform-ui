// Mock data for the Research Production Analysis System

export interface Researcher {
  id: string;
  name: string;
  institution: string;
  country: string;
  researchArea: string;
  hIndex: number;
  rii: number;
  publications: number;
  citations: number;
  trend: number;
}

export interface Institution {
  id: string;
  name: string;
  country: string;
  globalRank: number;
  publications: number;
  avgHIndex: number;
  avgRII: number;
  citations: number;
  trend: number;
}

export interface ResearchArea {
  id: string;
  name: string;
  level: number;
  parentId?: string;
  researcherCount: number;
  publicationCount: number;
}

export const mockResearchers: Researcher[] = [
  {
    id: '1',
    name: 'Dr. Amina Bouazza',
    institution: 'University of Algiers',
    country: 'Algeria',
    researchArea: 'Computer Science',
    hIndex: 28,
    rii: 2.45,
    publications: 124,
    citations: 3456,
    trend: 12.5,
  },
  {
    id: '2',
    name: 'Dr. Karim El-Hassan',
    institution: 'MIT',
    country: 'USA',
    researchArea: 'Artificial Intelligence',
    hIndex: 42,
    rii: 1.89,
    publications: 198,
    citations: 8920,
    trend: 8.3,
  },
  {
    id: '3',
    name: 'Dr. Sarah Chen',
    institution: 'Stanford University',
    country: 'USA',
    researchArea: 'Machine Learning',
    hIndex: 38,
    rii: 2.12,
    publications: 156,
    citations: 6543,
    trend: 15.2,
  },
  {
    id: '4',
    name: 'Dr. Mohamed Ibrahim',
    institution: 'Cairo University',
    country: 'Egypt',
    researchArea: 'Data Science',
    hIndex: 31,
    rii: 2.78,
    publications: 142,
    citations: 4321,
    trend: 10.1,
  },
  {
    id: '5',
    name: 'Dr. Lisa Anderson',
    institution: 'Oxford University',
    country: 'UK',
    researchArea: 'Natural Language Processing',
    hIndex: 35,
    rii: 1.95,
    publications: 167,
    citations: 5678,
    trend: 7.8,
  },
];

export const mockInstitutions: Institution[] = [
  {
    id: '1',
    name: 'MIT',
    country: 'USA',
    globalRank: 1,
    publications: 42892,
    avgHIndex: 185,
    avgRII: 2.45,
    citations: 1245678,
    trend: 4.5,
  },
  {
    id: '2',
    name: 'Stanford University',
    country: 'USA',
    globalRank: 2,
    publications: 38900,
    avgHIndex: 172,
    avgRII: 2.31,
    citations: 1089234,
    trend: 5.1,
  },
  {
    id: '3',
    name: 'Oxford University',
    country: 'UK',
    globalRank: 3,
    publications: 35120,
    avgHIndex: 168,
    avgRII: 2.18,
    citations: 987654,
    trend: 3.8,
  },
  {
    id: '4',
    name: 'University of Algiers',
    country: 'Algeria',
    globalRank: 45,
    publications: 8420,
    avgHIndex: 89,
    avgRII: 3.12,
    citations: 124567,
    trend: 8.9,
  },
  {
    id: '5',
    name: 'Cairo University',
    country: 'Egypt',
    globalRank: 52,
    publications: 7890,
    avgHIndex: 82,
    avgRII: 2.98,
    citations: 98765,
    trend: 6.2,
  },
];

export const mockResearchAreas: ResearchArea[] = [
  {
    id: '1',
    name: 'Computer Science',
    level: 1,
    researcherCount: 245,
    publicationCount: 12456,
  },
  {
    id: '2',
    name: 'Artificial Intelligence',
    level: 2,
    parentId: '1',
    researcherCount: 89,
    publicationCount: 4567,
  },
  {
    id: '3',
    name: 'Machine Learning',
    level: 3,
    parentId: '2',
    researcherCount: 52,
    publicationCount: 2890,
  },
  {
    id: '4',
    name: 'Deep Learning',
    level: 3,
    parentId: '2',
    researcherCount: 37,
    publicationCount: 1677,
  },
  {
    id: '5',
    name: 'Natural Language Processing',
    level: 3,
    parentId: '2',
    researcherCount: 43,
    publicationCount: 2134,
  },
  {
    id: '6',
    name: 'Data Science',
    level: 2,
    parentId: '1',
    researcherCount: 67,
    publicationCount: 3456,
  },
  {
    id: '7',
    name: 'Software Engineering',
    level: 2,
    parentId: '1',
    researcherCount: 89,
    publicationCount: 4433,
  },
];

export const mockPublicationTrends = [
  { year: '2019', publications: 1200, citations: 5400, avgRII: 1.85 },
  { year: '2020', publications: 1450, citations: 6200, avgRII: 1.92 },
  { year: '2021', publications: 1680, citations: 7100, avgRII: 2.05 },
  { year: '2022', publications: 1890, citations: 8300, avgRII: 2.18 },
  { year: '2023', publications: 2150, citations: 9800, avgRII: 2.34 },
  { year: '2024', publications: 2420, citations: 11200, avgRII: 2.51 },
];

export const mockCoAuthorshipNetwork = [
  { source: 'Dr. Amina Bouazza', target: 'Dr. Karim El-Hassan', collaborations: 12 },
  { source: 'Dr. Amina Bouazza', target: 'Dr. Mohamed Ibrahim', collaborations: 8 },
  { source: 'Dr. Sarah Chen', target: 'Dr. Karim El-Hassan', collaborations: 15 },
  { source: 'Dr. Sarah Chen', target: 'Dr. Lisa Anderson', collaborations: 10 },
  { source: 'Dr. Mohamed Ibrahim', target: 'Dr. Lisa Anderson', collaborations: 6 },
];

export const mockMetricComparison = [
  { area: 'Artificial Intelligence', hIndex: 38, rii: 2.15 },
  { area: 'Machine Learning', hIndex: 42, rii: 1.95 },
  { area: 'Data Science', hIndex: 32, rii: 2.45 },
  { area: 'NLP', hIndex: 35, rii: 2.10 },
  { area: 'Computer Vision', hIndex: 40, rii: 1.85 },
];

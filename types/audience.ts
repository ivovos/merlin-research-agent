// Base audience type used in conversations and reports
export interface Audience {
  id: string;
  name: string;
  icon?: string;
}

// Segment within an audience
export interface Segment {
  id: string;
  name: string;
  count: number;
  percentage: number;
}

// Full audience details for audience management
export interface AudienceDetails extends Audience {
  icon: string; // Required in detailed view
  logo?: string;
  agents: number;
  segments: Segment[];
  updatedAt: string;
  source: string;
  projectId?: string;
  description?: string;
}

// Project containing audiences (for agency accounts)
export interface Project {
  id: string;
  name: string;
  icon: string;
  logo?: string;
  audiences: AudienceDetails[];
}

// Account (brand or agency)
export interface Account {
  id: string;
  name: string;
  type: 'brand' | 'agency';
  icon: string;
  logo?: string;
  projects?: Project[];
  audiences?: AudienceDetails[]; // For brand accounts without projects
}

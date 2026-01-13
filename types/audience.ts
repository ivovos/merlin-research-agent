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
  sourceLabel?: string; // Human-readable source label (e.g., "MUBI Customer Data", "Electric Twin Panel")
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

// Brand colors for chart theming
export interface BrandColors {
  primary: string;
  secondary: string;
  tertiary?: string;
  quaternary?: string;
}

// Uploaded brief/document for research projects
export interface UploadedBrief {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'md' | 'url';
  uploadedAt: string;
  summary?: string;
  url?: string;
}

// Research Project - a workspace that groups conversations, canvases, and briefs
export interface ResearchProject {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  audienceIds: string[];
  conversationIds: string[];
  canvasIds: string[];
  briefs?: UploadedBrief[];
  status: 'active' | 'archived' | 'completed';
  tags?: string[];
}

// Account (brand or agency)
export interface Account {
  id: string;
  name: string;
  type: 'brand' | 'agency';
  icon: string;
  logo?: string;
  brandColors?: BrandColors; // Brand-specific colors for charts
  projects?: Project[];
  audiences?: AudienceDetails[]; // For brand accounts without projects
  researchProjects?: ResearchProject[]; // Research workspaces
}

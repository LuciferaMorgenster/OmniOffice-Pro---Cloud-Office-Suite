export type AppTab = 'dashboard' | 'docs' | 'sheets' | 'slides' | 'notes' | 'tasks';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile-ios' | 'mobile-android';

export type AppTheme = 'blue' | 'emerald' | 'purple' | 'amber' | 'slate';

export type LanguageCode = 'nl' | 'en' | 'de' | 'fr';

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'busy' | 'away';
  color: string;
}

export interface DocumentVersion {
  id: string;
  timestamp: string;
  author: string;
  title: string;
  content: string;
  summary?: string;
}

export interface DocumentComment {
  id: string;
  author: string;
  avatar: string;
  timestamp: string;
  text: string;
  resolved: boolean;
  replies?: { author: string; text: string; timestamp: string }[];
}

export interface OfficeDocument {
  id: string;
  title: string;
  content: string; // HTML or Markdown
  plainText?: string;
  lastModified: string;
  author: string;
  category: string;
  isEncrypted?: boolean;
  encryptedPayload?: string; // AES-GCM base64
  salt?: string;
  iv?: string;
  tags: string[];
  versions: DocumentVersion[];
  comments: DocumentComment[];
  pinned?: boolean;
}

export interface SheetCell {
  value: string; // raw value or formula like =SOM(B2:B5)
  computed?: string | number;
  format?: 'text' | 'currency' | 'percent' | 'number';
  bold?: boolean;
  align?: 'left' | 'center' | 'right';
  bgColor?: string;
  textColor?: string;
}

export interface SheetData {
  [cellRef: string]: SheetCell; // e.g., 'A1', 'B2'
}

export interface SpreadsheetDoc {
  id: string;
  title: string;
  lastModified: string;
  author: string;
  cells: SheetData;
  rowCount: number;
  colCount: number;
  chartType?: 'bar' | 'line' | 'pie';
  chartRange?: string; // e.g. "A2:B6"
  isEncrypted?: boolean;
  tags: string[];
}

export interface SlideItem {
  id: string;
  title: string;
  subtitle: string;
  bulletPoints: string[];
  layout: 'title' | 'content' | 'split' | 'quote';
  bgColor: string;
  textColor: string;
  notes?: string;
  imageUrl?: string;
}

export interface PresentationDoc {
  id: string;
  title: string;
  lastModified: string;
  author: string;
  slides: SlideItem[];
  theme: string;
  tags: string[];
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  lastModified: string;
  isLocked: boolean;
  lockHash?: string; // SHA-256 simulation
  color: string;
  tags: string[];
  attachments?: { name: string; url: string; type: string }[];
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  completed: boolean;
  assignedTo: string;
  linkedDocId?: string;
  category: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'deadline' | 'sync' | 'security' | 'comment';
}

export interface CloudProviderInfo {
  id: string;
  name: string;
  connected: boolean;
  storageUsedMb: number;
  storageTotalMb: number;
  lastSync: string;
  iconName: string;
}

export interface ActivityLogItem {
  id: string;
  user: string;
  avatar: string;
  action: string;
  target: string;
  timestamp: string;
}

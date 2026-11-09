import { OfficeDocument, SpreadsheetDoc, PresentationDoc, NoteItem, TaskItem, UserProfile, CloudProviderInfo, ActivityLogItem } from '../types/office';

export const initialTeammates: UserProfile[] = [
  { id: 'u1', name: 'Sophie de Vries', role: 'Product Lead', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop', status: 'online', color: '#3b82f6' },
  { id: 'u2', name: 'Lars Jansen', role: 'Financial Analyst', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop', status: 'online', color: '#10b981' },
  { id: 'u3', name: 'Emma Bakker', role: 'Design & UX', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop', status: 'away', color: '#8b5cf6' },
  { id: 'u4', name: 'Daan Meijer', role: 'Security Architect', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop', status: 'busy', color: '#f59e0b' },
];

export const initialDocs: OfficeDocument[] = [
  {
    id: 'doc-1',
    title: 'Q4 Strategic Business Plan 2026',
    content: `<h2>1. Executive Summary</h2>
<p>In the fourth quarter of 2026, we accelerate our digital transformation across primary enterprise markets in Europe and North America. Our strategic focus centers on <strong>AI-augmented collaborative workflows</strong>, guaranteed <strong>client-side end-to-end encryption</strong>, and frictionless multi-cloud synchronization for high-compliance teams.</p>

<h2>2. Key Objectives & Key Results (OKRs)</h2>
<ul>
  <li><strong>Revenue Growth:</strong> Deliver 28% ARR expansion in enterprise subscriptions driven by modern cloud productivity tools.</li>
  <li><strong>User Engagement:</strong> Sustain daily active collaborative teams (DAU) at or above 84%.</li>
  <li><strong>Reliability & Security:</strong> Guarantee 99.99% uptime with automated zero-knowledge encrypted backups across multiple cloud vendors.</li>
</ul>

<h2>3. Strategic Pillars</h2>
<p>Our competitive technological edge rests upon three core foundations:</p>
<ol>
  <li><strong>Real-time Co-Authoring:</strong> Low-latency concurrent synchronization across web, tablet, iOS, and Android clients.</li>
  <li><strong>Zero-Knowledge Architecture:</strong> Complete European GDPR and international privacy compliance through client-side 256-bit AES-GCM cryptography.</li>
  <li><strong>Gemini 3.8 AI Assistant:</strong> Context-aware document synthesis, automatic tone adaptation, real-time data analysis, and instant multilingual translation.</li>
</ol>

<blockquote>"Innovation achieves true enterprise value when it systematically reduces daily friction for distributed teams."</blockquote>`,
    lastModified: 'Today, 10:14',
    author: 'Sophie de Vries',
    category: 'Strategy',
    tags: ['Strategy', 'Q4', 'Management'],
    pinned: true,
    isEncrypted: false,
    versions: [
      {
        id: 'v1.2',
        timestamp: 'Today, 10:14',
        author: 'Sophie de Vries',
        title: 'Q4 Strategic Business Plan 2026 (Final Draft)',
        content: 'Final board review approved by executive committee.',
        summary: 'Added OKR metrics, Gemini 3.8 integration milestones, and compliance benchmarks.',
      },
      {
        id: 'v1.1',
        timestamp: 'Yesterday, 16:30',
        author: 'Lars Jansen',
        title: 'Q4 Strategic Business Plan 2026 (Draft 2)',
        content: 'Refined financial budget and growth projections.',
        summary: 'Financial sections updated with CFO feedback.',
      },
      {
        id: 'v1.0',
        timestamp: '3 days ago',
        author: 'Sophie de Vries',
        title: 'Initial Concept: Q4 Business Strategy',
        content: 'Initial brainstorming document.',
        summary: 'Initial document creation.',
      },
    ],
    comments: [
      {
        id: 'c1',
        author: 'Lars Jansen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop',
        timestamp: 'Yesterday 14:22',
        text: 'Did we incorporate the additional DevOps engineering headcount into paragraph 2?',
        resolved: false,
        replies: [
          {
            author: 'Sophie de Vries',
            text: 'Yes! It is fully accounted for in the Q4 infrastructure expansion matrix.',
            timestamp: 'Yesterday 15:05',
          },
        ],
      },
      {
        id: 'c2',
        author: 'Emma Bakker',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
        timestamp: 'Today 09:12',
        text: 'The updated E2EE vault badge icons and dark mode palette are now live in the design system.',
        resolved: true,
      },
    ],
  },
  {
    id: 'doc-2',
    title: 'Enterprise SLA & ISO/IEC 27001 Security Protocol',
    content: `<h2>Service Level Agreement (SLA) & Data Protection</h2>
<p>This document formalizes our standard commitments regarding information security, encryption protocols, and disaster recovery mechanisms.</p>
<h3>1. Encryption in Transit & at Rest</h3>
<p>All communication requires TLS 1.3 with forward secrecy. Client vaults utilize browser-native 256-bit AES-GCM with PBKDF2 key derivation (100,000 iterations).</p>
<h3>2. RPO and RTO Recovery Guarantees</h3>
<p>Recovery Point Objective (RPO) is bounded to 60 seconds thanks to incremental multi-cloud snapshots.</p>`,
    lastModified: 'Yesterday, 14:05',
    author: 'Daan Meijer',
    category: 'Security',
    tags: ['Security', 'ISO27001', 'Compliance'],
    pinned: false,
    isEncrypted: true,
    versions: [],
    comments: [],
  },
];

export const initialSheets: SpreadsheetDoc[] = [
  {
    id: 'sheet-1',
    title: 'Annual Financial Budget & Revenue Forecast 2026',
    lastModified: 'Today, 11:30',
    author: 'Lars Jansen',
    tags: ['Finance', 'Budget', 'Forecast'],
    rowCount: 20,
    colCount: 8,
    chartType: 'bar',
    chartRange: 'B2:F7',
    cells: {
      A1: { value: 'Cost Center / Category', bold: true, align: 'left', bgColor: '#e0f2fe' },
      B1: { value: 'Q1 2026 (€)', bold: true, align: 'right', bgColor: '#e0f2fe' },
      C1: { value: 'Q2 2026 (€)', bold: true, align: 'right', bgColor: '#e0f2fe' },
      D1: { value: 'Q3 2026 (€)', bold: true, align: 'right', bgColor: '#e0f2fe' },
      E1: { value: 'Q4 2026 (€)', bold: true, align: 'right', bgColor: '#e0f2fe' },
      F1: { value: 'Annual Total (€)', bold: true, align: 'right', bgColor: '#bae6fd' },

      A2: { value: 'Cloud SaaS Subscriptions', bold: true },
      B2: { value: '185000', format: 'currency', align: 'right' },
      C2: { value: '210000', format: 'currency', align: 'right' },
      D2: { value: '240000', format: 'currency', align: 'right' },
      E2: { value: '295000', format: 'currency', align: 'right' },
      F2: { value: '=SOM(B2:E2)', format: 'currency', align: 'right', bold: true },

      A3: { value: 'Professional Services' },
      B3: { value: '45000', format: 'currency', align: 'right' },
      C3: { value: '52000', format: 'currency', align: 'right' },
      D3: { value: '58000', format: 'currency', align: 'right' },
      E3: { value: '70000', format: 'currency', align: 'right' },
      F3: { value: '=SOM(B3:E3)', format: 'currency', align: 'right', bold: true },

      A4: { value: 'Infrastructure & Hosting' },
      B4: { value: '32000', format: 'currency', align: 'right' },
      C4: { value: '34000', format: 'currency', align: 'right' },
      D4: { value: '38000', format: 'currency', align: 'right' },
      E4: { value: '42000', format: 'currency', align: 'right' },
      F4: { value: '=SOM(B4:E4)', format: 'currency', align: 'right', bold: true },

      A5: { value: 'Global Marketing & Growth' },
      B5: { value: '50000', format: 'currency', align: 'right' },
      C5: { value: '65000', format: 'currency', align: 'right' },
      D5: { value: '60000', format: 'currency', align: 'right' },
      E5: { value: '80000', format: 'currency', align: 'right' },
      F5: { value: '=SOM(B5:E5)', format: 'currency', align: 'right', bold: true },

      A6: { value: 'R&D / Gemini 3.8 AI Models' },
      B6: { value: '65000', format: 'currency', align: 'right' },
      C6: { value: '72000', format: 'currency', align: 'right' },
      D6: { value: '85000', format: 'currency', align: 'right' },
      E6: { value: '95000', format: 'currency', align: 'right' },
      F6: { value: '=SOM(B6:E6)', format: 'currency', align: 'right', bold: true },

      A7: { value: 'TOTAL EXPENDITURES', bold: true, bgColor: '#f1f5f9' },
      B7: { value: '=SOM(B2:B6)', format: 'currency', align: 'right', bold: true, bgColor: '#f1f5f9' },
      C7: { value: '=SOM(C2:C6)', format: 'currency', align: 'right', bold: true, bgColor: '#f1f5f9' },
      D7: { value: '=SOM(D2:D6)', format: 'currency', align: 'right', bold: true, bgColor: '#f1f5f9' },
      E7: { value: '=SOM(E2:E6)', format: 'currency', align: 'right', bold: true, bgColor: '#f1f5f9' },
      F7: { value: '=SOM(F2:F6)', format: 'currency', align: 'right', bold: true, bgColor: '#e2e8f0' },
    },
  },
];

export const initialSlides: PresentationDoc[] = [
  {
    id: 'slide-1',
    title: 'OmniEnterprise Innovation & AI Pitch Deck',
    lastModified: 'Today, 09:40',
    author: 'Sophie de Vries',
    theme: 'modern-dark',
    tags: ['Pitch', 'Product', 'AI'],
    slides: [
      {
        id: 's1',
        title: 'OmniOffice Pro: The Future of Workspace',
        subtitle: 'All-in-One Cloud Suite with Gemini AI & Military-Grade Encryption',
        bulletPoints: [
          'Documents, Spreadsheets, Presentations & Encrypted Notes',
          'Real-time seamless collaboration for modern distributed teams',
          'Full offline PWA support with zero data loss and automated sync',
        ],
        layout: 'title',
        bgColor: '#0f172a',
        textColor: '#f8fafc',
        notes: 'Welcome stakeholders and introduce our core productivity value proposition.',
      },
      {
        id: 's2',
        title: 'Why Legacy Office Software Fails Modern Teams',
        subtitle: 'Fragmented Tools vs Integrated Workspaces',
        bulletPoints: [
          'Opaque pricing models and enterprise data locked in siloed ecosystems',
          'Clunky mobile experiences and unreliable offline synchronization',
          'Substantial data leakage risks without client-side zero-knowledge encryption',
        ],
        layout: 'content',
        bgColor: '#1e293b',
        textColor: '#f8fafc',
        notes: 'Highlight the 3 largest pain points observed across enterprise interviews.',
      },
      {
        id: 's3',
        title: 'Our Key Superpowers: AI & End-to-End Privacy',
        subtitle: 'Built for the Post-Cloud Collaborative Era',
        bulletPoints: [
          'Gemini 3.8 Flash integration for real-time document drafting and spreadsheet analysis',
          'Native 256-bit AES-GCM Web Crypto vault with biometric touch unlocking',
          'Universal connectors for Google Drive, Microsoft OneDrive, Dropbox & Nextcloud',
        ],
        layout: 'split',
        bgColor: '#172554',
        textColor: '#f8fafc',
        notes: 'Demonstrate live AI formula calculations and one-click slide creation.',
      },
      {
        id: 's4',
        title: 'Traction & Strategic Roadmap 2026-2027',
        subtitle: 'Scaling to 150,000 Active Enterprise Licenses',
        bulletPoints: [
          'Q1-Q2: Global international expansion across EU, UK, and US enterprise markets',
          'Q3: Native mobile offline applications with embedded camera OCR capture',
          'Q4: Enterprise on-premises hybrid federation and custom security governance',
        ],
        layout: 'content',
        bgColor: '#022c22',
        textColor: '#f0fdf4',
        notes: 'Conclude with investment highlights and open the floor for questions.',
      },
    ],
  },
];

export const initialNotes: NoteItem[] = [
  {
    id: 'note-1',
    title: 'Encrypted Vault: Master API Configurations & Keys',
    content: 'Client ID: omni-enterprise-v4\nDatabase Partition: eu-central-prod\nVault Key encrypted using WebCrypto PBKDF2 (100k rounds) with AES-GCM 256.',
    lastModified: 'Today 08:30',
    isLocked: true,
    color: '#fee2e2',
    tags: ['Security', 'Vault', 'Confidential'],
    attachments: [
      { name: 'architecture_diagram.png', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop', type: 'image' },
    ],
  },
  {
    id: 'note-2',
    title: 'Gemini 3.8 Spreadsheet Assistant Architecture',
    content: '1. Automatic chart recommendations based on column types and range headers.\n2. Natural language queries ("What is the highest quarterly expenditure?") mapped to `=MAX(B7:E7)`.\n3. Outlier and trend anomaly detection with color highlighting.',
    lastModified: 'Yesterday 17:15',
    isLocked: false,
    color: '#fef3c7',
    tags: ['AI', 'Sheets', 'Innovation'],
  },
  {
    id: 'note-3',
    title: 'Checklist: ISO 27001 Security Audit Preparation',
    content: '• Disaster recovery backup restore simulation (RTO < 15 min)\n• Quarterly role-based access privilege review\n• End-to-end encryption key rotation drill validation\n• Incident response operational playbook synchronization',
    lastModified: '3 days ago',
    isLocked: false,
    color: '#dcfce7',
    tags: ['Audit', 'Compliance', 'ISO'],
  },
];

export const initialTasks: TaskItem[] = [
  {
    id: 't1',
    title: 'Finalize and sign Q4 Strategic Business Plan 2026',
    description: 'Review final feedback with executive leadership and apply cryptographic signature.',
    dueDate: '2026-11-12',
    priority: 'urgent',
    completed: false,
    assignedTo: 'Sophie de Vries',
    linkedDocId: 'doc-1',
    category: 'Management',
  },
  {
    id: 't2',
    title: 'Align financial forecast model with Lars & CFO',
    description: 'Verify Q4 budget assumptions and R&D generative AI allocations.',
    dueDate: '2026-11-14',
    priority: 'high',
    completed: false,
    assignedTo: 'Lars Jansen',
    linkedDocId: 'sheet-1',
    category: 'Finance',
  },
  {
    id: 't3',
    title: 'Rehearse investor pitch presentation with Emma',
    description: 'Verify slide transition pacing and speaker notes alignment.',
    dueDate: '2026-11-16',
    priority: 'medium',
    completed: false,
    assignedTo: 'Emma Bakker',
    linkedDocId: 'slide-1',
    category: 'Presentations',
  },
  {
    id: 't4',
    title: 'Validate multi-cloud automated backup snapshot',
    description: 'Confirm sync parity across Google Drive and Nextcloud instances.',
    dueDate: '2026-11-10',
    priority: 'low',
    completed: true,
    assignedTo: 'Daan Meijer',
    category: 'Infrastructure',
  },
];

export const initialCloudProviders: CloudProviderInfo[] = [
  { id: 'gdrive', name: 'Google Drive', connected: true, storageUsedMb: 4200, storageTotalMb: 15000, lastSync: '1 minute ago', iconName: 'hard-drive' },
  { id: 'onedrive', name: 'Microsoft OneDrive', connected: true, storageUsedMb: 1800, storageTotalMb: 5000, lastSync: '5 minutes ago', iconName: 'cloud' },
  { id: 'dropbox', name: 'Dropbox Business', connected: false, storageUsedMb: 0, storageTotalMb: 2000, lastSync: 'Not connected', iconName: 'folder-archive' },
  { id: 'nextcloud', name: 'Nextcloud Enterprise', connected: true, storageUsedMb: 9400, storageTotalMb: 50000, lastSync: 'Real-time active', iconName: 'server' },
];

export const initialActivityLogs: ActivityLogItem[] = [
  { id: 'act-1', user: 'Sophie de Vries', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop', action: 'saved checkpoint v1.2 in', target: 'Q4 Strategic Business Plan 2026', timestamp: '10:14' },
  { id: 'act-2', user: 'Lars Jansen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop', action: 'updated formulas in', target: 'Annual Financial Budget 2026', timestamp: '11:30' },
  { id: 'act-3', user: 'Emma Bakker', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop', action: 'replied to comment in', target: 'Q4 Business Plan', timestamp: '09:12' },
  { id: 'act-4', user: 'Daan Meijer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop', action: 'verified E2EE security vault in', target: 'Security Protocol ISO 27001', timestamp: 'Yesterday' },
];

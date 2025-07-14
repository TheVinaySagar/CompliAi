export interface AuthUser {
  id: string
  name: string
  email: string
  role: "Viewer" | "Editor" | "Admin"
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
}



export interface User {
  id: string
  name: string
  email: string
  role: "Viewer" | "Editor" | "Admin"
}

export interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
  hasGenerateButton?: boolean
  suggestedAction?: string
}

export interface Policy {
  id: string
  title: string
  description: string
  framework: string
  status: "Draft" | "Active" | "Under Review"
  lastUpdated: Date
  content: string
  type: string
}

export interface SummaryCard {
  title: string
  value: string
  description: string
  icon: string
  trend?: "up" | "down" | "stable"
  trendValue?: string
}

export interface UploadedFile {
  id: string
  name: string
  size: string
  uploadDate: Date
  extractedPolicies: number
  mappedControls: number
  status: "Processing" | "Completed" | "Failed"
}

export interface ControlMapping {
  id: string
  section: string
  mappedTo: string
  framework: string
  confidence: "High" | "Medium" | "Low"
  status: "Mapped" | "Gap" | "Needs Review"
  description: string
}

export interface AuditTask {
  id: string
  title: string
  description: string
  framework: string
  priority: "High" | "Medium" | "Low"
  status: "Not Started" | "In Progress" | "Completed"
  assignee?: string
  dueDate: Date
  category: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: "Viewer" | "Editor" | "Admin"
  status: "Active" | "Pending" | "Inactive"
  joinDate: Date
}

export interface ComplianceFramework {
  id: string
  name: string
  description: string
  totalControls: number
  mappedControls: number
  coverage: number
}


export const dummyMessages: Message[] = [
  {
    id: "1",
    content: "What does ISO 27001 A.9.4.1 mean?",
    sender: "user",
    timestamp: new Date("2024-01-15T10:30:00"),
  },
  {
    id: "2",
    content: `ISO 27001 A.9.4.1 relates to "Information access restriction" control. It requires organizations to restrict access to information and application system functions based on the access control policy.

**Key Requirements:**
- Implement proper authentication mechanisms
- Authorization procedures based on business needs
- Regular review and update of access rights
- Principle of least privilege

**Real-world Example:**
A company should ensure that HR staff can only access employee records, while IT staff have access to system configurations but not sensitive business data.`,
    sender: "assistant",
    timestamp: new Date("2024-01-15T10:30:15"),
    hasGenerateButton: true,
    suggestedAction: "Generate Access Control Policy",
  },
  {
    id: "3",
    content: "Do I need a BYOD policy for SOC 2?",
    sender: "user",
    timestamp: new Date("2024-01-15T10:35:00"),
  },
  {
    id: "4",
    content: `Yes, a BYOD (Bring Your Own Device) policy is essential for SOC 2 compliance, particularly for the Security and Confidentiality criteria.

**SOC 2 Requirements:**
- CC6.1: Logical and physical access controls
- CC6.7: Data transmission controls
- CC7.1: Data classification and handling

**Your BYOD policy should include:**
- Device registration and approval process
- Security requirements (encryption, passcodes)
- Remote wipe capabilities
- Acceptable use guidelines
- Data segregation requirements`,
    sender: "assistant",
    timestamp: new Date("2024-01-15T10:35:20"),
    hasGenerateButton: true,
    suggestedAction: "Generate BYOD Policy",
  },
]

export const dummySummaryCards: SummaryCard[] = [
  {
    title: "Policies Uploaded",
    value: "12",
    description: "Documents processed this month",
    icon: "📄",
    trend: "up",
    trendValue: "+3",
  },
  {
    title: "Controls Mapped",
    value: "87",
    description: "Compliance controls identified",
    icon: "🎯",
    trend: "up",
    trendValue: "+12",
  },
  {
    title: "Audit Progress",
    value: "73%",
    description: "ISO 27001 readiness",
    icon: "📊",
    trend: "up",
    trendValue: "+8%",
  },
  {
    title: "Active Policies",
    value: "24",
    description: "Currently enforced policies",
    icon: "✅",
    trend: "stable",
    trendValue: "0",
  },
]

export const dummyPolicies: Policy[] = [
  {
    id: "1",
    title: "Access Control Policy",
    description: "Defines user access management and authentication procedures",
    framework: "ISO 27001",
    status: "Active",
    lastUpdated: new Date("2024-01-10"),
    type: "Security Policy",
    content: `# Access Control Policy

## Purpose
This policy establishes the framework for managing user access to information systems and data within the organization.

## Scope
This policy applies to all employees, contractors, and third parties who require access to organizational information systems.

## Policy Statement
Access to information systems shall be controlled based on business requirements and risk assessment. All access must be authorized, documented, and regularly reviewed.

## Key Requirements
1. User access must be granted based on the principle of least privilege
2. All access requests must be approved by the data owner
3. Access rights must be reviewed quarterly
4. Terminated employees' access must be revoked immediately

## Compliance
This policy supports compliance with ISO 27001 controls A.9.1.1, A.9.2.1, and A.9.4.1.`,
  },
  {
    id: "2",
    title: "Data Retention Policy",
    description: "Guidelines for data lifecycle management and disposal",
    framework: "GDPR",
    status: "Draft",
    lastUpdated: new Date("2024-01-12"),
    type: "Data Management",
    content: `# Data Retention Policy

## Purpose
This policy defines how long different types of data should be retained and the procedures for secure disposal.

## Scope
This policy covers all data collected, processed, and stored by the organization.

## Retention Periods
- Customer data: 7 years after contract termination
- Employee records: 7 years after employment ends
- Financial records: 10 years
- Marketing data: 2 years or until consent withdrawal

## Disposal Procedures
1. Data must be securely deleted using approved methods
2. Physical media must be destroyed or sanitized
3. Disposal activities must be logged and verified

## Compliance
This policy ensures compliance with GDPR Article 5(1)(e) and supports data minimization principles.`,
  },
  {
    id: "3",
    title: "BYOD Policy",
    description: "Bring Your Own Device security requirements and procedures",
    framework: "SOC 2",
    status: "Active",
    lastUpdated: new Date("2024-01-14"),
    type: "Security Policy",
    content: `# Bring Your Own Device (BYOD) Policy

## Purpose
This policy establishes security requirements for personal devices used to access company data and systems.

## Scope
This policy applies to all employees, contractors, and authorized third parties using personal devices for business purposes.

## Device Requirements
- Device registration through IT department
- Minimum OS version requirements
- Mandatory encryption for data storage
- Strong authentication (PIN, biometric, or password)
- Automatic screen lock after 5 minutes of inactivity

## Security Controls
- Mobile Device Management (MDM) enrollment
- Remote wipe capability
- Prohibited applications list
- Regular security updates
- Network access restrictions

## Data Handling
- Company data must be stored in approved applications only
- No local storage of sensitive data
- Automatic backup to company-approved cloud services
- Data segregation between personal and business use

## Compliance
Supports SOC 2 Type II controls CC6.1, CC6.7, and CC7.1.`,
  },
]

export const dummyUploadedFiles: UploadedFile[] = [
  {
    id: "1",
    name: "IT_Security_Manual_v2.pdf",
    size: "2.4 MB",
    uploadDate: new Date("2024-01-15"),
    extractedPolicies: 8,
    mappedControls: 15,
    status: "Completed",
  },
  {
    id: "2",
    name: "Employee_Handbook_2024.docx",
    size: "1.8 MB",
    uploadDate: new Date("2024-01-14"),
    extractedPolicies: 5,
    mappedControls: 8,
    status: "Completed",
  },
  {
    id: "3",
    name: "Incident_Response_Plan.pdf",
    size: "1.2 MB",
    uploadDate: new Date("2024-01-13"),
    extractedPolicies: 3,
    mappedControls: 12,
    status: "Processing",
  },
]

export const dummyControlMappings: ControlMapping[] = [
  {
    id: "1",
    section: "User Access Management",
    mappedTo: "ISO 27001 A.9.2.1",
    framework: "ISO 27001",
    confidence: "High",
    status: "Mapped",
    description: "User registration and de-registration procedures",
  },
  {
    id: "2",
    section: "Password Policy",
    mappedTo: "ISO 27001 A.9.4.3",
    framework: "ISO 27001",
    confidence: "High",
    status: "Mapped",
    description: "Password management system requirements",
  },
  {
    id: "3",
    section: "Data Backup Procedures",
    mappedTo: "ISO 27001 A.12.3.1",
    framework: "ISO 27001",
    confidence: "Medium",
    status: "Needs Review",
    description: "Information backup procedures need enhancement",
  },
  {
    id: "4",
    section: "Mobile Device Security",
    mappedTo: "SOC 2 CC6.1",
    framework: "SOC 2",
    confidence: "High",
    status: "Mapped",
    description: "Logical and physical access controls for mobile devices",
  },
  {
    id: "5",
    section: "Vendor Management",
    mappedTo: "ISO 27001 A.15.1.1",
    framework: "ISO 27001",
    confidence: "Low",
    status: "Gap",
    description: "Information security policy for supplier relationships missing",
  },
]

export const dummyAuditTasks: AuditTask[] = [
  {
    id: "1",
    title: "Complete Risk Assessment Documentation",
    description: "Document and update the information security risk assessment process",
    framework: "ISO 27001",
    priority: "High",
    status: "In Progress",
    assignee: "Sarah Johnson",
    dueDate: new Date("2024-02-15"),
    category: "Risk Management",
  },
  {
    id: "2",
    title: "Implement Access Review Process",
    description: "Establish quarterly access rights review procedures",
    framework: "ISO 27001",
    priority: "High",
    status: "Not Started",
    assignee: "John Smith",
    dueDate: new Date("2024-02-20"),
    category: "Access Control",
  },
  {
    id: "3",
    title: "Update Incident Response Plan",
    description: "Review and update incident response procedures with recent changes",
    framework: "ISO 27001",
    priority: "Medium",
    status: "Completed",
    assignee: "Alice Brown",
    dueDate: new Date("2024-01-30"),
    category: "Incident Management",
  },
  {
    id: "4",
    title: "Vendor Security Assessment",
    description: "Conduct security assessments for all critical vendors",
    framework: "SOC 2",
    priority: "Medium",
    status: "Not Started",
    dueDate: new Date("2024-03-01"),
    category: "Vendor Management",
  },
]

export const dummyTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@company.com",
    role: "Admin",
    status: "Active",
    joinDate: new Date("2023-06-15"),
  },
  {
    id: "2",
    name: "John Smith",
    email: "john@company.com",
    role: "Editor",
    status: "Active",
    joinDate: new Date("2023-08-20"),
  },
  {
    id: "3",
    name: "Alice Brown",
    email: "alice@company.com",
    role: "Viewer",
    status: "Active",
    joinDate: new Date("2023-11-10"),
  },
  {
    id: "4",
    name: "Mike Wilson",
    email: "mike@company.com",
    role: "Editor",
    status: "Pending",
    joinDate: new Date("2024-01-15"),
  },
]

export const dummyFrameworks: ComplianceFramework[] = [
  {
    id: "1",
    name: "ISO 27001",
    description: "Information Security Management System",
    totalControls: 114,
    mappedControls: 87,
    coverage: 76,
  },
  {
    id: "2",
    name: "SOC 2 Type II",
    description: "Service Organization Control 2",
    totalControls: 64,
    mappedControls: 45,
    coverage: 70,
  },
  {
    id: "3",
    name: "GDPR",
    description: "General Data Protection Regulation",
    totalControls: 47,
    mappedControls: 32,
    coverage: 68,
  },
  {
    id: "4",
    name: "NIST CSF",
    description: "Cybersecurity Framework",
    totalControls: 108,
    mappedControls: 54,
    coverage: 50,
  },
]

export interface AuthUser {
  id: string
  name: string
  email: string
  role: "Viewer" | "Admin"
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

// Dummy users for authentication
export const dummyUsers = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@company.com",
    password: "password123",
    role: "Admin" as const,
  },
  {
    id: "2",
    name: "John Smith",
    email: "john@company.com",
    password: "password123",
    role: "Viewer" as const,
  },
]

export interface User {
  id: string
  name: string
  email: string
  role: "Viewer" | "Admin"
}

export interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
}

export interface Policy {
  id: string
  title: string
  description: string
  framework: string
  status: "Draft" | "Active" | "Under Review"
  lastUpdated: Date
  content: string
}

export interface SummaryCard {
  title: string
  value: string
  description: string
  icon: string
}

export interface UploadedFile {
  id: string
  name: string
  size: string
  uploadDate: Date
  extractedPolicies: number
  mappedControls: number
}

// Dummy data
export const dummyUser: User = {
  id: "1",
  name: "Sarah Johnson",
  email: "sarah.johnson@company.com",
  role: "Admin",
}

export const dummyMessages: Message[] = [
  {
    id: "1",
    content: "What is ISO 27001 A.9.4.1?",
    sender: "user",
    timestamp: new Date("2024-01-15T10:30:00"),
  },
  {
    id: "2",
    content:
      'ISO 27001 A.9.4.1 relates to "Information access restriction" control. It requires organizations to restrict access to information and application system functions based on the access control policy. This includes implementing proper authentication mechanisms, authorization procedures, and ensuring that access rights are regularly reviewed and updated.',
    sender: "assistant",
    timestamp: new Date("2024-01-15T10:30:15"),
  },
  {
    id: "3",
    content: "Can you help me create a data retention policy?",
    sender: "user",
    timestamp: new Date("2024-01-15T10:35:00"),
  },
  {
    id: "4",
    content:
      "I'd be happy to help you create a data retention policy. A comprehensive data retention policy should include: 1) Data classification and categories, 2) Retention periods for different data types, 3) Disposal procedures, 4) Legal and regulatory requirements, 5) Roles and responsibilities. Would you like me to generate a template based on a specific compliance framework?",
    sender: "assistant",
    timestamp: new Date("2024-01-15T10:35:20"),
  },
]

export const dummySummaryCards: SummaryCard[] = [
  {
    title: "Policies Uploaded",
    value: "2",
    description: "Documents processed this month",
    icon: "📄",
  },
  {
    title: "Controls Mapped",
    value: "5",
    description: "Compliance controls identified",
    icon: "🎯",
  },
  {
    title: "Compliance Score",
    value: "87%",
    description: "Overall compliance rating",
    icon: "📊",
  },
  {
    title: "Active Policies",
    value: "12",
    description: "Currently enforced policies",
    icon: "✅",
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
    title: "Incident Response Policy",
    description: "Procedures for handling security incidents and breaches",
    framework: "NIST",
    status: "Under Review",
    lastUpdated: new Date("2024-01-08"),
    content: `# Incident Response Policy

## Purpose
This policy establishes procedures for detecting, responding to, and recovering from security incidents.

## Incident Classification
- Low: Minor security events with minimal impact
- Medium: Events that could affect business operations
- High: Critical incidents requiring immediate response
- Critical: Major breaches affecting customer data

## Response Team
- Incident Commander: CISO
- Technical Lead: IT Security Manager
- Communications Lead: Legal Counsel
- Business Lead: Operations Manager

## Response Procedures
1. Detection and Analysis
2. Containment and Eradication
3. Recovery and Post-Incident Activities
4. Documentation and Lessons Learned

## Compliance
Aligns with NIST SP 800-61 incident handling guidelines.`,
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
  },
  {
    id: "2",
    name: "Employee_Handbook_2024.docx",
    size: "1.8 MB",
    uploadDate: new Date("2024-01-14"),
    extractedPolicies: 5,
    mappedControls: 8,
  },
]

// // "use client"

// // import { useEffect, useState } from "react"
// // import { useRouter, useParams } from "next/navigation"
// // import { apiClient } from "@/lib/api-client"
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// // import { Progress } from "@/components/ui/progress"
// // import { Database, AlertCircle } from "lucide-react"

// // export default function DocumentMappingPage() {
// //   const router = useRouter()
// //   const params = useParams()
// //   const documentId = params?.document_id as string
// //   const [mapping, setMapping] = useState<any>(null)
// //   const [loading, setLoading] = useState(true)
// //   const [error, setError] = useState<string | null>(null)

// //   useEffect(() => {
// //     if (!documentId) return
// //     setLoading(true)
// //     apiClient
// //       .getDocumentMapping(documentId)
// //       .then((res) => {
// //         if (res.success && res.data) {
// //           setMapping(res.data.framework_mapping)
// //         } else {
// //           setError(res.error || "Failed to load mapping data")
// //         }
// //       })
// //       .catch((err) => setError(err.message || "Network error"))
// //       .finally(() => setLoading(false))
// //   }, [documentId])

// //   if (loading) {
// //     return (
// //       <div className="p-8 flex flex-col items-center">
// //         <Database className="h-10 w-10 text-blue-400 animate-spin mb-4" />
// //         <div className="text-lg text-gray-700">Loading mapping results...</div>
// //       </div>
// //     )
// //   }

// //   if (error) {
// //     return (
// //       <div className="p-8 flex flex-col items-center">
// //         <AlertCircle className="h-10 w-10 text-red-400 mb-4" />
// //         <div className="text-lg text-red-700">{error}</div>
// //         <button className="mt-4 text-blue-600 underline" onClick={() => router.back()}>
// //           Go Back
// //         </button>
// //       </div>
// //     )
// //   }

// //   if (!mapping) {
// //     return (
// //       <div className="p-8 flex flex-col items-center">
// //         <AlertCircle className="h-10 w-10 text-yellow-400 mb-4" />
// //         <div className="text-lg text-yellow-700">No mapping data found for this document.</div>
// //         <button className="mt-4 text-blue-600 underline" onClick={() => router.back()}>
// //           Go Back
// //         </button>
// //       </div>
// //     )
// //   }

// //   // Prepare summary for chart
// //   const frameworks = Object.keys(mapping)
// //   const summary = frameworks.map((fw) => {
// //     const covered = mapping[fw].covered.length
// //     const missing = mapping[fw].missing.length
// //     const total = covered + missing
// //     return { fw, covered, missing, total }
// //   })

// //   return (
// //     <div className="p-6 max-w-4xl mx-auto">
// //       <h1 className="text-2xl font-bold mb-2 text-gray-900">Compliance Mapping Results</h1>
// //       <p className="text-gray-600 mb-6">Document ID: <span className="font-mono text-blue-700">{documentId}</span></p>

// //       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
// //         {summary.map(({ fw, covered, missing, total }) => (
// //           <Card key={fw}>
// //             <CardHeader>
// //               <CardTitle className="text-lg">{fw.replace(/_/g, " ")}</CardTitle>
// //             </CardHeader>
// //             <CardContent>
// //               <div className="mb-2 flex justify-between text-sm">
// //                 <span>Coverage</span>
// //                 <span className="font-medium">{total === 0 ? "N/A" : Math.round((covered / total) * 100)}%</span>
// //               </div>
// //               <Progress value={total === 0 ? 0 : (covered / total) * 100} className="h-2 mb-2" />
// //               <div className="flex justify-between text-xs text-gray-500">
// //                 <span>{covered} covered</span>
// //                 <span>{missing} missing</span>
// //                 <span>{total} total</span>
// //               </div>
// //             </CardContent>
// //           </Card>
// //         ))}
// //       </div>

// //       <div className="bg-white shadow rounded-lg overflow-x-auto">
// //         <table className="min-w-full divide-y divide-gray-200">
// //           <thead className="bg-gray-50">
// //             <tr>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Framework</th>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Covered Controls</th>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Missing Controls</th>
// //             </tr>
// //           </thead>
// //           <tbody className="bg-white divide-y divide-gray-200">
// //             {frameworks.map((fw) => (
// //               <tr key={fw}>
// //                 <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{fw.replace(/_/g, " ")}</td>
// //                 <td className="px-6 py-4 whitespace-nowrap text-green-700">
// //                   {mapping[fw].covered.length > 0 ? (
// //                     <ul className="list-disc ml-4">
// //                       {mapping[fw].covered.map((ctrl: string) => (
// //                         <li key={ctrl}>{ctrl}</li>
// //                       ))}
// //                     </ul>
// //                   ) : (
// //                     <span className="text-gray-400">None</span>
// //                   )}
// //                 </td>
// //                 <td className="px-6 py-4 whitespace-nowrap text-red-700">
// //                   {mapping[fw].missing.length > 0 ? (
// //                     <ul className="list-disc ml-4">
// //                       {mapping[fw].missing.map((ctrl: string) => (
// //                         <li key={ctrl}>{ctrl}</li>
// //                       ))}
// //                     </ul>
// //                   ) : (
// //                     <span className="text-gray-400">None</span>
// //                   )}
// //                 </td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>
// //     </div>
// //   )
// // } 

// // import React, { useState } from "react";
// // import { useEffect } from "react";
// // import { Card, CardContent } from "@/components/ui/card";
// // import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// // import { ScrollArea } from "@/components/ui/scroll-area";
// // import { useRouter } from "next/router";
// // import { useParams } from "next/navigation";
// // import { apiClient } from "@/lib/api-client";
// // import { AlertCircle, Database } from "lucide-react";

// // type Mapping = {
// //   framework: string;
// //   control_id: string;
// //   control_title: string;
// //   mapping_confidence: string;
// //   rationale: string;
// // };

// // type MappedControl = {
// //   extracted_statement: string;
// //   ai_control_summary: string;
// //   mappings: Mapping[];
// // };

// // type Gap = {
// //   control_id: string;
// //   control_title: string;
// //   description: string;
// // };

// // const data = {'analysis_summary': {'document_character_count': 7183, 'identified_controls_count': 17, 'frameworks_analyzed': ['ISO 27001', 'SOC 2', 'NIST'
// //         ]
// //     }, 'mapped_controls': [
// //         {'extracted_statement': 'This Acceptable Use Policy (this “ Policy”) generally aligns with the information security management systems standards published by the International Organization for Standardization (ISO) and the International Electrotechnical Commission (EC) as more specifically set forth in ISO 27001 and 27002.', 'ai_control_summary': 'The organization establishes and maintains an Acceptable Use Policy that is aligned with the ISO 27001/27002 standards.', 'mappings': [
// //                 {'framework': 'ISO 27001', 'control_id': 'A.5.1', 'control_title': 'Policies for information security', 'mapping_confidence': 'High', 'rationale': 'The statement explicitly declares the existence and alignment of a key information security policy.'
// //                 },
// //                 {'framework': 'NIST SP 800-53', 'control_id': 'PL-2', 'control_title': 'System Security and Privacy Plans', 'mapping_confidence': 'Medium', 'rationale': 'An AUP is a component of the overall system security plan that communicates rules of behavior to users.'
// //                 }
// //             ]
// //         },
// //         {'extracted_statement': 'Internet/Intranet/Extranet-related systems... are the property of Company. These systems are generally only to be used for business purposes in serving the interests of Company, and of Company’s clients and customers in the course of normal operations.', 'ai_control_summary': 'Company assets, including computer systems, are designated for business use, with personal use being an exception guided by departmental policies.', 'mappings': [
// //                 {'framework': 'ISO 27001', 'control_id': 'A.8.1.3', 'control_title': 'Acceptable use of information and other associated assets', 'mapping_confidence': 'High', 'rationale': 'This directly defines the rules for the acceptable use of company information and IT assets.'
// //                 },
// //                 {'framework': 'SOC 2', 'control_id': 'CC6.8', 'control_title': 'Implementation of Controls to Prevent or Detect and Act upon the Introduction of Unauthorized or Malicious Software', 'mapping_confidence': 'Medium', 'rationale': 'Restricting systems to business purposes is a preventive measure against introducing unauthorized software.'
// //                 }
// //             ]
// //         },
// //         {'extracted_statement': 'You are required to promptly report the theft, loss or unauthorized disclosure of Company proprietary information, or any other Information Security Incident.', 'ai_control_summary': 'Users are mandated to report all information security incidents, including theft, loss, or unauthorized disclosure of data, without delay.', 'mappings': [
// //                 {'framework': 'ISO 27001', 'control_id': 'A.5.26', 'control_title': 'Assessment and decision on information security events', 'mapping_confidence': 'High', 'rationale': 'This control requires users to report observed security events, which is the first step in the incident management process.'
// //                 },
// //                 {'framework': 'SOC 2', 'control_id': 'CC7.3', 'control_title': 'Security Incident Response', 'mapping_confidence': 'High', 'rationale': 'Prompt reporting by users is a critical component of an effective incident response plan.'
// //                 },
// //                 {'framework': 'NIST SP 800-53', 'control_id': 'IR-6', 'control_title': 'Incident Reporting', 'mapping_confidence': 'High', 'rationale': 'The statement directly implements the requirement for personnel to report suspected incidents to the appropriate authority.'
// //                 }
// //             ]
// //         },
// //         {'extracted_statement': 'You may access, use or disclose Company proprietary information only to the extent it is authorized and necessary to fulfill your assigned job duties.', 'ai_control_summary': "The principle of least privilege is enforced, restricting access to proprietary information to only what is necessary for an individual's job function.", 'mappings': [
// //                 {'framework': 'ISO 27001', 'control_id': 'A.5.15', 'control_title': 'Access control', 'mapping_confidence': 'High', 'rationale': "This statement defines a core rule of the organization's access control policy, limiting access based on business need."
// //                 },
// //                 {'framework': 'NIST SP 800-53', 'control_id': 'AC-6', 'control_title': 'Least Privilege', 'mapping_confidence': 'High', 'rationale': 'This is a direct implementation of the principle of least privilege, ensuring users have access only to what is required for their duties.'
// //                 }
// //             ]
// //         },
// //         {'extracted_statement': 'For security and network maintenance purposes, authorized Company personnel may monitor equipment, systems and network traffic per Infosec’s Audit Policy.', 'ai_control_summary': 'The company reserves the right to monitor systems and network traffic for security and maintenance, as defined in a separate Audit Policy.', 'mappings': [
// //                 {'framework': 'ISO 27001', 'control_id': 'A.8.16', 'control_title': 'Monitoring activities', 'mapping_confidence': 'High', 'rationale': 'This control explicitly states that network and system monitoring is performed to detect anomalous activities.'
// //                 },
// //                 {'framework': 'SOC 2', 'control_id': 'CC7.1', 'control_title': 'Monitoring of Controls', 'mapping_confidence': 'High', 'rationale': 'This statement describes the use of detection and monitoring procedures to identify potential security events.'
// //                 },
// //                 {'framework': 'NIST SP 800-53', 'control_id': 'SI-4', 'control_title': 'System Monitoring', 'mapping_confidence': 'High', 'rationale': "The policy establishes the organization's authority and intent to monitor information systems."
// //                 }
// //             ]
// //         },
// //         {'extracted_statement': 'All mobile and computing devices that connect to Company’s internal network must comply with the Minimum Access Policy.', 'ai_control_summary': 'A baseline security configuration (Minimum Access Policy) is required for all devices, including mobile ones, before they can connect to the internal network.', 'mappings': [
// //                 {'framework': 'ISO 27001', 'control_id': 'A.8.20', 'control_title': 'Network security', 'mapping_confidence': 'Medium', 'rationale': 'This is a form of network access control, ensuring devices meet security requirements before connection.'
// //                 },
// //                 {'framework': 'NIST SP 800-53', 'control_id': 'AC-20', 'control_title': 'Use of External Information Systems', 'mapping_confidence': 'High', 'rationale': 'This control addresses the security requirements for connecting external systems (e.g., employee-owned devices) to the network.'
// //                 }
// //             ]
// //         },
// //         {'extracted_statement': 'System-level and user-level passwords must comply with the Password Policy. Providing access to your passwords to another individual... is prohibited.', 'ai_control_summary': 'Users must adhere to a formal Password Policy for creating and managing passwords, and sharing passwords is strictly forbidden.', 'mappings': [
// //                 {'framework': 'ISO 27001', 'control_id': 'A.5.17', 'control_title': 'Authentication information', 'mapping_confidence': 'High', 'rationale': 'This directly addresses the management and protection of user authentication information (passwords).'
// //                 },
// //                 {'framework': 'SOC 2', 'control_id': 'CC6.2', 'control_title': 'Credential Issuance and Management', 'mapping_confidence': 'High', 'rationale': 'This control covers the management of authentication credentials, including policies that prohibit sharing.'
// //                 },
// //                 {'framework': 'NIST SP 800-53', 'control_id': 'IA-5', 'control_title': 'Authenticator Management', 'mapping_confidence': 'High', 'rationale': 'The statement enforces key requirements of authenticator management, such as protecting them from unauthorized disclosure.'
// //                 }
// //             ]
// //         },
// //         {'extracted_statement': 'All mobile and computing devices must be secured with a password-protected screensaver that is automatically activated after 10 minutes of inactivity or less.', 'ai_control_summary': 'An automatic screen lock, protected by a password, is required on all computers and mobile devices after a maximum of 10 minutes of inactivity.', 'mappings': [
// //                 {'framework': 'ISO 27001', 'control_id': 'A.7.7', 'control_title': 'Clear desk and clear screen', 'mapping_confidence': 'High', 'rationale': 'This is a specific implementation of a clear screen policy to protect information on unattended equipment.'
// //                 },
// //                 {'framework': 'NIST SP 800-53', 'control_id': 'AC-11', 'control_title': 'Session Lock', 'mapping_confidence': 'High', 'rationale': 'This directly maps to the requirement to prevent further access to a system by initiating a session lock after a defined period of inactivity.'
// //                 }
// //             ]
// //         },
// //         {'extracted_statement': 'You must lock the device’s screen or log off when the device is unattended.', 'ai_control_summary': 'Users are required to manually lock their screens or log off from their devices whenever they leave them unattended.', 'mappings': [
// //                 {'framework': 'ISO 27001', 'control_id': 'A.7.7', 'control_title': 'Clear desk and clear screen', 'mapping_confidence': 'High', 'rationale': 'This is a user responsibility that directly supports the clear screen policy objective.'
// //                 },
// //                 {'framework': 'NIST SP 800-53', 'control_id': 'AC-11', 'control_title': 'Session Lock', 'mapping_confidence': 'Medium', 'rationale': 'While AC-11 focuses on automatic locking, this manual locking requirement is a complementary user-initiated control to achieve the same goal.'
// //                 }
// //             ]
// //         },
// //         {'extracted_statement': 'You must use extreme caution when opening e-mail attachments received from unknown senders or which are otherwise not expected and suspicious, since such attachments may contain viruses and other malicious code.', 'ai_control_summary': 'Users are trained and required to be vigilant about suspicious emails and attachments from unknown sources to prevent malware infections.', 'mappings': [
// //                 {'framework': 'ISO 27001', 'control_id': 'A.6.3', 'control_title': 'Information security awareness, education and training', 'mapping_confidence': 'High', 'rationale': 'This is a specific instruction and awareness message provided to users to help them recognize and respond to threats.'
// //                 },
// //                 {'framework': 'NIST SP 800-53', 'control_id': 'AT-2', 'control_title': 'Security Awareness Training', 'mapping_confidence': 'High', 'rationale': 'This statement is a key element of security awareness training, specifically addressing phishing and malicious attachment threats.'
// //                 }
// //             ]
// //         },
// //         {'extracted_statement': 'Violating the rights of any person or company under copyright, trade secret, patent or other intellectual property laws, such as by installing or distributing “pirated” or other software products that are not appropriately licensed for use by Company.', 'ai_control_summary': "The use of company systems to violate intellectual property rights, including the use of unlicensed or 'pirated' software, is strictly prohibited.", 'mappings': [
// //                 {'framework': 'ISO 27001', 'control_id': 'A.5.32', 'control_title': 'Intellectual property rights', 'mapping_confidence': 'High', 'rationale': 'This control directly implements procedures to ensure compliance with intellectual property rights.'
// //                 },
// //                 {'framework': 'NIST SP 800-53', 'control_id': 'SA-10', 'control_title': 'Developer Configuration Management', 'mapping_confidence': 'Medium', 'rationale': 'Part of managing software includes ensuring proper licensing, which this control addresses from a user behavior perspective.'
// //                 }
// //             ]
// //         },
// //         {'extracted_statement': 'Introducing malicious programs (e.g., viruses, worms, Trojan horses, e-mail bombs, etc.) to the Company network or server, or any other Computer System.', 'ai_control_summary': "Users are explicitly forbidden from introducing any form of malicious software or code onto the company's network or systems.", 'mappings': [
// //                 {'framework': 'ISO 27001', 'control_id': 'A.8.7', 'control_title': 'Protection against malware', 'mapping_confidence': 'High', 'rationale': 'This is a preventive policy control that complements technical anti-malware solutions by prohibiting user actions that could introduce malware.'
// //                 },
// //                 {'framework': 'NIST SP 800-53', 'control_id': 'SI-3', 'control_title': 'Malicious Code Protection', 'mapping_confidence': 'High', 'rationale': 'This policy statement is a non-technical control that supports the overall malicious code protection strategy.'
// //                 }
// //             ]
// //         },
// //         {'extracted_statement': 'Revealing your account password to, or allowing use of your account by third parties. For example, you may not share your account password with family or other household members when conducting work outside of the office.', 'ai_control_summary': 'Password sharing is strictly prohibited, and users are not allowed to let any third party, including family, use their company account.', 'mappings': [
// //                 {'framework': 'ISO 27001', 'control_id': 'A.5.17', 'control_title': 'Authentication information', 'mapping_confidence': 'High', 'rationale': 'This is a specific rule governing the protection of authentication information, explicitly forbidding sharing.'
// //                 },
// //                 {'framework': 'NIST SP 800-53', 'control_id': 'IA-5(1)', 'control_title': 'Password-Based Authentication', 'mapping_confidence': 'High', 'rationale': 'This directly supports the requirement to protect passwords from unauthorized disclosure and use.'
// //                 }
// //             ]
// //         },
// //         {'extracted_statement': 'Causing or attempting to cause any security breaches, disruptions of network communications or Information Security Incidents. “Disruption” includes, but is not limited to, network sniffing, pinged floods, packet spoofing, denial of service...', 'ai_control_summary': 'Any activity that intentionally causes or attempts to cause a security breach or network disruption (e.g., DoS, sniffing, spoofing) is prohibited.', 'mappings': [
// //                 {'framework': 'ISO 27001', 'control_id': 'A.8.20', 'control_title': 'Network security', 'mapping_confidence': 'High', 'rationale': 'This policy prohibits specific actions that threaten the security and availability of the network.'
// //                 },
// //                 {'framework': 'NIST SP 800-53', 'control_id': 'SI-4', 'control_title': 'System Monitoring', 'mapping_confidence': 'Medium', 'rationale': 'This policy defines unacceptable behavior that system monitoring tools (SI-4) are designed to detect.'
// //                 }
// //             ]
// //         },
// //         {'extracted_statement': 'Port scanning or security scanning unless prior approval from Infosec has been obtained.', 'ai_control_summary': 'Users are prohibited from performing any port scanning or security scanning on the network without prior written authorization from the Information Security department.', 'mappings': [
// //                 {'framework': 'ISO 27001', 'control_id': 'A.5.26', 'control_title': 'Assessment and decision on information security events', 'mapping_confidence': 'Medium', 'rationale': 'This ensures that security scanning, a form of event assessment, is a controlled and authorized activity.'
// //                 },
// //                 {'framework': 'NIST SP 800-53', 'control_id': 'RA-5', 'control_title': 'Vulnerability Monitoring and Scanning', 'mapping_confidence': 'High', 'rationale': 'This policy establishes the rules of behavior for vulnerability scanning, requiring authorization and restricting it to authorized personnel.'
// //                 }
// //             ]
// //         },
// //         {'extracted_statement': 'Executing any form of network monitoring which will intercept data not intended for the Individual User’s host except in accordance with Company policy.', 'ai_control_summary': "Unauthorized network monitoring or data interception (e.g., packet sniffing) is strictly forbidden unless it is an authorized part of a user's job function.", 'mappings': [
// //                 {'framework': 'ISO 27001', 'control_id': 'A.8.16', 'control_title': 'Monitoring activities', 'mapping_confidence': 'High', 'rationale': 'This control ensures that monitoring activities are authorized and controlled, preventing unauthorized sniffing by users.'
// //                 },
// //                 {'framework': 'NIST SP 800-53', 'control_id': 'SI-4(5)', 'control_title': 'System Monitoring | Unauthorized Network Discovery', 'mapping_confidence': 'High', 'rationale': 'This policy directly prohibits the type of unauthorized network monitoring that this control enhancement aims to detect and prevent.'
// //                 }
// //             ]
// //         },
// //         {'extracted_statement': 'Circumventing user authentication protocols or the security of any host, network or account.', 'ai_control_summary': 'Attempting to bypass or defeat user authentication or any other security control on any system or network is prohibited.', 'mappings': [
// //                 {'framework': 'ISO 27001', 'control_id': 'A.5.15', 'control_title': 'Access control', 'mapping_confidence': 'High', 'rationale': 'This is a fundamental rule of access control, prohibiting attempts to circumvent established security mechanisms.'
// //                 },
// //                 {'framework': 'NIST SP 800-53', 'control_id': 'AC-3', 'control_title': 'Access Enforcement', 'mapping_confidence': 'High', 'rationale': 'This policy supports the technical enforcement of access controls by making it a violation to attempt to bypass them.'
// //                 }
// //             ]
// //         }
// //     ], 'gap_analysis': {'ISO 27001': [
// //             {'control_id': 'A.5.29', 'control_title': 'Information security in supplier relationships', 'description': 'The document does not describe policies or procedures for managing information security risks associated with third-party suppliers and vendors, such as security requirements in contracts or supplier security assessments.'
// //             },
// //             {'control_id': 'A.5.30', 'control_title': 'Information and communication technology readiness for business continuity', 'description': 'There is no mention of business continuity or disaster recovery planning. The policy does not address how ICT systems will be made resilient or how they will be recovered following a disruption.'
// //             },
// //             {'control_id': 'A.7.1', 'control_title': 'Physical security perimeters', 'description': 'The policy lacks any controls related to physical and environmental security. There is no mention of securing offices, data centers, or other physical locations where information assets are stored and processed.'
// //             },
// //             {'control_id': 'A.6.7', 'control_title': 'Disciplinary process', 'description': 'While the policy outlines unacceptable use, it does not specify the consequences for non-compliance or reference a formal disciplinary process for employees who violate information security policies.'
// //             }
// //         ], 'SOC 2': [
// //             {'control_id': 'CC3.2', 'control_title': 'Risk Identification and Analysis', 'description': "The document does not mention or describe a formal process for identifying, analyzing, and responding to risks to the achievement of the entity's objectives. An AUP is a risk mitigation, but the underlying risk assessment process is not defined."
// //             },
// //             {'control_id': 'CC5.1', 'control_title': 'Change Management', 'description': 'There is no mention of a formal change management process. The policy does not address how changes to IT infrastructure, systems, and software are authorized, tested, and approved before implementation.'
// //             }
// //         ], 'NIST': [
// //             {'control_id': 'CP-2', 'control_title': 'Contingency Plan', 'description': 'The document is missing any reference to contingency planning. There is no mention of plans and procedures for responding to system outages, disruptions, or disasters to ensure the recovery of organizational systems.'
// //             },
// //             {'control_id': 'PE-3', 'control_title': 'Physical Access Control', 'description': 'The entire domain of physical security is absent. The policy does not address controls for limiting physical access to systems and facilities to authorized individuals only.'
// //             },
// //             {'control_id': 'SA-3', 'control_title': 'System Development Life Cycle', 'description': 'The policy does not address security being integrated into the system development life cycle (SDLC). There are no controls mentioned for secure system design, development, or acquisition.'
// //             }
// //         ]
// //     }
// // }

// // const FrameworkTag = ({ name }: { name: string }) => (
// //   <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-1 rounded-full mr-2">
// //     {name}
// //   </span>
// // );

// // export default function GRCAnalysis() {
// //   const router = useRouter()
// //   const params = useParams()
// //   const documentId = params?.document_id as string
// //   const [mapping, setMapping] = useState<any>(null)
// //   const [loading, setLoading] = useState(true)
// //   const [error, setError] = useState<string | null>(null)

// //   useEffect(() => {
// //     if (!documentId) return
// //     setLoading(true)
// //     apiClient
// //       .getDocumentMapping(documentId)
// //       .then((res) => {
// //         if (res.success && res.data) {
// //           setMapping(res.data.framework_mapping)
// //         } else {
// //           setError(res.error || "Failed to load mapping data")
// //         }
// //       })
// //       .catch((err) => setError(err.message || "Network error"))
// //       .finally(() => setLoading(false))
// //   }, [documentId])

// //   if (loading) {
// //     return (
// //       <div className="p-8 flex flex-col items-center">
// //         <Database className="h-10 w-10 text-blue-400 animate-spin mb-4" />
// //         <div className="text-lg text-gray-700">Loading mapping results...</div>
// //       </div>
// //     )
// //   }

// //   if (error) {
// //     return (
// //       <div className="p-8 flex flex-col items-center">
// //         <AlertCircle className="h-10 w-10 text-red-400 mb-4" />
// //         <div className="text-lg text-red-700">{error}</div>
// //         <button className="mt-4 text-blue-600 underline" onClick={() => router.back()}>
// //           Go Back
// //         </button>
// //       </div>
// //     )
// //   }

// //   if (!mapping) {
// //     return (
// //       <div className="p-8 flex flex-col items-center">
// //         <AlertCircle className="h-10 w-10 text-yellow-400 mb-4" />
// //         <div className="text-lg text-yellow-700">No mapping data found for this document.</div>
// //         <button className="mt-4 text-blue-600 underline" onClick={() => router.back()}>
// //           Go Back
// //         </button>
// //       </div>
// //     )
// //   }

// //   // Prepare summary for chart
// //   const frameworks = Object.keys(mapping)
// //   const summary = frameworks.map((fw) => {
// //     const covered = mapping[fw].covered.length
// //     const missing = mapping[fw].missing.length
// //     const total = covered + missing
// //     return { fw, covered, missing, total }
// //   })



// //   return (
// //     <div className="p-6 space-y-6">
// //       <Card>
// //         <CardContent className="space-y-2 p-4">
// //           <h2 className="text-xl font-semibold">Analysis Summary</h2>
// //           <div className="text-sm text-muted-foreground">
// //             <p><strong>Character Count:</strong> {data.analysis_summary.document_character_count}</p>
// //             <p><strong>Identified Controls:</strong> {data.analysis_summary.identified_controls_count}</p>
// //             <p><strong>Frameworks Analyzed:</strong> {data.analysis_summary.frameworks_analyzed.map(f => <FrameworkTag key={f} name={f} />)}</p>
// //           </div>
// //         </CardContent>
// //       </Card>

// //       <Tabs defaultValue="mapped" className="space-y-4">
// //         <TabsList>
// //           <TabsTrigger value="mapped">Mapped Controls</TabsTrigger>
// //           <TabsTrigger value="gap">Gap Analysis</TabsTrigger>
// //         </TabsList>

// //         <TabsContent value="mapped">
// //           <ScrollArea className="h-[500px] pr-4">
// //             <div className="space-y-4">
// //               {data.mapped_controls.map((control, idx) => (
// //                 <Card key={idx} className="border border-gray-200">
// //                   <CardContent className="p-4 space-y-2">
// //                     <h3 className="font-semibold text-base">{control.ai_control_summary}</h3>
// //                     <p className="text-sm italic text-gray-600">"{control.extracted_statement}"</p>
// //                     <div className="text-sm space-y-2">
// //                       {control.mappings.map((map, i) => (
// //                         <div key={i} className="border-l-4 border-gray-400 pl-4">
// //                           <p><strong>{map.framework}</strong> - {map.control_id}: <em>{map.control_title}</em></p>
// //                           <p className="text-xs text-gray-500">Confidence: {map.mapping_confidence}</p>
// //                           <p className="text-xs">{map.rationale}</p>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   </CardContent>
// //                 </Card>
// //               ))}
// //             </div>
// //           </ScrollArea>
// //         </TabsContent>

// //         <TabsContent value="gap">
// //           <ScrollArea className="h-[500px] pr-4">
// //             <div className="space-y-4">
// //               {Object.entries(data.gap_analysis).map(([framework, gaps], i) => (
// //                 <Card key={i} className="border border-gray-200">
// //                   <CardContent className="p-4">
// //                     <h3 className="text-lg font-semibold mb-2">{framework}</h3>
// //                     <div className="space-y-2">
// //                       {gaps.map((gap, j) => (
// //                         <div key={j} className="border-l-4 border-yellow-500 pl-4">
// //                           <p><strong>{gap.control_id}</strong>: {gap.control_title}</p>
// //                           <p className="text-sm text-gray-700">{gap.description}</p>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   </CardContent>
// //                 </Card>
// //               ))}
// //             </div>
// //           </ScrollArea>
// //         </TabsContent>
// //       </Tabs>
// //     </div>
// //   );
// // }

// // "use client"
// // import React, { useState, useEffect, use } from "react";
// // import { Card, CardContent } from "@/components/ui/card";
// // import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// // import { ScrollArea } from "@/components/ui/scroll-area";
// // import { useRouter } from "next/router";
// // import { apiClient } from "@/lib/api-client";
// // import { AlertCircle, Database } from "lucide-react";

// // // --- Type Definitions ---

// // type Mapping = {
// //   framework: string;
// //   control_id: string;
// //   control_title: string;
// //   mapping_confidence: string;
// //   rationale: string;
// // };

// // type MappedControl = {
// //   extracted_statement: string;
// //   ai_control_summary: string;
// //   mappings: Mapping[];
// // };

// // type Gap = {
// //   control_id: string;
// //   control_title: string;
// //   description: string;
// // };

// // // Define a type for the entire API response object
// // type AnalysisData = {
// //   analysis_summary: {
// //     document_character_count: number;
// //     identified_controls_count: number;
// //     frameworks_analyzed: string[];
// //   };
// //   mapped_controls: MappedControl[];
// //   gap_analysis: Record<string, Gap[]>; // e.g., { "ISO 27001": Gap[], "SOC 2": Gap[] }
// // };

// // // --- Helper Component ---

// // const FrameworkTag = ({ name }: { name: string }) => (
// //   <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-1 rounded-full mr-2 mb-1 inline-block">
// //     {name}
// //   </span>
// // );

// // // --- Main Component ---

// // export default function GRCAnalysis() {
// //   const router = useRouter();
// //   // Ensure documentId is available before fetching
// //   const { document_id: documentId } = router.query;

// //   // State to hold the entire analysis object from the API
// //   const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);

// //   useEffect(() => {
// //     // Only run if documentId is a valid string
// //     if (typeof documentId !== "string") {
// //       // If the ID is not ready yet, do nothing.
// //       // Or set a loading/error state if it's expected but missing.
// //       if (!documentId) setLoading(false);
// //       return;
// //     }

// //     setLoading(true);
// //     setError(null);

// //     // Assuming apiClient.getDocumentMapping returns the entire analysis object
// //     apiClient
// //       .getDocumentMapping(documentId)
// //       .then((res) => {
// //         if (res.success && res.data) {
// //           // CORRECTED: Store the entire data object in state
// //           setAnalysisData(res.data);
// //         } else {
// //           setError(res.error || "Failed to load mapping data. The response was not successful.");
// //         }
// //       })
// //       .catch((err) => {
// //         console.error("API Error:", err);
// //         setError(err.message || "An unknown network error occurred.");
// //       })
// //       .finally(() => {
// //         setLoading(false);
// //       });
// //   }, [documentId]); // Dependency array ensures this runs when documentId changes

// //   if (loading) {
// //     return (
// //       <div className="p-8 flex flex-col items-center justify-center h-full">
// //         <Database className="h-10 w-10 text-blue-500 animate-spin mb-4" />
// //         <p className="text-lg text-gray-700">Loading analysis results...</p>
// //       </div>
// //     );
// //   }

// //   if (error) {
// //     return (
// //       <div className="p-8 flex flex-col items-center justify-center h-full">
// //         <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
// //         <p className="text-lg text-red-700 font-semibold">Error Loading Data</p>
// //         <p className="text-sm text-gray-600 mb-4">{error}</p>
// //         <button className="text-blue-600 underline" onClick={() => router.reload()}>
// //           Try Again
// //         </button>
// //       </div>
// //     );
// //   }

// //   // CORRECTED: Check for analysisData instead of the old 'mapping' state
// //   if (!analysisData) {
// //     return (
// //       <div className="p-8 flex flex-col items-center justify-center h-full">
// //         <AlertCircle className="h-10 w-10 text-yellow-500 mb-4" />
// //         <p className="text-lg text-yellow-700">No analysis data found for this document.</p>
// //         <button className="mt-4 text-blue-600 underline" onClick={() => router.back()}>
// //           Go Back
// //         </button>
// //       </div>
// //     );
// //   }

// //   // CORRECTED: All UI elements now use the 'analysisData' state variable
// //   return (
// //     <div className="p-6 space-y-6">
// //       <Card>
// //         <CardContent className="space-y-2 p-4">
// //           <h2 className="text-xl font-semibold">Analysis Summary</h2>
// //           <div className="text-sm text-muted-foreground">
// //             <p><strong>Character Count:</strong> {analysisData.analysis_summary.document_character_count.toLocaleString()}</p>
// //             <p><strong>Identified Controls:</strong> {analysisData.analysis_summary.identified_controls_count}</p>
// //             <div><strong>Frameworks Analyzed:</strong> {analysisData.analysis_summary.frameworks_analyzed.map(f => <FrameworkTag key={f} name={f} />)}</div>
// //           </div>
// //         </CardContent>
// //       </Card>

// //       <Tabs defaultValue="mapped" className="space-y-4">
// //         <TabsList>
// //           <TabsTrigger value="mapped">Mapped Controls ({analysisData.mapped_controls.length})</TabsTrigger>
// //           <TabsTrigger value="gap">Gap Analysis</TabsTrigger>
// //         </TabsList>

// //         <TabsContent value="mapped">
// //           <ScrollArea className="h-[500px] pr-4">
// //             <div className="space-y-4">
// //               {analysisData.mapped_controls.map((control, idx) => (
// //                 <Card key={idx} className="border border-gray-200 shadow-sm">
// //                   <CardContent className="p-4 space-y-3">
// //                     <h3 className="font-semibold text-base text-gray-800">{control.ai_control_summary}</h3>
// //                     <blockquote className="border-l-4 border-gray-300 pl-4">
// //                       <p className="text-sm italic text-gray-600">"{control.extracted_statement}"</p>
// //                     </blockquote>
// //                     <div className="text-sm space-y-3">
// //                       {control.mappings.map((map, i) => (
// //                         <div key={i} className="border-l-4 border-blue-400 pl-4 py-1">
// //                           <p><strong>{map.framework}</strong> - {map.control_id}: <em>{map.control_title}</em></p>
// //                           <p className="text-xs text-gray-500">Confidence: {map.mapping_confidence}</p>
// //                           <p className="text-xs text-gray-600">{map.rationale}</p>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   </CardContent>
// //                 </Card>
// //               ))}
// //             </div>
// //           </ScrollArea>
// //         </TabsContent>

// //         <TabsContent value="gap">
// //           <ScrollArea className="h-[500px] pr-4">
// //             <div className="space-y-4">
// //               {Object.entries(analysisData.gap_analysis).map(([framework, gaps], i) => (
// //                 <Card key={i} className="border border-gray-200 shadow-sm">
// //                   <CardContent className="p-4">
// //                     <h3 className="text-lg font-semibold mb-3">{framework} ({gaps.length} Gaps)</h3>
// //                     <div className="space-y-3">
// //                       {gaps.map((gap, j) => (
// //                         <div key={j} className="border-l-4 border-yellow-500 pl-4 py-1">
// //                           <p><strong>{gap.control_id}</strong>: {gap.control_title}</p>
// //                           <p className="text-sm text-gray-700">{gap.description}</p>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   </CardContent>
// //                 </Card>
// //               ))}
// //             </div>
// //           </ScrollArea>
// //         </TabsContent>
// //       </Tabs>
// //     </div>
// //   );
// // }


// "use client"
// import React, { useState } from "react";
// import { useEffect } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { ScrollArea } from "@/components/ui/scroll-area";
// // import { useRouter } from "next/router";
// // import { useParams } from "next/navigation";
// import { useRouter, useParams } from "next/navigation"
// import { apiClient } from "@/lib/api-client";
// import { AlertCircle, Database } from "lucide-react";

// type Mapping = {
//   framework: string;
//   control_id: string;
//   control_title: string;
//   mapping_confidence: string;
//   rationale: string;
// };

// type MappedControl = {
//   extracted_statement: string;
//   ai_control_summary: string;
//   mappings: Mapping[];
// };

// type Gap = {
//   control_id: string;
//   control_title: string;
//   description: string;
// };

// type AnalysisData = {
//   framework_mapping : framework_mapping
// }

// type framework_mapping = {
//   analysis_summary: {
//     document_character_count: number;
//     identified_controls_count: number;
//     frameworks_analyzed: string[];
//   };
//   mapped_controls: MappedControl[];
//   gap_analysis: {
//     [framework: string]: Gap[];
//   };
// };



// const FrameworkTag = ({ name }: { name: string }) => (
//   <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-1 rounded-full mr-2">
//     {name}
//   </span>
// );

// export default function GRCAnalysis() {
//   const router = useRouter();
//   const params = useParams();
//   const documentId = params?.document_id as string;
//   const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!documentId) return;
    
//     setLoading(true);
//     apiClient
//       .getDocumentMapping(documentId)
//       .then((res) => {
//         if (res.success && res.data) {
//           // Use the entire analysis data from the API response
//           setAnalysisData(res.data as AnalysisData);
//         } else {
//           setError(res.error || "Failed to load mapping data");
//         }
//       })
//       .catch((err) => setError(err.message || "Network error"))
//       .finally(() => setLoading(false));
//   }, [documentId]);

//   if (loading) {
//     return (
//       <div className="p-8 flex flex-col items-center">
//         <Database className="h-10 w-10 text-blue-400 animate-spin mb-4" />
//         <div className="text-lg text-gray-700">Loading mapping results...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-8 flex flex-col items-center">
//         <AlertCircle className="h-10 w-10 text-red-400 mb-4" />
//         <div className="text-lg text-red-700">{error}</div>
//         <button className="mt-4 text-blue-600 underline" onClick={() => router.back()}>
//           Go Back
//         </button>
//       </div>
//     );
//   }

//   if (!analysisData) {
//     return (
//       <div className="p-8 flex flex-col items-center">
//         <AlertCircle className="h-10 w-10 text-yellow-400 mb-4" />
//         <div className="text-lg text-yellow-700">No mapping data found for this document.</div>
//         <button className="mt-4 text-blue-600 underline" onClick={() => router.back()}>
//           Go Back
//         </button>
//       </div>
//     );
//   }

//   const {
//     analysis_summary,
//     mapped_controls,
//     gap_analysis
//   } = analysisData.framework_mapping;

//   console.log(analysisData.framework_mapping)

//   return (
//     <div className="p-6 space-y-6">
//       <Card>
//         <CardContent className="space-y-2 p-4">
//           <h2 className="text-xl font-semibold">Analysis Summary</h2>
//           <div className="text-sm text-muted-foreground">
//             <p><strong>Character Count:</strong> {analysis_summary.document_character_count}</p>
//             <p><strong>Identified Controls:</strong> {analysis_summary.identified_controls_count}</p>
//             <p><strong>Frameworks Analyzed:</strong> 
//               {analysis_summary.frameworks_analyzed.map(f => 
//                 <FrameworkTag key={f} name={f} />
//               )}
//             </p>
//           </div>
//         </CardContent>
//       </Card>

//       <Tabs defaultValue="mapped" className="space-y-4">
//         <TabsList>
//           <TabsTrigger value="mapped">Mapped Controls</TabsTrigger>
//           <TabsTrigger value="gap">Gap Analysis</TabsTrigger>
//         </TabsList>

//         <TabsContent value="mapped">
//           <ScrollArea className="h-[500px] pr-4">
//             <div className="space-y-4">
//               {mapped_controls.map((control, idx) => (
//                 <Card key={idx} className="border border-gray-200">
//                   <CardContent className="p-4 space-y-2">
//                     <h3 className="font-semibold text-base">{control.ai_control_summary}</h3>
//                     <p className="text-sm italic text-gray-600">"{control.extracted_statement}"</p>
//                     <div className="text-sm space-y-2">
//                       {control.mappings.map((map, i) => (
//                         <div key={i} className="border-l-4 border-gray-400 pl-4">
//                           <p><strong>{map.framework}</strong> - {map.control_id}: <em>{map.control_title}</em></p>
//                           <p className="text-xs text-gray-500">Confidence: {map.mapping_confidence}</p>
//                           <p className="text-xs">{map.rationale}</p>
//                         </div>
//                       ))}
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </ScrollArea>
//         </TabsContent>

//         <TabsContent value="gap">
//           <ScrollArea className="h-[500px] pr-4">
//             <div className="space-y-4">
//               {Object.entries(gap_analysis).map(([framework, gaps], i) => (
//                 <Card key={i} className="border border-gray-200">
//                   <CardContent className="p-4">
//                     <h3 className="text-lg font-semibold mb-2">{framework}</h3>
//                     <div className="space-y-2">
//                       {gaps.map((gap, j) => (
//                         <div key={j} className="border-l-4 border-yellow-500 pl-4">
//                           <p><strong>{gap.control_id}</strong>: {gap.control_title}</p>
//                           <p className="text-sm text-gray-700">{gap.description}</p>
//                         </div>
//                       ))}
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </ScrollArea>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }


"use client"
import React, { useState } from "react";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { 
  AlertCircle, 
  Database, 
  FileText, 
  CheckCircle, 
  XCircle, 
  ChevronLeft,
  BarChart2,
  ListChecks,
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type Mapping = {
  framework: string;
  control_id: string;
  control_title: string;
  mapping_confidence: string;
  rationale: string;
};

type MappedControl = {
  extracted_statement: string;
  ai_control_summary: string;
  mappings: Mapping[];
};

type Gap = {
  control_id: string;
  control_title: string;
  description: string;
};

type AnalysisData = {
  framework_mapping: {
    analysis_summary: {
      document_character_count: number;
      identified_controls_count: number;
      frameworks_analyzed: string[];
    };
    mapped_controls: MappedControl[];
    gap_analysis: {
      [framework: string]: Gap[];
    };
  }
};

// const ConfidenceBadge = ({ level }: { level: string }) => {
//   const variant = level === "High" ? "success" : level === "Medium" ? "warning" : "destructive";
//   return <Badge variant={variant}>{level} Confidence</Badge>;
// };

const FrameworkTag = ({ name }: { name: string }) => (
  <Badge variant="secondary" className="mr-2 mb-1">
    {name}
  </Badge>
);

export default function GRCAnalysis() {
  const router = useRouter();
  const params = useParams();
  const documentId = params?.document_id as string;
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!documentId) return;
    
    setLoading(true);
    apiClient
      .getDocumentMapping(documentId)
      .then((res) => {
        if (res.success && res.data) {
          setAnalysisData(res.data);
        } else {
          setError(res.error || "Failed to load analysis data");
        }
      })
      .catch((err) => setError(err.message || "Network error"))
      .finally(() => setLoading(false));
  }, [documentId]);

  const filteredMappedControls = analysisData?.framework_mapping.mapped_controls.filter(control => 
    control.ai_control_summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    control.extracted_statement.toLowerCase().includes(searchTerm.toLowerCase()) ||
    control.mappings.some(m => 
      m.control_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.control_title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

  const filteredGaps = analysisData?.framework_mapping.gap_analysis 
    ? Object.entries(analysisData.framework_mapping.gap_analysis).reduce((acc, [framework, gaps]) => {
        const filtered = gaps.filter(gap => 
          gap.control_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gap.control_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gap.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filtered.length > 0) {
          acc[framework] = filtered;
        }
        return acc;
      }, {} as Record<string, Gap[]>)
    : {};

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Skeleton className="h-8 w-8 rounded-md mr-3" />
          <Skeleton className="h-8 w-64" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center mb-4">
                <Skeleton className="h-6 w-6 mr-3" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
          ))}
        </div>
        
        <Tabs defaultValue="mapped">
          <TabsList className="mb-4">
            <TabsTrigger value="mapped">
              <Skeleton className="h-4 w-24" />
            </TabsTrigger>
            <TabsTrigger value="gap">
              <Skeleton className="h-4 w-20" />
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="mapped">
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-4" />
                  <div className="space-y-3">
                    {[1, 2].map((_, j) => (
                      <div key={j} className="pl-4 border-l-2 border-gray-200">
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-3 w-1/4 mb-1" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-red-100 p-4 rounded-full mb-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Analysis Failed</h2>
        <p className="text-gray-600 mb-6 text-center">{error}</p>
        <div className="flex gap-3">
          <button 
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Go Back
          </button>
          <button 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-yellow-100 p-4 rounded-full mb-4">
          <AlertCircle className="h-12 w-12 text-yellow-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">No Analysis Data</h2>
        <p className="text-gray-600 mb-6 text-center">We couldn't find any analysis data for this document.</p>
        <button 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Go Back
        </button>
      </div>
    );
  }

  const {
    analysis_summary,
    mapped_controls,
    gap_analysis
  } = analysisData.framework_mapping;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <BarChart2 className="h-6 w-6 mr-2 text-blue-500" />
          Compliance Analysis
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Document Size</p>
              <p className="text-xl font-bold">{analysis_summary.document_character_count.toLocaleString()} characters</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 flex items-center">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Controls Identified</p>
              <p className="text-xl font-bold">{analysis_summary.identified_controls_count}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-2">Frameworks Analyzed</p>
            <div className="flex flex-wrap">
              {analysis_summary.frameworks_analyzed.map(f => 
                <FrameworkTag key={f} name={f} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mapped" className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <TabsList>
            <TabsTrigger value="mapped" className="flex items-center">
              <ListChecks className="h-4 w-4 mr-2" /> Mapped Controls
              <Badge variant="outline" className="ml-2">{mapped_controls.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="gap" className="flex items-center">
              <XCircle className="h-4 w-4 mr-2" /> Gap Analysis
              <Badge variant="destructive" className="ml-2">
                {Object.values(gap_analysis).reduce((sum, gaps) => sum + gaps.length, 0)}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search controls..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="mapped">
          <ScrollArea className="h-[calc(100vh-280px)] pr-4">
            {filteredMappedControls.length > 0 ? (
              <div className="space-y-4">
                {filteredMappedControls.map((control, idx) => (
                  <Card key={idx} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <h3 className="font-semibold text-base text-gray-800 mb-1">{control.ai_control_summary}</h3>
                        <div className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-md">
                          "{control.extracted_statement}"
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">Mappings</span>
                          {control.mappings.length} framework matches
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {control.mappings.map((map, i) => (
                            <div 
                              key={i} 
                              className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50 rounded-r-md"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">
                                    <span className="font-semibold text-gray-900">{map.framework}</span> - {map.control_id}
                                  </p>
                                  <p className="text-sm text-gray-700 mb-2">{map.control_title}</p>
                                </div>
                                {/* <ConfidenceBadge level={map.mapping_confidence} /> */}
                              </div>
                              <p className="text-xs text-gray-600 bg-white p-2 rounded mt-1">{map.rationale}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No matching controls found</h3>
                <p className="text-gray-500 mt-1">Try adjusting your search term</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="gap">
          <ScrollArea className="h-[calc(100vh-280px)] pr-4">
            {Object.keys(filteredGaps).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(filteredGaps).map(([framework, gaps], i) => (
                  <Card key={i} className="border border-gray-200 shadow-sm">
                    <CardContent className="p-0">
                      <div className="bg-gray-50 px-4 py-3 border-b">
                        <h3 className="font-semibold text-gray-800 flex items-center">
                          <XCircle className="h-5 w-5 text-red-500 mr-2" />
                          {framework} 
                          <Badge variant="destructive" className="ml-2">{gaps.length} gaps</Badge>
                        </h3>
                      </div>
                      
                      <div className="divide-y">
                        {gaps.map((gap, j) => (
                          <div key={j} className="p-4 hover:bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">
                                  <span className="text-red-600">{gap.control_id}</span>: {gap.control_title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">{gap.description}</p>
                              </div>
                              <Badge variant="destructive">Gap</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No gaps found</h3>
                <p className="text-gray-500 mt-1">Great job! All controls are covered</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
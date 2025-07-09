"""
GRC Knowledge Base Module
Contains built-in compliance framework knowledge and control mappings.
"""

class GRCKnowledgeBase:
    """Centralized GRC knowledge base for compliance frameworks"""
    
    def __init__(self):
        self._initialize_frameworks()
        self._initialize_control_mappings()
    
    def _initialize_frameworks(self):
        """Initialize framework-specific knowledge"""
        self.frameworks = {
            "ISO27001": {
                "name": "ISO 27001 - Information Security Management",
                "version": "2022",
                "controls": {
                    "A.5.1.1": {
                        "title": "Information security policies",
                        "description": "Information security policies shall be defined and approved by management",
                        "category": "Information Security Policies",
                        "control_type": "Administrative",
                        "implementation_guidance": [
                            "Develop comprehensive information security policy",
                            "Obtain management approval and commitment",
                            "Communicate policy to all personnel",
                            "Review and update policy regularly"
                        ]
                    },
                    "A.9.1.1": {
                        "title": "Access control policy",
                        "description": "An access control policy shall be established and reviewed",
                        "category": "Access Control",
                        "control_type": "Administrative",
                        "implementation_guidance": [
                            "Define access control requirements",
                            "Establish user access provisioning procedures",
                            "Implement role-based access control",
                            "Regular access reviews and updates"
                        ]
                    },
                    "A.12.1.1": {
                        "title": "Operational procedures",
                        "description": "Documented operating procedures shall be prepared for all IT systems",
                        "category": "Operations Security",
                        "control_type": "Operational",
                        "implementation_guidance": [
                            "Document all operational procedures",
                            "Include system startup and shutdown procedures",
                            "Define incident handling procedures",
                            "Regular procedure reviews and updates"
                        ]
                    },
                    "A.8.1.1": {
                        "title": "Asset inventory",
                        "description": "Inventory of assets shall be maintained",
                        "category": "Asset Management",
                        "control_type": "Administrative",
                        "implementation_guidance": [
                            "Identify and document all assets",
                            "Assign asset owners and responsibilities",
                            "Maintain accurate asset registers",
                            "Regular asset inventory reviews"
                        ]
                    },
                    "A.16.1.1": {
                        "title": "Incident management",
                        "description": "Responsibilities and procedures for incident management",
                        "category": "Incident Management",
                        "control_type": "Detective",
                        "implementation_guidance": [
                            "Establish incident response team",
                            "Define incident classification procedures",
                            "Implement incident reporting mechanisms",
                            "Regular incident response testing"
                        ]
                    }
                }
            },
            "SOC2": {
                "name": "SOC 2 - Service Organization Controls",
                "version": "2017",
                "controls": {
                    "CC1.1": {
                        "title": "Control Environment",
                        "description": "The entity demonstrates a commitment to integrity and ethical values",
                        "category": "Common Criteria",
                        "control_type": "Administrative",
                        "implementation_guidance": [
                            "Establish code of conduct",
                            "Implement ethics training programs",
                            "Regular ethics assessments",
                            "Disciplinary actions for violations"
                        ]
                    },
                    "CC2.1": {
                        "title": "Communication and Information",
                        "description": "Management communicates information internally to support control environment",
                        "category": "Common Criteria",
                        "control_type": "Administrative",
                        "implementation_guidance": [
                            "Establish communication channels",
                            "Regular management communications",
                            "Document communication procedures",
                            "Feedback mechanisms"
                        ]
                    },
                    "CC3.1": {
                        "title": "Risk Assessment",
                        "description": "The entity specifies objectives clearly to enable risk identification",
                        "category": "Common Criteria",
                        "control_type": "Administrative",
                        "implementation_guidance": [
                            "Define organizational objectives",
                            "Conduct regular risk assessments",
                            "Document risk management procedures",
                            "Risk monitoring and reporting"
                        ]
                    },
                    "CC6.1": {
                        "title": "Logical and Physical Access Controls",
                        "description": "Logical and physical access controls",
                        "category": "System Operations",
                        "control_type": "Preventive",
                        "implementation_guidance": [
                            "Implement access control systems",
                            "Physical security measures",
                            "Regular access reviews",
                            "Multi-factor authentication"
                        ]
                    },
                    "CC7.1": {
                        "title": "System Operations",
                        "description": "System operations controls",
                        "category": "System Operations",
                        "control_type": "Operational",
                        "implementation_guidance": [
                            "System monitoring procedures",
                            "Change management processes",
                            "Backup and recovery procedures",
                            "System maintenance schedules"
                        ]
                    }
                }
            },
            "NIST_CSF": {
                "name": "NIST Cybersecurity Framework",
                "version": "1.1",
                "controls": {
                    "ID.AM-1": {
                        "title": "Asset Management",
                        "description": "Physical devices and systems within the organization are inventoried",
                        "category": "Identify",
                        "control_type": "Administrative",
                        "implementation_guidance": [
                            "Maintain hardware inventory",
                            "Software asset management",
                            "Network device documentation",
                            "Regular inventory updates"
                        ]
                    },
                    "PR.AC-1": {
                        "title": "Access Control",
                        "description": "Identities and credentials are issued, managed, and revoked",
                        "category": "Protect",
                        "control_type": "Administrative",
                        "implementation_guidance": [
                            "Identity management system",
                            "Credential lifecycle management",
                            "Access provisioning procedures",
                            "Regular access certifications"
                        ]
                    },
                    "DE.AE-1": {
                        "title": "Anomalies and Events",
                        "description": "A baseline of network operations and expected data flows is established",
                        "category": "Detect",
                        "control_type": "Detective",
                        "implementation_guidance": [
                            "Network baseline establishment",
                            "Traffic monitoring systems",
                            "Anomaly detection tools",
                            "Regular baseline reviews"
                        ]
                    },
                    "RS.RP-1": {
                        "title": "Response Planning",
                        "description": "Response plan is executed during or after an incident",
                        "category": "Respond",
                        "control_type": "Corrective",
                        "implementation_guidance": [
                            "Incident response plan development",
                            "Response team establishment",
                            "Regular plan testing",
                            "Plan updates and improvements"
                        ]
                    },
                    "RC.RP-1": {
                        "title": "Recovery Planning",
                        "description": "Recovery plan is executed during or after a cybersecurity incident",
                        "category": "Recover",
                        "control_type": "Corrective",
                        "implementation_guidance": [
                            "Recovery plan development",
                            "Recovery procedures testing",
                            "Business continuity planning",
                            "Regular plan updates"
                        ]
                    }
                }
            },
            "PCI_DSS": {
                "name": "PCI DSS - Payment Card Industry Data Security Standard",
                "version": "4.0",
                "controls": {
                    "1.1.1": {
                        "title": "Firewall Configuration",
                        "description": "A formal process for approving and testing all network connections",
                        "category": "Network Security",
                        "control_type": "Preventive",
                        "implementation_guidance": [
                            "Firewall rule management procedures",
                            "Network connection approval process",
                            "Regular firewall rule reviews",
                            "Network segmentation implementation"
                        ]
                    },
                    "2.1": {
                        "title": "Default Passwords",
                        "description": "Always change vendor-supplied defaults and remove or disable unnecessary default accounts",
                        "category": "System Security",
                        "control_type": "Preventive",
                        "implementation_guidance": [
                            "Default password change procedures",
                            "Unnecessary account removal",
                            "System hardening guidelines",
                            "Regular security configurations review"
                        ]
                    },
                    "3.4": {
                        "title": "Data Protection",
                        "description": "Render cardholder data unreadable anywhere it is stored",
                        "category": "Data Protection",
                        "control_type": "Preventive",
                        "implementation_guidance": [
                            "Data encryption implementation",
                            "Key management procedures",
                            "Data masking techniques",
                            "Regular encryption reviews"
                        ]
                    },
                    "6.5.1": {
                        "title": "Secure Coding",
                        "description": "Injection flaws, particularly SQL injection",
                        "category": "Application Security",
                        "control_type": "Preventive",
                        "implementation_guidance": [
                            "Secure coding practices",
                            "Input validation procedures",
                            "Code review processes",
                            "Security testing protocols"
                        ]
                    },
                    "8.2.3": {
                        "title": "Password Complexity",
                        "description": "Passwords/passphrases must meet minimum complexity requirements",
                        "category": "Access Management",
                        "control_type": "Preventive",
                        "implementation_guidance": [
                            "Password policy definition",
                            "Complexity requirements enforcement",
                            "Regular password updates",
                            "Password strength monitoring"
                        ]
                    }
                }
            }
        }
    
    def _initialize_control_mappings(self):
        """Initialize control framework mappings for compliance alignment"""
        self.control_mappings = {
            "ISO27001_to_SOC2": {
                "A.5.1.1": ["CC1.1", "CC2.1"],
                "A.9.1.1": ["CC6.1"],
                "A.12.1.1": ["CC7.1"],
                "A.8.1.1": ["CC6.1"],
                "A.16.1.1": ["CC7.1"]
            },
            "ISO27001_to_NIST": {
                "A.5.1.1": ["ID.GV-1"],
                "A.9.1.1": ["PR.AC-1"],
                "A.12.1.1": ["PR.IP-1"],
                "A.8.1.1": ["ID.AM-1"],
                "A.16.1.1": ["RS.RP-1"]
            },
            "SOC2_to_NIST": {
                "CC1.1": ["ID.GV-1"],
                "CC6.1": ["PR.AC-1"],
                "CC7.1": ["PR.IP-1"],
                "CC3.1": ["ID.RA-1"]
            }
        }
    
    def get_framework_info(self, framework: str) -> dict:
        """Get framework information"""
        return self.frameworks.get(framework, {})
    
    def get_control_details(self, framework: str, control_id: str) -> dict:
        """Get detailed information about a specific control"""
        framework_data = self.frameworks.get(framework, {})
        return framework_data.get("controls", {}).get(control_id, {})
    
    def search_controls(self, query: str, framework: str = None) -> list:
        """Search for controls based on query"""
        results = []
        frameworks_to_search = [framework] if framework else self.frameworks.keys()
        
        for fw in frameworks_to_search:
            fw_data = self.frameworks.get(fw, {})
            controls = fw_data.get("controls", {})
            
            for control_id, control_data in controls.items():
                if (query.lower() in control_data.get("title", "").lower() or
                    query.lower() in control_data.get("description", "").lower() or
                    query.lower() in control_data.get("category", "").lower()):
                    
                    results.append({
                        "framework": fw,
                        "control_id": control_id,
                        "title": control_data.get("title"),
                        "description": control_data.get("description"),
                        "category": control_data.get("category")
                    })
        
        return results
    
    def get_mapped_controls(self, framework_from: str, control_id: str, framework_to: str) -> list:
        """Get mapped controls between frameworks"""
        mapping_key = f"{framework_from}_to_{framework_to}"
        mapping = self.control_mappings.get(mapping_key, {})
        return mapping.get(control_id, [])
    
    def get_all_frameworks(self) -> list:
        """Get list of all available frameworks"""
        return [
            {
                "key": key,
                "name": value.get("name"),
                "version": value.get("version")
            }
            for key, value in self.frameworks.items()
        ]

# Global instance
grc_knowledge = GRCKnowledgeBase()

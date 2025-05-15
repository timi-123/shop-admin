// lib/roleConfig.ts (Updated)
export const ROLE_CONFIG = {
    // Main admin email
    adminEmails: ["shopgram.mostovi@gmail.com"],
    
    // Initially empty - vendors will be approved through the system
    vendorEmails: [],
    
    adminDomains: [],
    vendorDomains: [],
    defaultRole: "user" as const,
};

// Helper function to determine role based on email
export const getRoleFromEmail = (email: string): "admin" | "vendor" | "user" => {
    const lowerEmail = email.toLowerCase();
    
    // Check if user is the main admin
    if (ROLE_CONFIG.adminEmails.includes(lowerEmail)) {
        return "admin";
    }
    
    // For vendors, we'll check the database instead of hardcoded emails
    // This will be handled in the API routes
    
    return ROLE_CONFIG.defaultRole;
};
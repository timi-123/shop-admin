// Role configuration based on email domains or specific emails
export const ROLE_CONFIG = {
    // Specific admin emails for testing
    adminEmails: ["shopgram.mostovi@gmail.com", "mateapeeva@gmail.com"], // <- PUT YOUR ADMIN EMAILS HERE

    // Specific vendor emails
    vendorEmails: ["vendor@example.com", "supplier@gmail.com"], // <- PUT YOUR VENDOR EMAILS HERE

    adminDomains: ["admin.com", "yourcompany.com"], // Optional: domains that automatically get admin role
    vendorDomains: ["vendor.com", "supplier.com"], // Optional: domains that automatically get vendor role
    defaultRole: "user" as const,
};

// Helper function to determine role based on email
export const getRoleFromEmail = (email: string): "admin" | "vendor" | "user" => {
    const lowerEmail = email.toLowerCase();
    const domain = lowerEmail.split("@")[1];

    // Check specific admin emails first
    if (ROLE_CONFIG.adminEmails.includes(lowerEmail)) {
        return "admin";
    }

    // Check specific vendor emails
    if (ROLE_CONFIG.vendorEmails.includes(lowerEmail)) {
        return "vendor";
    }

    if (!domain) return ROLE_CONFIG.defaultRole;

    // Then check domains
    if (ROLE_CONFIG.adminDomains.includes(domain)) {
        return "admin";
    }

    if (ROLE_CONFIG.vendorDomains.includes(domain)) {
        return "vendor";
    }

    return ROLE_CONFIG.defaultRole;
};
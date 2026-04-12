import { getCookie } from '../lib/utils';

/**
 * Get a fresh CSRF token value from the XSRF-TOKEN cookie.
 * Always reads fresh — never cached — so it stays valid after Inertia navigations.
 * Send this value using the X-XSRF-TOKEN header (Laravel decrypts cookie-based tokens via that header).
 */
export function getCsrfToken(): string {
    const cookieToken = getCookie('XSRF-TOKEN');
    if (cookieToken) {
        try {
            return decodeURIComponent(cookieToken);
        } catch {
            return cookieToken;
        }
    }

    // Fallback: raw session token from meta tag (correct for X-CSRF-TOKEN header)
    const metaToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
    if (metaToken?.trim()) {
        return metaToken.trim();
    }

    console.warn('CSRF token not found. Make sure you are on a page with a valid Laravel session.');
    return '';
}

/** @deprecated No-op kept for compatibility — token is now always read fresh from cookie */
export function setCsrfToken(_token: string): void {}

export interface DocumentItem {
    title: string;
    description?: string;
}

export interface DocumentCategory {
    id: string;
    title: string;
    subtitle?: string;
    items: DocumentItem[];
}

export interface WhoCanApplyItem {
    title: string;
    description?: string;
    documents?: DocumentItem[];
}

export interface ServiceDetails {
    description?: string;
    purpose?: string[];
    activitiesCovered?: string[];
    considerations?: {
        title: string;
        items: string[];
    };
    evaluationProcess?: string[];
    processingTime?: string;
    processingTimeNote?: string;
    fees?: string;
    feesNote?: string;
    importantReminders?: string[];
}

export interface Service {
    id: string;
    title: string;
    description: string;
    image: string;
    gradientFrom: string;
    gradientTo: string;
    borderColor: string;
    titleColor: string;
    descriptionColor: string;
    darkGradientFrom?: string;
    darkGradientTo?: string;
    darkBorderColor?: string;
    darkTitleColor?: string;
    darkDescriptionColor?: string;
    className?: string;
    whoCanApply?: WhoCanApplyItem[];
    documents?: DocumentCategory[];
    serviceDetails?: ServiceDetails;
}

export const services: Service[] = [
    {
        id: 'zoning-clearance',
        title: 'Zoning Clearance Application',
        description: 'Apply for zoning clearance.',
        image: '/Zoning-Clearance.png',
        gradientFrom: 'from-green-100',
        gradientTo: 'to-green-200',
        borderColor: 'border-green-300',
        titleColor: 'text-green-800',
        descriptionColor: 'text-green-700',
        darkGradientFrom: 'dark:from-gray-800',
        darkGradientTo: 'dark:to-gray-700',
        darkBorderColor: 'dark:border-green-700',
        darkTitleColor: 'dark:text-green-400',
        darkDescriptionColor: 'dark:text-gray-300',
        whoCanApply: [
            {
                title: 'Individual Applicant',
                description: 'Personal applicant or lone lot owner applying for their own property',
                documents: [
                    { title: 'Proof of Ownership', description: 'Certified True Copy of the TCT/OCT' },
                    { title: 'Tax Declaration', description: 'Latest Tax Declaration (Certified by City Assessor)' },
                    { title: 'Tax Clearance', description: 'Latest Real Property Tax Receipt' },
                    { title: 'Barangay Clearance', description: 'Clearance for construction/development' },
                ],
            },
            {
                title: 'Corporation / Business Entity',
                description: 'Registered business organizations, corporations, partnerships, or cooperatives',
                documents: [
                    { title: 'Proof of Ownership', description: 'Certified True Copy of the TCT/OCT' },
                    { title: 'Business Registration', description: 'SEC Certificate of Incorporation / DTI Business Name' },
                    { title: 'Corporate Authorization', description: 'Secretary\'s Certificate or Board Resolution' },
                    { title: 'Tax Documents', description: 'Latest Tax Declaration and Tax Clearance' },
                ],
            },
            {
                title: 'Authorized Representative',
                description: 'Individual applying on behalf of a lot owner or a corporation',
                documents: [
                    { title: 'Authorization', description: 'Notarized Special Power of Attorney (SPA) or Authorization Letter' },
                    { title: 'Valid IDs', description: 'IDs of both the applicant and the representative' },
                    { title: 'Ownership Documents', description: 'Standard TCT/Tax documents from the property owner' },
                ],
            },
        ],
        documents: [
            {
                id: 'legal-ownership',
                title: 'Primary Requirements',
                subtitle: 'Essential documents for all applicants',
                items: [
                    { title: 'Certified True Copy of TCT/OCT', description: 'Proof of legal ownership' },
                    { title: 'Latest Tax Declaration', description: 'Certified by the City Assessor' },
                    { title: 'Latest Tax Clearance', description: 'Real Property Tax Receipt' },
                    { title: 'Barangay Clearance', description: 'From the barangay where project is located' },
                ],
            },
            {
                id: 'zoning-requirements',
                title: 'Site & Project Documents',
                subtitle: 'Technical requirements for zoning evaluation',
                items: [
                    { title: 'Vicinity Map', description: 'Showing location relative to landmarks' },
                    { title: 'Site Development Plan', description: 'Signed and sealed lot/site plan' },
                    { title: 'Building Plans', description: 'Architectural/Structural/Electrical/Sanitary plans' },
                    { title: 'Bill of Materials', description: 'Project cost estimate' },
                ],
            },
        ],
        serviceDetails: {
            description: 'Zoning Clearance is an official certification issued by the Local Government Unit (LGU) confirming that the proposed land use, development, or building activity complies with the approved Comprehensive Land Use Plan (CLUP) and Zoning Ordinance.',
            purpose: [
                'Ensure proper land use and orderly development',
                'Prevent incompatible land uses in residential, commercial, industrial, and institutional zones etc.',
                'Serve as a prerequisite for Building Permit, Business Permit, and other development approvals',
            ],
            activitiesCovered: [
                'Construction of residential, commercial, or industrial buildings',
                'Change in land use (e.g., residential to commercial)',
                'Establishment of new businesses',
                'Subdivision or housing development projects',
                'Expansion, renovation, or alteration of existing structures',
            ],
            considerations: {
                title: 'Zoning Considerations',
                items: [
                    'Zoning classification of the property (e.g., R1, R2, C1, I)',
                    'Compatibility of the proposed use with surrounding areas',
                    'Setback, height, and density regulations',
                    'Special zone restrictions (easements, buffer zones, hazard areas)',
                ],
            },
            evaluationProcess: [
                'Online submission of zoning clearance application',
                'Review of zoning classification and land use compliance',
                'Map verification and zoning assessment',
                'Site inspection (if necessary)',
                'Issuance of Zoning Clearance or Notice of Disapproval',
            ],
            processingTime: '3–5 working days',
            processingTimeNote: 'Processing time may vary depending on inspection requirements and document completeness',
            fees: 'Fees are assessed based on LGU zoning fee schedule',
            feesNote: 'Final amount will be displayed before payment confirmation',
            importantReminders: [
                'Zoning Clearance does not authorize construction',
                'Separate permits are required for building, business, and occupancy',
                'False or incomplete information may result in disapproval or cancellation',
            ],
        },
    },
    {
        id: 'zoning-map',
        title: 'Zoning Map',
        description: 'View and explore the city zoning map',
        image: '/Zoning-Map.png',
        gradientFrom: 'from-blue-100',
        gradientTo: 'to-blue-200',
        borderColor: 'border-blue-300',
        titleColor: 'text-blue-800',
        descriptionColor: 'text-blue-700',
        darkGradientFrom: 'dark:from-gray-800',
        darkGradientTo: 'dark:to-gray-700',
        darkBorderColor: 'dark:border-blue-700',
        darkTitleColor: 'dark:text-blue-400',
        darkDescriptionColor: 'dark:text-gray-300',
        whoCanApply: [
            {
                title: 'General public',
            },
            {
                title: 'Property owners',
            },
            {
                title: 'Real estate developers',
            },
            {
                title: 'Urban planners',
            },
            {
                title: 'Researchers and students',
            },
        ],
        documents: [
            {
                id: 'viewing-requirements',
                title: 'Viewing Requirements',
                items: [
                    {
                        title: 'No documents required for viewing',
                    },
                    {
                        title: 'Valid ID may be required for detailed information requests',
                    },
                ],
            },
        ],
    },
    {
        id: 'housing-beneficiary',
        title: 'Housing Beneficiary',
        description: 'Apply for housing assistance and socialized housing programs',
        image: '/Housing-Beneficiary.png',
        gradientFrom: 'from-purple-100',
        gradientTo: 'to-purple-200',
        borderColor: 'border-purple-300',
        titleColor: 'text-purple-800',
        descriptionColor: 'text-purple-700',
        darkGradientFrom: 'dark:from-gray-800',
        darkGradientTo: 'dark:to-gray-700',
        darkBorderColor: 'dark:border-purple-700',
        darkTitleColor: 'dark:text-purple-400',
        darkDescriptionColor: 'dark:text-gray-300',
        whoCanApply: [
            {
                title: 'Low-income families',
            },
            {
                title: 'Informal settler families',
            },
            {
                title: 'Displaced families due to government projects',
            },
            {
                title: 'Families affected by natural disasters',
            },
            {
                title: 'Senior citizens and persons with disabilities',
            },
        ],
        documents: [
            {
                id: 'required-documents',
                title: 'Required Documents',
                items: [
                    {
                        title: 'Valid ID of all family members',
                    },
                    {
                        title: 'Proof of income',
                        description: 'Certificate of Employment, payslips, or BIR form',
                    },
                    {
                        title: 'Proof of residency',
                        description: 'Barangay certificate',
                    },
                    {
                        title: 'Marriage certificate',
                        description: 'If applicable',
                    },
                    {
                        title: 'Birth certificates of all family members',
                    },
                    {
                        title: 'Tax Identification Number (TIN)',
                    },
                ],
            },
        ],
    },
    {
        id: 'infrastructure-projects',
        title: 'Infrastructure Projects',
        description: 'View ongoing and completed infrastructure projects in your area',
        image: '/Infrastructure.png',
        gradientFrom: 'from-orange-100',
        gradientTo: 'to-orange-200',
        borderColor: 'border-orange-300',
        titleColor: 'text-orange-800',
        descriptionColor: 'text-orange-700',
        darkGradientFrom: 'dark:from-gray-800',
        darkGradientTo: 'dark:to-gray-700',
        darkBorderColor: 'dark:border-orange-700',
        darkTitleColor: 'dark:text-orange-400',
        darkDescriptionColor: 'dark:text-gray-300',
        className: 'md:col-span-2 lg:col-span-1',
        whoCanApply: [
            {
                title: 'General public for viewing',
            },
            {
                title: 'Contractors and construction companies',
            },
            {
                title: 'Project managers and engineers',
            },
            {
                title: 'Government agencies',
            },
            {
                title: 'Community organizations',
            },
        ],
        documents: [
            {
                id: 'public-viewing',
                title: 'Public Viewing Requirements',
                items: [
                    {
                        title: 'No documents required for public viewing',
                    },
                ],
            },
            {
                id: 'contractor-requirements',
                title: 'Contractor Requirements',
                items: [
                    {
                        title: 'Business permit and licenses',
                    },
                    {
                        title: 'SEC registration or DTI certificate',
                    },
                    {
                        title: 'Tax Identification Number (TIN)',
                    },
                    {
                        title: 'Bidding documents',
                        description: 'If applicable',
                    },
                ],
            },
        ],
    },
    {
        id: 'development-clearance',
        title: 'Development Clearance',
        description: 'Apply for subdivision and building development clearance (PD 957)',
        image: '/Building Review.png',
        gradientFrom: 'from-indigo-100',
        gradientTo: 'to-indigo-200',
        borderColor: 'border-indigo-300',
        titleColor: 'text-indigo-800',
        descriptionColor: 'text-indigo-700',
        darkGradientFrom: 'dark:from-gray-800',
        darkGradientTo: 'dark:to-gray-700',
        darkBorderColor: 'dark:border-indigo-700',
        darkTitleColor: 'dark:text-indigo-400',
        darkDescriptionColor: 'dark:text-gray-300',
        whoCanApply: [
            {
                title: 'Developers',
                description: 'Real estate developers subdividing land for residential, commercial, or mixed-use projects',
                documents: [
                    {
                        title: 'Zoning Clearance',
                        description: 'Valid Zoning Clearance Reference Number (prerequisite)',
                    },
                    {
                        title: 'Proof of Ownership',
                        description: 'TCT/OCT or other legal ownership documents',
                    },
                    {
                        title: 'Subdivision Plans',
                        description: 'Preliminary subdivision plan, site development plan',
                    },
                    {
                        title: 'Building Plans',
                        description: 'Conceptual building plans (if building structures as part of subdivision)',
                    },
                ],
            },
            {
                title: 'Authorized Representatives',
                description: 'Architects, Engineers, or Consultants with authorization from the developer',
                documents: [
                    {
                        title: 'Authorization Letter',
                        description: 'Notarized Special Power of Attorney or Authorization Letter',
                    },
                    {
                        title: 'Zoning Clearance',
                        description: 'Valid Zoning Clearance Reference Number',
                    },
                    {
                        title: 'Project Plans',
                        description: 'Subdivision and/or building plans as applicable',
                    },
                ],
            },
        ],
        documents: [
            {
                id: 'subdivision-requirements',
                title: 'Subdivision Requirements',
                subtitle: 'Required for all subdivision projects',
                items: [
                    {
                        title: 'Zoning Clearance Reference Number',
                        description: 'Valid zoning clearance (prerequisite)',
                    },
                    {
                        title: 'Preliminary Subdivision Plan',
                        description: 'Lot layout, road network, open spaces',
                    },
                    {
                        title: 'Site Development Plan',
                        description: 'Infrastructure plans (roads, drainage, utilities)',
                    },
                    {
                        title: 'Legal Ownership Documents',
                        description: 'TCT/OCT, tax declaration, tax clearance',
                    },
                    {
                        title: 'Environmental Compliance',
                        description: 'ECC or Certificate of Non-Coverage (if applicable)',
                    },
                ],
            },
            {
                id: 'building-requirements',
                title: 'Building Review Requirements',
                subtitle: 'Required if building structures as part of subdivision',
                items: [
                    {
                        title: 'Conceptual Building Plans',
                        description: 'Architectural layout, site plan, elevations',
                    },
                    {
                        title: 'Building Specifications',
                        description: 'Building type, floors, footprint, setbacks, FAR',
                    },
                    {
                        title: 'Open Space Calculations',
                        description: 'Open space requirements and compliance',
                    },
                ],
            },
        ],
        serviceDetails: {
            description: 'Development Clearance is a planning-level review required for subdivision projects under PD 957 (Subdivision and Condominium Buyers\' Protective Decree). It evaluates proposed subdivision and building projects to ensure compliance with zoning, land use, and planning regulations.',
            purpose: [
                'Ensure compliance with zoning and planning regulations',
                'Validate lot layout, road/access, and open spaces (minimum 30%)',
                'Review building concepts for planning-level compliance (setbacks, FAR, open spaces)',
                'Provide prerequisite for Development Permit issuance',
            ],
            activitiesCovered: [
                'Subdivision of land into residential, commercial, or mixed-use lots',
                'Land development projects (roads, drainage, utilities, open spaces)',
                'Building projects as part of subdivision development',
                'Planning-level review of conceptual building designs',
            ],
            considerations: {
                title: 'Review Considerations',
                items: [
                    'Lot layout and minimum lot sizes compliance',
                    'Road network and access standards',
                    'Open space requirements (minimum 30% for subdivisions)',
                    'Zoning classification and permitted uses',
                    'Setbacks, Floor Area Ratio (FAR), and open space requirements for buildings',
                    'Planning-level compliance (not technical/structural review)',
                ],
            },
            evaluationProcess: [
                'Submit Development Clearance application with required documents',
                'Planning-level review of subdivision layout and infrastructure',
                'Building review (if applicable) for planning compliance',
                'Reviewer comments and recommendations',
                'Issuance of Development Clearance (Unofficial or Official)',
            ],
            processingTime: '5-10 working days',
            processingTimeNote: 'Processing time may vary depending on project complexity and document completeness',
            fees: 'Fees assessed based on LGU development clearance fee schedule',
            feesNote: 'Final amount will be displayed before payment confirmation',
            importantReminders: [
                'Development Clearance is required for ALL subdivisions (PD 957)',
                'Individual buildings on existing lots do NOT need Development Clearance - go directly to Building Permit',
                'Building Review in Development Clearance is planning-level only (not technical/structural)',
                'Development Clearance is a prerequisite for Development Permit and Certificate of Registration',
            ],
        },
    },
];

// Zone API functions

export interface ZoningClassification {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    allowed_uses?: string | null;
    color?: string | null;
    is_active: boolean;
}

export interface Zone {
    id: string;
    zoning_classification_id: string;
    label?: string | null;
    code: string; // From classification
    name: string; // From classification
    description?: string | null; // From classification
    allowed_uses?: string | null; // From classification
    geometry?: GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
    color?: string | null; // From classification
    is_active: boolean;
    boundary_type?: 'municipal' | 'barangay' | 'zoning';
    has_geometry?: boolean;
    created_at?: string;
    classification?: ZoningClassification | null;
}

export interface MunicipalBoundary extends Zone {
    boundary_type: 'municipal';
}

export interface BarangayBoundary extends Zone {
    boundary_type: 'barangay';
    barangay_name?: string;
    barangay_code?: string;
}

/**
 * Fetch all zones (with optional filters)
 */
export async function getZones(filters?: {
    search?: string;
    status?: 'active' | 'inactive' | 'no_boundaries' | 'with_boundaries';
}): Promise<Zone[]> {
    const params = new URLSearchParams();
    if (filters?.search) {
        params.append('search', filters.search);
    }
    if (filters?.status) {
        params.append('status', filters.status);
    }

    const url = `/admin/zoning/zones${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch zones');
    }

    const data = await response.json();
    // Handle paginated response
    if (data.data) {
        return data.data;
    }
    return data;
}

/**
 * Fetch a single zone by ID
 */
export async function getZone(id: string): Promise<Zone> {
    const response = await fetch(`/admin/zoning/zones/${id}`, {
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch zone');
    }

    const result = await response.json();
    return result.zone;
}

/**
 * Create a new zone (geometry optional)
 */
export async function createZone(data: {
    zoning_classification_id: string;
    label?: string | null;
    geometry?: GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
    is_active?: boolean;
}): Promise<Zone> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': getCsrfToken(),
    };

    const response = await fetch('/admin/zoning/zones', {
        method: 'POST',
        headers,
        credentials: 'include', // Always include cookies (more reliable than 'same-origin')
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create zone' }));
        const errorMessage = errorData.message || errorData.error || 'Failed to create zone';

        // Handle validation errors
        if (errorData.errors) {
            const firstError = Object.values(errorData.errors)[0];
            throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
        }

        throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.zone;
}

/**
 * Update an existing zone (can update geometry separately)
 */
export async function updateZone(
    id: string,
    data: {
        zoning_classification_id?: string;
        label?: string | null;
        geometry?: GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
        is_active?: boolean;
    }
): Promise<Zone> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': getCsrfToken(),
    };

    const response = await fetch(`/admin/zoning/zones/${id}`, {
        method: 'PATCH',
        headers,
        credentials: 'include', // Always include cookies (more reliable than 'same-origin')
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update zone' }));
        const errorMessage = errorData.message || errorData.error || 'Failed to update zone';

        // Handle validation errors
        if (errorData.errors) {
            const firstError = Object.values(errorData.errors)[0];
            throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
        }

        throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.zone;
}

/**
 * Export all zones as GeoJSON
 */
export async function exportZonesGeoJson(): Promise<Blob> {
    const response = await fetch('/admin/zoning/zones/export', {
        headers: {
            'Accept': 'application/geo+json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to export zones');
    }

    return await response.blob();
}

/**
 * Import zones from GeoJSON file
 */
export async function importZonesGeoJson(file: File): Promise<{
    success: boolean;
    message: string;
    errors?: string[];
}> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/admin/zoning/zones/import', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
        body: formData,
    });

    const result = await response.json();

    if (!response.ok && response.status !== 422) {
        throw new Error(result.message || 'Failed to import zones');
    }

    return result;
}

/**
 * Import municipality from GeoJSON file
 */
export async function importMunicipalityGeoJson(file: File): Promise<{
    success: boolean;
    message: string;
    zone?: any;
}> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/admin/zoning/zones/import-municipality', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
        body: formData,
    });

    const result = await response.json();

    if (!response.ok && response.status !== 422) {
        throw new Error(result.message || 'Failed to import municipality');
    }

    return result;
}

/**
 * Zoning Classification functions
 */

/**
 * Fetch all zoning classifications
 */
export async function getZoningClassifications(activeOnly = false): Promise<ZoningClassification[]> {
    const params = new URLSearchParams();
    if (activeOnly) {
        params.append('active_only', '1');
    }

    const url = `/admin/zoning/api/classifications${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch zoning classifications');
    }

    const result = await response.json();
    return result.data;
}

/**
 * Create a new zoning classification
 */
export async function createZoningClassification(data: {
    code: string;
    name: string;
    description?: string | null;
    allowed_uses?: string | null;
    color?: string | null;
    is_active?: boolean;
}): Promise<ZoningClassification> {
    const response = await fetch('/admin/zoning/classifications', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create classification' }));
        const errorMessage = errorData.message || errorData.error || 'Failed to create classification';

        if (errorData.errors) {
            const firstError = Object.values(errorData.errors)[0];
            throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
        }

        throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.classification;
}

/**
 * Update an existing zoning classification
 */
export async function updateZoningClassification(
    id: string,
    data: {
        code?: string;
        name?: string;
        description?: string | null;
        allowed_uses?: string | null;
        color?: string | null;
        is_active?: boolean;
    }
): Promise<ZoningClassification> {
    const response = await fetch(`/admin/zoning/classifications/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update classification' }));
        const errorMessage = errorData.message || errorData.error || 'Failed to update classification';

        if (errorData.errors) {
            const firstError = Object.values(errorData.errors)[0];
            throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
        }

        throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.classification;
}

/**
 * Delete a zoning classification
 */
export async function deleteZoningClassification(id: string): Promise<void> {
    const response = await fetch(`/admin/zoning/classifications/${id}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete classification');
    }
}

/**
 * Compliance Rule types and API functions
 */

export interface ComplianceRule {
    id: string;
    classification_code: string;
    name: string;
    allowed_uses: string[];
    front_setback: number;
    rear_setback: number;
    side_setback: number;
    floor_area_ratio: number;
    max_height: number;
    max_storeys: number;
    open_space_requirement: number;
    min_lot_area: number;
    is_active: boolean;
}

export async function createComplianceRule(data: Omit<ComplianceRule, 'id'>): Promise<ComplianceRule> {
    const response = await fetch('/admin/zoning/compliance-rules', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create compliance rule' }));
        const errorMessage = errorData.message || 'Failed to create compliance rule';
        if (errorData.errors) {
            const details = Object.values(errorData.errors).flat().join(', ');
            throw new Error(`${errorMessage}: ${details}`);
        }
        throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.rule;
}

export async function updateComplianceRule(id: string, data: Partial<Omit<ComplianceRule, 'id'>>): Promise<ComplianceRule> {
    const response = await fetch(`/admin/zoning/compliance-rules/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update compliance rule' }));
        const errorMessage = errorData.message || 'Failed to update compliance rule';
        if (errorData.errors) {
            const details = Object.values(errorData.errors).flat().join(', ');
            throw new Error(`${errorMessage}: ${details}`);
        }
        throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.rule;
}

export async function deleteComplianceRule(id: string): Promise<void> {
    const response = await fetch(`/admin/zoning/compliance-rules/${id}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete compliance rule');
    }
}

export async function seedComplianceRulesFromConfig(): Promise<{ message: string }> {
    const response = await fetch('/admin/zoning/compliance-rules/seed-from-config', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to seed compliance rules');
    }

    return response.json();
}

/**
 * Delete a zone
 */
export async function deleteZone(id: string): Promise<void> {
    const response = await fetch(`/admin/zoning/zones/${id}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete zone');
    }
}

/**
 * Boundary Management functions
 */

/**
 * Get the current municipal boundary
 */
export async function getMunicipalBoundary(): Promise<MunicipalBoundary | null> {
    const response = await fetch('/admin/zoning/classifications/boundaries/municipal', {
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch municipal boundary');
    }

    const result = await response.json();
    return result.boundary;
}

/**
 * Get all barangay boundaries
 */
export async function getBarangayBoundaries(): Promise<BarangayBoundary[]> {
    const response = await fetch('/admin/zoning/classifications/boundaries/barangay', {
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch barangay boundaries');
    }

    const result = await response.json();
    return result.boundaries;
}

/**
 * Create or update municipal boundary
 */
export async function createMunicipalBoundary(data: {
    geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
    label?: string | null;
    name?: string | null;
}): Promise<MunicipalBoundary> {
    const response = await fetch('/admin/zoning/classifications/boundaries/municipal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to save municipal boundary' }));
        const errorMessage = errorData.message || errorData.error || 'Failed to save municipal boundary';

        if (errorData.errors) {
            const firstError = Object.values(errorData.errors)[0];
            throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
        }

        throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.boundary;
}

/**
 * Create or update barangay boundary
 */
export async function createBarangayBoundary(data: {
    geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
    label: string;
    barangay_code?: string | null;
    name?: string | null;
}): Promise<BarangayBoundary> {
    const response = await fetch('/admin/zoning/classifications/boundaries/barangay', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to save barangay boundary' }));
        const errorMessage = errorData.message || errorData.error || 'Failed to save barangay boundary';

        if (errorData.errors) {
            const firstError = Object.values(errorData.errors)[0];
            throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
        }

        throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.boundary;
}

/**
 * Update a barangay boundary
 */
export async function updateBarangayBoundary(id: string, data: {
    geometry?: GeoJSON.Polygon | GeoJSON.MultiPolygon;
    label?: string;
    barangay_code?: string | null;
    name?: string | null;
}): Promise<BarangayBoundary> {
    const response = await fetch(`/admin/zoning/classifications/boundaries/barangay/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update barangay boundary' }));
        const errorMessage = errorData.message || errorData.error || 'Failed to update barangay boundary';

        if (errorData.errors) {
            const firstError = Object.values(errorData.errors)[0];
            throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
        }

        throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.boundary;
}

/**
 * Delete the municipal boundary
 */
export async function deleteMunicipalBoundary(): Promise<void> {
    const response = await fetch('/admin/zoning/classifications/boundaries/municipal', {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete municipal boundary');
    }
}

/**
 * Delete a barangay boundary
 */
export async function deleteBarangayBoundary(id: string): Promise<void> {
    const response = await fetch(`/admin/zoning/classifications/boundaries/barangay/${id}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete barangay boundary');
    }
}

/**
 * Delete all barangay boundaries
 */
export async function deleteAllBarangayBoundaries(): Promise<{ success: boolean; message: string }> {
    const response = await fetch('/admin/zoning/classifications/boundaries/barangay/all', {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete all barangay boundaries');
    }

    return await response.json();
}

/**
 * Import barangay boundaries from GeoJSON file
 */
export async function importBarangayBoundaries(file: File): Promise<{
    success: boolean;
    message: string;
    errors?: string[];
}> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/admin/zoning/classifications/boundaries/barangay/import', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
        body: formData,
    });

    const result = await response.json();

    if (!response.ok && response.status !== 422) {
        throw new Error(result.message || 'Failed to import barangay boundaries');
    }

    return result;
}

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
                title: 'Registered Property Owners',
                description: 'Individual landowners or entities (Corporations, Partnerships, Cooperatives) whose name is on the TCT/OCT',
                documents: [
                    {
                        title: 'Proof of Ownership',
                        description: 'Scanned Certified True Copy of the TCT/OCT',
                    },
                    {
                        title: 'Tax Declaration',
                        description: 'Latest Tax Declaration for the property',
                    },
                    {
                        title: 'Tax Clearance',
                        description: 'Latest Real Property Tax Receipt',
                    },
                    {
                        title: 'Barangay Clearance',
                        description: 'Scanned copy of the clearance for construction',
                    },
                ],
            },
            {
                title: 'Developers',
                description: 'Real estate firms or individuals with a Joint Venture Agreement (JVA) or Memorandum of Agreement (MOA) with the landowner',
                documents: [
                    {
                        title: 'Proof of Ownership',
                        description: 'Scanned Certified True Copy of the TCT/OCT (from landowner)',
                    },
                    {
                        title: 'Joint Venture Agreement / Memorandum of Agreement',
                        description: 'JVA or MOA with the landowner',
                    },
                    {
                        title: 'Tax Declaration',
                        description: 'Latest Tax Declaration for the property',
                    },
                    {
                        title: 'Tax Clearance',
                        description: 'Latest Real Property Tax Receipt',
                    },
                    {
                        title: 'Authorization',
                        description: 'Notarized SPA or Secretary\'s Certificate',
                    },
                    {
                        title: 'Barangay Clearance',
                        description: 'Scanned copy of the clearance for construction',
                    },
                ],
            },
            {
                title: 'Authorized Representatives',
                description: 'Architects, Engineers, or Consultants with a Notarized Special Power of Attorney (SPA) or Authorization Letter',
                documents: [
                    {
                        title: 'Proof of Ownership',
                        description: 'Scanned Certified True Copy of the TCT/OCT (from landowner)',
                    },
                    {
                        title: 'Notarized Special Power of Attorney / Authorization Letter',
                        description: 'Notarized SPA or Authorization Letter from the property owner',
                    },
                    {
                        title: 'Tax Declaration',
                        description: 'Latest Tax Declaration for the property',
                    },
                    {
                        title: 'Tax Clearance',
                        description: 'Latest Real Property Tax Receipt',
                    },
                    {
                        title: 'Barangay Clearance',
                        description: 'Scanned copy of the clearance for construction',
                    },
                ],
            },
            {
                title: 'Lessees (Tenants)',
                description: 'Business owners or individuals with a valid Contract of Lease and Affidavit of Consent from the landowner',
                documents: [
                    {
                        title: 'Contract of Lease',
                        description: 'Valid Contract of Lease with the landowner',
                    },
                    {
                        title: 'Affidavit of Consent',
                        description: 'Affidavit of Consent from the landowner',
                    },
                    {
                        title: 'Tax Declaration',
                        description: 'Latest Tax Declaration for the property',
                    },
                    {
                        title: 'Tax Clearance',
                        description: 'Latest Real Property Tax Receipt',
                    },
                    {
                        title: 'Barangay Clearance',
                        description: 'Scanned copy of the clearance for construction',
                    },
                ],
            },
            {
                title: 'Other Legal Claimants',
                description: 'Heirs (with Deed of Extrajudicial Settlement of Estate) or Buyers (with Deed of Absolute Sale)',
                documents: [
                    {
                        title: 'Deed of Extrajudicial Settlement of Estate',
                        description: 'For heirs: Deed of Extrajudicial Settlement of Estate',
                    },
                    {
                        title: 'Deed of Absolute Sale',
                        description: 'For buyers: Deed of Absolute Sale',
                    },
                    {
                        title: 'Tax Declaration',
                        description: 'Latest Tax Declaration for the property',
                    },
                    {
                        title: 'Tax Clearance',
                        description: 'Latest Real Property Tax Receipt',
                    },
                    {
                        title: 'Barangay Clearance',
                        description: 'Scanned copy of the clearance for construction',
                    },
                ],
            },
        ],
        documents: [
            {
                id: 'legal-ownership',
                title: 'Legal Ownership Documents',
                subtitle: 'Required documents for proof of ownership',
                items: [
            {
                title: 'Proof of Ownership',
                description: 'Scanned Certified True Copy of the TCT/OCT',
            },
            {
                title: 'Tax Declaration',
                description: 'Latest Tax Declaration for the property',
            },
            {
                title: 'Tax Clearance',
                description: 'Latest Real Property Tax Receipt',
            },
            {
                title: 'Authorization',
                description: 'Notarized SPA or Secretary\'s Certificate (if the applicant isn\'t the owner)',
            },
            {
                title: 'Barangay Clearance',
                description: 'Scanned copy of the clearance for construction',
            },
        ],
            },
            {
                id: 'zoning-requirements',
                title: 'Zoning Requirements',
                subtitle: 'Zoning Clearance (ZCS) Requirements',
                items: [
            {
                title: 'Vicinity Map',
                description: 'Showing the project in relation to landmarks',
            },
            {
                title: 'Site Development Plan (Basic)',
                description: 'Showing the "footprint" of the building, setbacks (distance from edges), and parking slots',
            },
            {
                title: 'Affidavit of Undertaking',
                description: 'Only if there are specific zoning conditions like "Non-objection from neighbors"',
            },
                    {
                        title: 'Lot Plans',
                        description: 'Detailed lot plans showing property boundaries',
                    },
                ],
            },
            {
                id: 'subdivision-building-review',
                title: 'Subdivision & Building Review Requirements',
                subtitle: 'Required plans and documents for building review',
                items: [
            {
                title: 'Architectural Plans',
                description: 'Signed and Sealed digital copies of Perspectives, Floor Plans, Sections, and Elevations',
            },
            {
                title: 'Structural Plans',
                description: 'Foundation, Columns, Beams',
            },
            {
                title: 'Structural Analysis & Design',
                description: 'Required for 2-storeys and above',
            },
            {
                title: 'Boring/Soil Test',
                description: 'Required for 3-storeys and above',
            },
            {
                title: 'Sanitary/Plumbing Plans',
                description: 'Layout and Septic Tank details',
            },
            {
                title: 'Electrical Plans',
                description: 'Load Schedule and Wiring Diagrams',
            },
            {
                title: 'Engineering Reports',
                description: 'Bill of Materials (Cost Estimate) and Technical Specifications',
            },
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
];

// CLUP and Zoning Classification API functions

export interface Clup {
    id: string;
    referenceNo: string;
    lguName: string;
    coverageStartYear: number;
    coverageEndYear: number;
    coveragePeriod: string;
    approvalDate: string | null;
    approvingBody: string | null;
    resolutionNo: string | null;
    status: string;
    createdAt: string;
}

export interface ZoningClassification {
    id: string;
    zoningCode: string;
    zoneName: string;
    landUseCategory: string | null;
    allowedUses: string | null;
    conditionalUses: string | null;
    prohibitedUses: string | null;
}

export interface ZoningPolygon {
    id: string;
    barangay: string | null;
    areaSqm: number | null;
    geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
    zoningId?: string;
    zoningCode?: string;
    zoneName?: string;
}

/**
 * Fetch all CLUPs
 */
export async function getClups(): Promise<Clup[]> {
    const response = await fetch('/admin/zoning/clup?perPage=1000', {
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch CLUPs');
    }

    const data = await response.json();
    // Handle paginated response
    if (data.data) {
        return data.data;
    }
    return data;
}

/**
 * Fetch zoning classifications for a CLUP
 */
export async function getClassifications(clupId: string): Promise<ZoningClassification[]> {
    const response = await fetch(`/admin/zoning/clup/${clupId}/classifications`, {
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch classifications');
    }

    return await response.json();
}

/**
 * Fetch polygons for a zoning classification
 */
export async function getPolygons(zoningId: string): Promise<ZoningPolygon[]> {
    const response = await fetch(`/admin/zoning/clup/classifications/${zoningId}/polygons`, {
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch polygons');
    }

    return await response.json();
}

/**
 * Fetch all polygons for a CLUP
 */
export async function getAllPolygonsForClup(clupId: string): Promise<ZoningPolygon[]> {
    const response = await fetch(`/admin/zoning/clup/${clupId}/polygons`, {
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch polygons');
    }

    return await response.json();
}

/**
 * Save a new polygon
 */
export async function savePolygon(data: {
    zoning_id: string;
    barangay?: string | null;
    area_sqm?: number | null;
    geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}): Promise<ZoningPolygon> {
    const response = await fetch('/admin/zoning/clup/polygons', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save polygon');
    }

    const result = await response.json();
    return result.polygon;
}

/**
 * Update an existing polygon
 */
export async function updatePolygon(
    id: string,
    data: {
        barangay?: string | null;
        area_sqm?: number | null;
        geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
    }
): Promise<ZoningPolygon> {
    const response = await fetch(`/admin/zoning/clup/polygons/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update polygon');
    }

    const result = await response.json();
    return result.polygon;
}

/**
 * Delete a polygon
 */
export async function deletePolygon(id: string): Promise<void> {
    const response = await fetch(`/admin/zoning/clup/polygons/${id}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete polygon');
    }
}

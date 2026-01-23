import { useMemo } from 'react';
import { CheckCircle } from 'lucide-react';

interface ReviewStepProps {
    data: {
        application_category: 'individual_lot' | 'subdivision_development';
        applicant_type: 'owner' | 'authorized_rep' | 'contractor';
        contact_number: string;
        contact_email: string;
        tax_dec_ref_no: string;
        barangay_permit_ref_no: string;
        pin_lat: number | null;
        pin_lng: number | null;
        lot_address: string;
        province: string;
        municipality: string;
        barangay: string;
        street_name: string;
        lot_owner: string;
        lot_area_total: number;
        is_subdivision: boolean;
        subdivision_name: string;
        block_no: string;
        lot_no: string;
        total_lots_planned: number | null;
        has_subdivision_plan: boolean;
        land_use_type: string;
        project_type: string;
        building_type: string;
        project_description: string;
        existing_structure: string;
        number_of_storeys: number | null;
        floor_area_sqm: number | null;
        purpose: string;
    };
    category: 'individual_lot' | 'subdivision_development';
}

export default function ReviewStep({ data, category }: ReviewStepProps) {
    const formatValue = (value: unknown): string => {
        if (value === null || value === undefined || value === '') {
            return 'Not provided';
        }
        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        if (typeof value === 'number') {
            return value.toLocaleString();
        }
        return String(value);
    };

    const reviewSections = useMemo(() => {
        const sections = [
            {
                title: 'Prerequisites',
                items: [
                    { label: 'Tax Declaration Reference', value: data.tax_dec_ref_no },
                    { label: 'Barangay Permit Reference', value: data.barangay_permit_ref_no },
                ],
            },
            {
                title: 'Location',
                items: [
                    {
                        label: 'Address',
                        value: data.lot_address ||
                            [data.street_name, data.barangay, data.municipality, data.province]
                                .filter(Boolean)
                                .join(', ') || 'Not provided'
                    },
                    { label: 'Coordinates', value: data.pin_lat && data.pin_lng ? `${data.pin_lat}, ${data.pin_lng}` : 'Not selected' },
                ],
            },
            {
                title: 'Applicant Information',
                items: [
                    { label: 'Applicant Type', value: data.applicant_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) },
                    { label: 'Contact Number', value: data.contact_number },
                    { label: 'Contact Email', value: data.contact_email || 'Not provided' },
                ],
            },
            {
                title: 'Property Information',
                items: [
                    { label: 'Lot Owner / Developer', value: data.lot_owner },
                    { label: 'Total Lot Area', value: `${formatValue(data.lot_area_total)} sqm` },
                    ...(category === 'individual_lot' && data.is_subdivision
                        ? [
                            { label: 'Subdivision Name', value: data.subdivision_name },
                            { label: 'Block Number', value: data.block_no },
                            { label: 'Lot Number', value: data.lot_no },
                        ]
                        : []),
                    ...(category === 'subdivision_development'
                        ? [
                            { label: 'Proposed Subdivision Name', value: data.subdivision_name },
                            { label: 'Total Lots Planned', value: formatValue(data.total_lots_planned) },
                            { label: 'Has Subdivision Plan', value: formatValue(data.has_subdivision_plan) },
                        ]
                        : []),
                ],
            },
            {
                title: 'Project Details',
                items: [
                    { label: 'Land Use Type', value: data.land_use_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) },
                    { label: 'Project Type', value: data.project_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) },
                    ...(category === 'individual_lot' && data.building_type
                        ? [{ label: 'Building Type', value: data.building_type }]
                        : []),
                    { label: 'Project Description', value: data.project_description },
                    { label: 'Existing Structure', value: data.existing_structure.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) },
                    ...(category === 'individual_lot'
                        ? [
                            ...(data.number_of_storeys ? [{ label: 'Number of Storeys', value: formatValue(data.number_of_storeys) }] : []),
                            ...(data.floor_area_sqm ? [{ label: 'Floor Area', value: `${formatValue(data.floor_area_sqm)} sqm` }] : []),
                        ]
                        : []),
                    { label: 'Purpose', value: data.purpose },
                ],
            },
        ];

        return sections;
    }, [data, category]);

    return (
        <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                    <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                        Please review all information before submitting. Documents will be uploaded after submission.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {reviewSections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            {section.title}
                        </h3>
                        <dl className="space-y-3">
                            {section.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex flex-col sm:flex-row sm:items-start">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-1/3 sm:pr-4">
                                        {item.label}:
                                    </dt>
                                    <dd className="text-sm text-gray-900 dark:text-white sm:w-2/3">
                                        {formatValue(item.value)}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                ))}
            </div>
        </div>
    );
}

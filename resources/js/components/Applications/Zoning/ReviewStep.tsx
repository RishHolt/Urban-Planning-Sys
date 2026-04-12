import { useMemo } from 'react';
import { CheckCircle } from 'lucide-react';

interface ReviewStepProps {
    data: {
        applicant_type: string;
        is_representative: boolean;
        representative_name: string;
        lot_owner: string;
        lot_owner_contact_number: string;
        lot_owner_contact_email: string;
        contact_number: string;
        contact_email: string;

        pin_lat: number | null;
        pin_lng: number | null;
        lot_address: string;
        province: string;
        municipality: string;
        barangay: string;
        street_name: string;

        land_use_type: string;
        project_type: string;
        building_type: string;

        tct_no: string;
        tax_declaration_no: string;
        lot_area_total: number;
        building_footprint_sqm: number | null;
        is_subdivision: boolean;
        subdivision_name: string;
        block_no: string;
        lot_no: string;
        project_cost: number | null;

        front_setback_m: number | null;
        rear_setback_m: number | null;
        side_setback_left_m: number | null;
        side_setback_right_m: number | null;
        number_of_storeys: number | null;
        floor_area_sqm: number | null;
        number_of_units: number | null;
        project_description: string;
        purpose: string;

        assessed_fee: number;
    };
}

export default function ReviewStep({ data }: ReviewStepProps) {
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

    const formatCurrency = (value: number | null): string => {
        if (!value) return 'Not provided';
        return `₱ ${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const reviewSections = useMemo(() => {
        const applicantItems = [
            { label: 'Applicant Type', value: (data.applicant_type || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) },
        ];

        if (data.applicant_type === 'representative') {
            applicantItems.push(
                { label: 'Representative Name', value: data.representative_name },
                { label: 'Lot Owner / Title Holder', value: data.lot_owner },
                { label: "Owner's Contact Number", value: data.lot_owner_contact_number },
                { label: "Owner's Contact Email", value: data.lot_owner_contact_email },
            );
        } else {
            applicantItems.push(
                { label: data.applicant_type === 'corporation' ? 'Company / Organization Name' : 'Applicant Name', value: data.lot_owner },
            );
            if (data.applicant_type === 'corporation') {
                applicantItems.push({ label: 'Representative Name', value: data.representative_name });
            }
        }

        applicantItems.push(
            { label: 'Contact Number', value: data.contact_number },
            { label: 'Contact Email', value: data.contact_email },
        );

        const sections = [
            {
                title: 'Applicant Information',
                items: applicantItems,
            },
            {
                title: 'Location & Project Classification',
                items: [
                    { label: 'Address', value: data.lot_address },
                    { label: 'Coordinates', value: data.pin_lat && data.pin_lng ? `${data.pin_lat.toFixed(6)}, ${data.pin_lng.toFixed(6)}` : 'Not selected' },
                    { label: 'Land Use Type', value: (data.land_use_type || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) },
                    { label: 'Project Type', value: (data.project_type || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) },
                    { label: 'Building Type', value: data.building_type },
                ],
            },
            {
                title: 'Lot & Title Information',
                items: [
                    { label: 'TCT No.', value: data.tct_no },
                    { label: 'Tax Declaration No.', value: data.tax_declaration_no },
                    { label: 'Total Lot Area', value: data.lot_area_total ? `${formatValue(data.lot_area_total)} sqm` : 'Not provided' },
                    { label: 'Building Footprint', value: data.building_footprint_sqm ? `${formatValue(data.building_footprint_sqm)} sqm` : 'Not provided' },
                    { label: 'Estimated Project Cost', value: formatCurrency(data.project_cost) },
                    ...(data.is_subdivision
                        ? [
                            { label: 'Subdivision Name', value: data.subdivision_name },
                            { label: 'Block No.', value: data.block_no },
                            { label: 'Lot No.', value: data.lot_no },
                        ]
                        : []),
                ],
            },
            {
                title: 'Building & Structure Details',
                items: [
                    { label: 'Number of Storeys', value: data.number_of_storeys },
                    { label: 'Total Floor Area', value: data.floor_area_sqm ? `${formatValue(data.floor_area_sqm)} sqm` : 'Not provided' },
                    { label: 'Number of Units', value: data.number_of_units },
                    { label: 'Front Setback', value: data.front_setback_m ? `${data.front_setback_m} m` : 'Not provided' },
                    { label: 'Rear Setback', value: data.rear_setback_m ? `${data.rear_setback_m} m` : 'Not provided' },
                    { label: 'Side Setback (Left)', value: data.side_setback_left_m ? `${data.side_setback_left_m} m` : 'Not provided' },
                    { label: 'Side Setback (Right)', value: data.side_setback_right_m ? `${data.side_setback_right_m} m` : 'Not provided' },
                    { label: 'Description', value: data.project_description },
                    { label: 'Purpose', value: data.purpose },
                ],
            },
            {
                title: 'Fee Assessment',
                items: [
                    { label: 'Assessed Fee', value: formatCurrency(data.assessed_fee) },
                ],
            },
        ];

        return sections;
    }, [data]);

    return (
        <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                    <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                        Please review all information before submitting.
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
                                    <dd className="text-sm text-gray-900 dark:text-white sm:w-2/3 break-words">
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

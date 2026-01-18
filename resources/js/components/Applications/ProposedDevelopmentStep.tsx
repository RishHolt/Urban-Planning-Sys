import Input from '../Input';
import FileUpload from '../FileUpload';
import { Building, FileText, Image } from 'lucide-react';

interface ProposedDevelopmentStepProps {
    data: {
        applicationType: 'new_construction' | 'renovation' | 'change_of_use' | 'others';
        proposedUse: 'residential' | 'commercial' | 'mixed_use' | 'institutional';
        projectDescription?: string;
        siteDevelopmentPlan?: File | null;
        existingBuildingPhotos?: File[] | null;
        previousUse?: string;
        justification?: string;
    };
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
}

export default function ProposedDevelopmentStep({
    data,
    setData,
    errors,
}: ProposedDevelopmentStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                    Proposed Development / Intended Use
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Describe what you want to build or change on the property.
                </p>
            </div>

            {/* Application Type */}
            <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    Type of Application <span className="text-red-500">*</span>
                </label>
                <div className="gap-4 grid grid-cols-2 md:grid-cols-4">
                    {([
                        { value: 'new_construction', label: 'New Construction' },
                        { value: 'renovation', label: 'Renovation' },
                        { value: 'change_of_use', label: 'Change of Use' },
                        { value: 'others', label: 'Others' },
                    ] as const).map(({ value, label }) => (
                        <label
                            key={value}
                            className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-600"
                        >
                            <input
                                type="radio"
                                name="applicationType"
                                value={value}
                                checked={data.applicationType === value}
                                onChange={(e) => setData('applicationType', e.target.value)}
                                className="text-primary"
                            />
                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                                {label}
                            </span>
                        </label>
                    ))}
                </div>
                {errors.applicationType && (
                    <p className="mt-1 text-red-500 text-sm">{errors.applicationType}</p>
                )}
            </div>

            {/* Proposed Use */}
            <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    Proposed Use <span className="text-red-500">*</span>
                </label>
                <div className="gap-4 grid grid-cols-2 md:grid-cols-4">
                    {([
                        { value: 'residential', label: 'Residential' },
                        { value: 'commercial', label: 'Commercial' },
                        { value: 'mixed_use', label: 'Mixed-use' },
                        { value: 'institutional', label: 'Institutional' },
                    ] as const).map(({ value, label }) => (
                        <label
                            key={value}
                            className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-600"
                        >
                            <input
                                type="radio"
                                name="proposedUse"
                                value={value}
                                checked={data.proposedUse === value}
                                onChange={(e) => setData('proposedUse', e.target.value)}
                                className="text-primary"
                            />
                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                                {label}
                            </span>
                        </label>
                    ))}
                </div>
                {errors.proposedUse && (
                    <p className="mt-1 text-red-500 text-sm">{errors.proposedUse}</p>
                )}
            </div>

            {/* Project Description */}
            <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    Brief Project Description
                </label>
                <textarea
                    name="projectDescription"
                    rows={4}
                    placeholder="Describe your proposed development project..."
                    value={data.projectDescription || ''}
                    onChange={(e) => setData('projectDescription', e.target.value)}
                    className={`
                        w-full px-4 py-3 rounded-lg border transition-colors
                        ${errors.projectDescription 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
                        }
                        bg-white dark:bg-dark-surface
                        text-gray-900 dark:text-white
                        placeholder:text-gray-400 dark:placeholder:text-gray-500
                        focus:outline-none focus:ring-2 focus:ring-opacity-20
                    `}
                />
                {errors.projectDescription && (
                    <p className="mt-1 text-red-500 text-sm">{errors.projectDescription}</p>
                )}
            </div>

            {/* Conditional Documents based on Application Type */}
            {data.applicationType === 'new_construction' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <FileUpload
                        label="Site Development Plan"
                        accept="image/*,.pdf"
                        maxSizeMB={10}
                        value={data.siteDevelopmentPlan}
                        onChange={(file) => setData('siteDevelopmentPlan', file)}
                        error={errors.siteDevelopmentPlan}
                        required
                        allowedTypes={['image/*', 'application/pdf']}
                    />
                </div>
            )}

            {data.applicationType === 'renovation' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <FileUpload
                        label="Existing Building Photos"
                        accept="image/*"
                        maxSizeMB={10}
                        multiple
                        value={data.existingBuildingPhotos}
                        onChange={(files) => setData('existingBuildingPhotos', files)}
                        error={errors.existingBuildingPhotos}
                        required
                        allowedTypes={['image/*']}
                    />
                </div>
            )}

            {data.applicationType === 'change_of_use' && (
                <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <Input
                        type="text"
                        name="previousUse"
                        label="Previous Use"
                        placeholder="Describe the previous use of the property"
                        value={data.previousUse || ''}
                        onChange={(e) => setData('previousUse', e.target.value)}
                        icon={<Building size={20} />}
                        error={errors.previousUse}
                        required
                    />
                    <div>
                        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                            Justification <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="justification"
                            rows={4}
                            placeholder="Explain why you want to change the use of the property..."
                            value={data.justification || ''}
                            onChange={(e) => setData('justification', e.target.value)}
                            className={`
                                w-full px-4 py-3 rounded-lg border transition-colors
                                ${errors.justification 
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                    : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
                                }
                                bg-white dark:bg-dark-surface
                                text-gray-900 dark:text-white
                                placeholder:text-gray-400 dark:placeholder:text-gray-500
                                focus:outline-none focus:ring-2 focus:ring-opacity-20
                            `}
                            required
                        />
                        {errors.justification && (
                            <p className="mt-1 text-red-500 text-sm">{errors.justification}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

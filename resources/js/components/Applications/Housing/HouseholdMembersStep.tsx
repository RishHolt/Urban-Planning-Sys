import Button from '../../Button';
import Input from '../../Input';
import { HousingApplicationFormData, HouseholdMember, Gender, Relationship } from '../../../pages/Applications/Housing/types';

interface HouseholdMembersStepProps {
    data: HousingApplicationFormData;
    onAddMember: () => void;
    onRemoveMember: (index: number) => void;
    onUpdateMember: (index: number, field: keyof HouseholdMember, value: any) => void;
}

export default function HouseholdMembersStep({ 
    data, 
    onAddMember, 
    onRemoveMember, 
    onUpdateMember 
}: HouseholdMembersStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                    Household Members
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Add household members if applicable. This is optional.
                </p>
            </div>

            <div className="space-y-4">
                {data.householdMembers.map((member, index) => (
                    <div key={index} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Member {index + 1}</h3>
                            <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                onClick={() => onRemoveMember(index)}
                            >
                                Remove
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Full Name"
                                value={member.full_name}
                                onChange={(e) => onUpdateMember(index, 'full_name', e.target.value)}
                                required
                            />
                            <div className="w-full">
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Relationship <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={member.relationship}
                                    onChange={(e) => onUpdateMember(index, 'relationship', e.target.value as Relationship)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                                >
                                    <option value="spouse">Spouse</option>
                                    <option value="child">Child</option>
                                    <option value="parent">Parent</option>
                                    <option value="sibling">Sibling</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <Input
                                type="date"
                                label="Birth Date"
                                value={member.birth_date}
                                onChange={(e) => onUpdateMember(index, 'birth_date', e.target.value)}
                                required
                            />
                            <div className="w-full">
                                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                    Gender <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={member.gender}
                                    onChange={(e) => onUpdateMember(index, 'gender', e.target.value as Gender)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                                >
                                    <option value="">Select...</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <Input
                                label="Occupation"
                                value={member.occupation}
                                onChange={(e) => onUpdateMember(index, 'occupation', e.target.value)}
                            />
                            <Input
                                label="Monthly Income"
                                type="number"
                                value={member.monthly_income}
                                onChange={(e) => onUpdateMember(index, 'monthly_income', e.target.value)}
                            />
                            <div className="md:col-span-2">
                                <label className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={member.is_dependent}
                                        onChange={(e) => onUpdateMember(index, 'is_dependent', e.target.checked)}
                                        className="border-gray-300 rounded focus:ring-primary text-primary"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300">Is Dependent</span>
                                </label>
                            </div>
                        </div>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={onAddMember}
                    className="w-full"
                >
                    Add Household Member
                </Button>
            </div>
        </div>
    );
}

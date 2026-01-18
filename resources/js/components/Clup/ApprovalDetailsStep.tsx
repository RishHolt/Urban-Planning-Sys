import Input from '../Input';

interface ApprovalDetailsStepProps {
    data: {
        approving_body: string;
        resolution_no: string;
    };
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
}

export default function ApprovalDetailsStep({
    data,
    setData,
    errors,
}: ApprovalDetailsStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                    Approval Details
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Provide information about the approval and resolution details (optional).
                </p>
            </div>

            <div>
                <Input
                    type="text"
                    name="approving_body"
                    label="Approving Body"
                    value={data.approving_body}
                    onChange={(e) => setData('approving_body', e.target.value)}
                    error={errors.approving_body}
                    placeholder="e.g., Sangguniang Panlungsod ng Caloocan"
                />
            </div>

            <div>
                <Input
                    type="text"
                    name="resolution_no"
                    label="Resolution Number"
                    value={data.resolution_no}
                    onChange={(e) => setData('resolution_no', e.target.value)}
                    error={errors.resolution_no}
                    placeholder="e.g., SP Res. No. 12-2016"
                />
            </div>
        </div>
    );
}

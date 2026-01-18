import { useRef, useState } from 'react';
import { Upload, X, File as FileIcon } from 'lucide-react';
import { validateFileType, validateFileSize } from '../lib/validation';

interface FileUploadProps {
    label?: string;
    accept?: string;
    maxSizeMB?: number;
    multiple?: boolean;
    required?: boolean;
    error?: string;
    value?: File | File[] | null;
    onChange?: (files: File | File[] | null) => void;
    className?: string;
    allowedTypes?: string[];
}

export default function FileUpload({
    label,
    accept,
    maxSizeMB = 10,
    multiple = false,
    required = false,
    error,
    value,
    onChange,
    className = '',
    allowedTypes,
}: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [validationError, setValidationError] = useState<string>('');

    const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) {
            onChange?.(null);
            return;
        }

        const fileArray = Array.from(files);
        const errors: string[] = [];

        fileArray.forEach((file) => {
            if (allowedTypes && !validateFileType(file, allowedTypes)) {
                errors.push(`${file.name}: Invalid file type`);
            }
            if (!validateFileSize(file, maxSizeMB)) {
                errors.push(`${file.name}: File size exceeds ${maxSizeMB}MB`);
            }
        });

        if (errors.length > 0) {
            setValidationError(errors.join(', '));
            return;
        }

        setValidationError('');
        if (multiple) {
            const existingFiles = Array.isArray(value) ? value : [];
            onChange?.([...existingFiles, ...fileArray]);
        } else {
            onChange?.(fileArray[0]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
    };

    const removeFile = (index?: number) => {
        if (multiple && Array.isArray(value) && index !== undefined) {
            const newFiles = value.filter((_, i) => i !== index);
            onChange?.(newFiles.length > 0 ? newFiles : null);
        } else {
            onChange?.(null);
        }
    };

    const getFileDisplay = () => {
        if (!value) {
            return null;
        }

        if (Array.isArray(value)) {
            return value.map((file, index) => (
                <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg"
                >
                    <FileIcon size={16} className="text-gray-500 dark:text-gray-400" />
                    <span className="flex-1 text-gray-700 dark:text-gray-300 text-sm truncate">
                        {file.name}
                    </span>
                    <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                    >
                        <X size={16} />
                    </button>
                </div>
            ));
        }

        return (
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                <FileIcon size={16} className="text-gray-500 dark:text-gray-400" />
                <span className="flex-1 text-gray-700 dark:text-gray-300 text-sm truncate">
                    {value.name}
                </span>
                <button
                    type="button"
                    onClick={() => removeFile()}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                >
                    <X size={16} />
                </button>
            </div>
        );
    };

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                    relative flex flex-col items-center justify-center
                    border-2 border-dashed rounded-lg p-6 transition-colors
                    ${dragActive 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
                    }
                    ${error || validationError 
                        ? 'border-red-500 focus:border-red-500' 
                        : ''
                    }
                    bg-white dark:bg-dark-surface
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleChange}
                    className="hidden"
                />
                <Upload
                    size={32}
                    className={`mb-2 ${dragActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}
                />
                <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
                    Drag and drop files here, or{' '}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-primary hover:text-primary/80 font-medium"
                    >
                        browse
                    </button>
                </p>
                <p className="mt-1 text-gray-500 dark:text-gray-500 text-xs text-center">
                    Max size: {maxSizeMB}MB
                </p>
            </div>
            {getFileDisplay()}
            {(error || validationError) && (
                <p className="mt-1 text-red-500 text-sm">{error || validationError}</p>
            )}
        </div>
    );
}

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import Button from '@/components/Button';

interface DocumentUploaderProps {
    onUpload: (file: File) => void;
    label: string;
    description?: string;
    processing?: boolean;
    accept?: Record<string, string[]>;
    maxSize?: number; // in bytes
}

export default function DocumentUploader({
    onUpload,
    label,
    description = "PDF, JPG, or PNG up to 10MB",
    processing = false,
    accept = {
        'application/pdf': ['.pdf'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
    },
    maxSize = 10 * 1024 * 1024,
}: DocumentUploaderProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0];
            setFile(selectedFile);

            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => setPreview(reader.result as string);
                reader.readAsDataURL(selectedFile);
            } else {
                setPreview(null);
            }
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept,
        maxFiles: 1,
        maxSize,
        disabled: processing,
    });

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(null);
        setPreview(null);
    };

    const handleUpload = () => {
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={`
                    relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer
                    flex flex-col items-center justify-center text-center
                    ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                    ${processing ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <input {...getInputProps()} />

                {file ? (
                    <div className="space-y-4 w-full flex flex-col items-center">
                        {preview ? (
                            <img src={preview} alt="Preview" className="h-32 w-auto rounded shadow-lg object-cover" />
                        ) : (
                            <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-full text-primary">
                                <FileText size={48} />
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                                {file.name}
                            </span>
                            <button
                                onClick={handleClear}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-full transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                ) : (
                    <>
                        <div className={`p-4 rounded-full mb-4 ${isDragActive ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}>
                            <Upload size={32} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {isDragActive ? 'Drop your file here' : 'Drag & drop or browse'}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-bold">
                                {description}
                            </p>
                        </div>
                    </>
                )}

                {processing && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-dark-surface/60 backdrop-blur-sm flex items-center justify-center rounded-xl z-10 font-bold text-primary">
                        <Loader2 className="animate-spin mr-2" />
                        Uploading...
                    </div>
                )}
            </div>

            {fileRejections.length > 0 && (
                <p className="text-xs text-red-500 font-medium">
                    {fileRejections[0].errors[0].message}
                </p>
            )}

            {file && !processing && (
                <Button
                    className="w-full"
                    onClick={(e) => { e.preventDefault(); handleUpload(); }}
                >
                    Confirm Upload
                </Button>
            )}
        </div>
    );
}

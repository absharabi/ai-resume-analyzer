import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import type { FileRejection } from 'react-dropzone';

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0] || null;

        setError(null);
        onFileSelect?.(file);
    }, [onFileSelect]);

    const onDropRejected = useCallback((rejections: FileRejection[]) => {
        if (!rejections.length) return;
        const rejection = rejections[0];
        const isSize = rejection.errors.some((err) => err.code === "file-too-large");
        const isType = rejection.errors.some((err) => err.code === "file-invalid-type");
        if (isSize) {
            setError("File is too large. Please upload a PDF under 20MB.");
        } else if (isType) {
            setError("Only PDF files are supported.");
        } else {
            setError("Unable to accept this file. Please try another PDF.");
        }
        onFileSelect?.(null);
    }, [onFileSelect]);

    const maxFileSize = 20 * 1024 * 1024; // 20MB in bytes

    const {getRootProps, getInputProps, acceptedFiles} = useDropzone({
        onDrop,
        onDropRejected,
        multiple: false,
        accept: { 'application/pdf': ['.pdf']},
        maxSize: maxFileSize,
    })

    const file = acceptedFiles[0] || null;



    return (
        <div className="w-full gradient-border">
            <div {...getRootProps()}>
                <input {...getInputProps({ id: 'uploader' })} />

                <div className="space-y-4 cursor-pointer">
                    {file ? (
                        <div className="uploader-selected-file" onClick={(e) => e.stopPropagation()}>
                            <img src="/images/pdf.png" alt="pdf" className="size-10" />
                            <div className="flex items-center space-x-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                                        {file.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {(file.size / (1024 * 1024) >= 1)
                                            ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                                            : `${(file.size / 1024).toFixed(2)} KB`}
                                    </p>
                                </div>
                            </div>
                            <button className="p-2 cursor-pointer" onClick={(e) => {
                                onFileSelect?.(null)
                            }}>
                                <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
                            </button>
                        </div>
                    ): (
                        <div>
                            <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
                                <img src="/icons/info.svg" alt="upload" className="size-20" />
                            </div>
                            <p className="text-lg text-gray-500">
                                <span className="font-semibold">
                                    Click to upload
                                </span> or drag and drop
                            </p>
                            <p className="text-lg text-gray-500">
                                PDF (max {(maxFileSize / (1024 * 1024))} MB)
                            </p>
                        </div>
                    )}
                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}
                </div>
            </div>
        </div>
    )
}
export default FileUploader
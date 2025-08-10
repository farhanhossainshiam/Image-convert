'use client'

import { useCallback, useState } from 'react'
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react'

interface ImageUploadProps {
    onFileUpload: (files: File[]) => void
    uploadedFiles: File[]
    onRemoveFile: (index: number) => void
}

export default function ImageUpload({ onFileUpload, uploadedFiles, onRemoveFile }: ImageUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false)

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)

        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
        if (files.length > 0) {
            onFileUpload([...uploadedFiles, ...files])
        }
    }, [onFileUpload, uploadedFiles])

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
            if (imageFiles.length > 0) {
                onFileUpload([...uploadedFiles, ...imageFiles])
            }
        }
        // Clear the input so the same files can be selected again
        e.target.value = ''
    }, [onFileUpload, uploadedFiles])

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    const getTotalSize = () => {
        const totalBytes = uploadedFiles.reduce((sum, file) => sum + file.size, 0)
        return formatFileSize(totalBytes)
    }

    if (uploadedFiles.length > 0) {
        return (
            <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 border-dashed rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            {uploadedFiles.length} image{uploadedFiles.length > 1 ? 's' : ''} selected
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            Total size: {getTotalSize()}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                        {uploadedFiles.map((file, index) => (
                            <div key={`${file.name}-${index}`} className="relative group">
                                <div className="aspect-square bg-white dark:bg-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600 overflow-hidden">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={() => onRemoveFile(index)}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="mt-2 text-xs text-gray-600 truncate">
                                    {file.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {formatFileSize(file.size)}
                                </div>
                            </div>
                        ))}

                        {/* Add more files button */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${isDragOver
                                ? 'border-blue-400 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                }`}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileInput}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Plus className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600 text-center">
                                Add more
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => onFileUpload([])}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                            Clear all
                        </button>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            Drag & drop more images or click "Add more"
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${isDragOver
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-105'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
        >
            <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="space-y-4">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isDragOver ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                    {isDragOver ? (
                        <Upload className="w-8 h-8 text-blue-600" />
                    ) : (
                        <ImageIcon className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                    )}
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {isDragOver ? 'Drop your images here' : 'Upload your images'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Drag and drop multiple image files here, or click to browse
                    </p>
                    <div className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors cursor-pointer">
                        <Upload className="w-5 h-5" />
                        <span className="font-medium">Choose Files</span>
                    </div>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Supports JPG, PNG, GIF, WebP, and other image formats up to 10MB each
                </p>
            </div>
        </div>
    )
}
'use client'

import { Zap, Image as ImageIcon, FileText, HardDrive, Crown } from 'lucide-react'

export interface QualityOption {
    id: string
    name: string
    quality: number
    description: string
    icon: React.ReactNode
    fileSize: string
    useCase: string
}

interface QualitySelectorProps {
    selectedQuality: QualityOption
    onQualityChange: (quality: QualityOption) => void
    selectedFormat: string
    originalFileSize?: number
}

export default function QualitySelector({
    selectedQuality,
    onQualityChange,
    selectedFormat,
    originalFileSize
}: QualitySelectorProps) {

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    const estimateFileSize = (quality: number) => {
        if (!originalFileSize) return null

        // Rough estimation based on quality and format
        let compressionRatio = 1

        if (selectedFormat === 'jpeg') {
            compressionRatio = quality > 0.9 ? 0.7 :
                quality > 0.8 ? 0.5 :
                    quality > 0.7 ? 0.35 :
                        quality > 0.6 ? 0.25 :
                            quality > 0.4 ? 0.15 : 0.08
        } else if (selectedFormat === 'webp') {
            compressionRatio = quality > 0.9 ? 0.6 :
                quality > 0.8 ? 0.4 :
                    quality > 0.7 ? 0.3 :
                        quality > 0.6 ? 0.2 :
                            quality > 0.4 ? 0.12 : 0.06
        } else if (selectedFormat === 'png') {
            // PNG Original - controlled file size through dimension reduction
            compressionRatio = quality === 1.0 ? 0.7 : 0.95 // ~70% due to dimension scaling
        } else {
            // Other lossless formats
            compressionRatio = quality > 0.9 ? 0.95 :
                quality > 0.8 ? 0.85 :
                    quality > 0.7 ? 0.75 : 0.7
        }

        return Math.round(originalFileSize * compressionRatio)
    }

    const getQualityOptions = (): QualityOption[] => {
        // Different quality settings based on format
        if (selectedFormat === 'png') {
            // PNG format - only Original option
            return [
                {
                    id: 'original',
                    name: 'Original',
                    quality: 1.0,
                    description: 'Pure format conversion without compression',
                    icon: <ImageIcon className="w-5 h-5" />,
                    fileSize: 'Convert',
                    useCase: 'Exact format conversion'
                }
            ]
        } else if (selectedFormat === 'bmp' || selectedFormat === 'tiff') {
            // Other lossless formats - compression levels
            return [
                {
                    id: 'original',
                    name: 'Original',
                    quality: 1.0,
                    description: 'Pure format conversion without compression',
                    icon: <ImageIcon className="w-5 h-5" />,
                    fileSize: 'Convert',
                    useCase: 'Exact format conversion'
                },
                {
                    id: 'maximum',
                    name: 'Maximum',
                    quality: 1.0,
                    description: 'No compression, largest file size',
                    icon: <Crown className="w-5 h-5" />,
                    fileSize: 'Largest',
                    useCase: 'Professional work, printing'
                },
                {
                    id: 'high',
                    name: 'High',
                    quality: 0.95,
                    description: 'Minimal compression, excellent quality',
                    icon: <ImageIcon className="w-5 h-5" />,
                    fileSize: 'Large',
                    useCase: 'High-quality web, presentations'
                },
                {
                    id: 'medium',
                    name: 'Medium',
                    quality: 0.85,
                    description: 'Balanced compression and quality',
                    icon: <FileText className="w-5 h-5" />,
                    fileSize: 'Medium',
                    useCase: 'General web use, social media'
                },
                {
                    id: 'low',
                    name: 'Low',
                    quality: 0.7,
                    description: 'Higher compression, smaller file',
                    icon: <HardDrive className="w-5 h-5" />,
                    fileSize: 'Small',
                    useCase: 'Email attachments, storage'
                }
            ]
        } else if (selectedFormat === 'jpeg') {
            // JPEG format - limited quality options (no Medium, High, Maximum, Web Optimized)
            return [
                {
                    id: 'original',
                    name: 'Original',
                    quality: 1.0,
                    description: 'Pure format conversion without compression',
                    icon: <ImageIcon className="w-5 h-5" />,
                    fileSize: 'Convert',
                    useCase: 'Exact format conversion'
                },
                {
                    id: 'low',
                    name: 'Low',
                    quality: 0.6,
                    description: 'Smaller files, noticeable quality loss',
                    icon: <HardDrive className="w-5 h-5" />,
                    fileSize: '~25% of original',
                    useCase: 'Email, quick sharing'
                },
                {
                    id: 'ultra-compressed',
                    name: 'Ultra Compressed',
                    quality: 0.4,
                    description: 'Maximum compression, significant quality loss',
                    icon: <HardDrive className="w-5 h-5" />,
                    fileSize: '~10-15% of original',
                    useCase: 'Thumbnails, previews, extreme size limits'
                },
                {
                    id: 'extreme',
                    name: 'Extreme',
                    quality: 0.25,
                    description: 'Extreme compression for tiny files',
                    icon: <HardDrive className="w-5 h-5" />,
                    fileSize: '~5-8% of original',
                    useCase: 'Very small previews, icons'
                }
            ]
        } else {
            // Other lossy formats (WebP) - reduced quality levels
            return [
                {
                    id: 'original',
                    name: 'Original',
                    quality: 1.0,
                    description: 'Pure format conversion without compression',
                    icon: <ImageIcon className="w-5 h-5" />,
                    fileSize: 'Convert',
                    useCase: 'Exact format conversion'
                },
                {
                    id: 'low',
                    name: 'Low',
                    quality: 0.6,
                    description: 'Smaller files, noticeable quality loss',
                    icon: <HardDrive className="w-5 h-5" />,
                    fileSize: '~25% of original',
                    useCase: 'Email, quick sharing'
                },
                {
                    id: 'ultra-compressed',
                    name: 'Ultra Compressed',
                    quality: 0.4,
                    description: 'Maximum compression, significant quality loss',
                    icon: <HardDrive className="w-5 h-5" />,
                    fileSize: '~10-15% of original',
                    useCase: 'Thumbnails, previews, extreme size limits'
                },
                {
                    id: 'extreme',
                    name: 'Extreme',
                    quality: 0.25,
                    description: 'Extreme compression for tiny files',
                    icon: <HardDrive className="w-5 h-5" />,
                    fileSize: '~5-8% of original',
                    useCase: 'Very small previews, icons'
                }
            ]
        }
    }

    const qualityOptions = getQualityOptions()

    const getQualityColor = (qualityId: string) => {
        switch (qualityId) {
            case 'original': return 'text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20'
            case 'maximum': return 'text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20'
            case 'high': return 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
            case 'medium': return 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
            case 'low': return 'text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20'
            case 'web-optimized': return 'text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-700 bg-cyan-50 dark:bg-cyan-900/20'
            default: return 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
        }
    }

    const getSelectedColors = (qualityId: string) => {
        switch (qualityId) {
            case 'original': return 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
            case 'maximum': return 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
            case 'high': return 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            case 'medium': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            case 'low': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
            case 'web-optimized': return 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300'
            default: return 'border-gray-500 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        }
    }

    return (
        <div className="space-y-6">
            <div className={`border-2 rounded-xl p-4 ${getSelectedColors(selectedQuality.id)}`}>
                <h4 className="font-medium mb-2">Selected Quality Setting</h4>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {selectedQuality.icon}
                        <div>
                            <span className="font-semibold">{selectedQuality.name}</span>
                            <p className="text-sm opacity-80">{selectedQuality.description}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium">
                            {selectedQuality.quality === 1.0 ? (
                                `File Size: ${selectedQuality.fileSize}`
                            ) : originalFileSize && estimateFileSize(selectedQuality.quality) ? (
                                <>
                                    {formatFileSize(originalFileSize)} → {formatFileSize(estimateFileSize(selectedQuality.quality)!)}
                                    <div className="text-xs opacity-75">
                                        {Math.round((estimateFileSize(selectedQuality.quality)! / originalFileSize) * 100)}% reduction
                                    </div>
                                </>
                            ) : (
                                `File Size: ${selectedQuality.fileSize}`
                            )}
                        </div>
                        <div className="text-xs opacity-75">Quality: {Math.round(selectedQuality.quality * 100)}%</div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Quality Presets</h4>
                <div className="grid gap-3">
                    {qualityOptions.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => onQualityChange(option)}
                            className={`p-4 rounded-xl border-2 text-left transition-all hover:scale-102 ${selectedQuality.id === option.id
                                ? getSelectedColors(option.id)
                                : `border-gray-200 dark:border-gray-600 hover:${getQualityColor(option.id)}`
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-lg ${selectedQuality.id === option.id
                                        ? 'bg-white bg-opacity-50'
                                        : 'bg-gray-100 dark:bg-gray-700'
                                        }`}>
                                        {option.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="font-semibold">{option.name}</span>
                                            <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded-full">
                                                {Math.round(option.quality * 100)}%
                                            </span>
                                        </div>
                                        <p className="text-sm opacity-80 mb-1">{option.description}</p>
                                        <p className="text-xs opacity-70">Best for: {option.useCase}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium">
                                        {option.quality === 1.0 ? (
                                            option.fileSize
                                        ) : originalFileSize && estimateFileSize(option.quality) ? (
                                            <>
                                                {formatFileSize(estimateFileSize(option.quality)!)}
                                                <div className="text-xs opacity-75">
                                                    ({Math.round(100 - (estimateFileSize(option.quality)! / originalFileSize) * 100)}% smaller)
                                                </div>
                                            </>
                                        ) : (
                                            option.fileSize
                                        )}
                                    </div>
                                    {selectedQuality.id === option.id && (
                                        <div className="w-3 h-3 bg-current rounded-full mt-1"></div>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Quality Guide</h5>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Original:</strong> Pure format conversion, same dimensions</p>
                        <p><strong>Low:</strong> Email, storage, sharing</p>
                        <p><strong>Ultra Compressed:</strong> Extreme size reduction</p>
                        <p><strong>Extreme:</strong> Maximum compression for tiny files</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-xl p-4">
                    <h5 className="font-medium text-gray-900 mb-2">💡 Format Conversion Tips</h5>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>PNG:</strong> Best for transparency and lossless conversion</p>
                        <p><strong>JPEG:</strong> Great compression for photos</p>
                        <p><strong>WebP:</strong> Modern format with excellent compression</p>
                        <p className="text-green-700 font-medium mt-2">Perfect for all your conversion needs!</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

'use client'

import { useState, useCallback } from 'react'
import { Download, CheckCircle, AlertCircle, Loader2, FileDown, Archive } from 'lucide-react'
import JSZip from 'jszip'
import { QualityOption } from './QualitySelector'

interface BatchProcessorProps {
    files: File[]
    selectedFormat: string
    selectedQuality: QualityOption
    onBatchComplete: (results: ProcessedFile[]) => void
}

interface ProcessedFile {
    originalFile: File
    convertedDataUrl: string | null
    status: 'pending' | 'processing' | 'completed' | 'error'
    error?: string
}

export default function BatchProcessor({ files, selectedFormat, selectedQuality, onBatchComplete }: BatchProcessorProps) {
    const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [currentProgress, setCurrentProgress] = useState(0)

    const convertSingleFile = useCallback(async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const img = new Image()

            img.onload = () => {
                // For Original quality (1.0), maintain exact dimensions and quality
                if (selectedQuality.quality === 1.0) {
                    // Original - pure format conversion without any scaling or compression
                    canvas.width = img.width
                    canvas.height = img.height

                    // Clear canvas with white background for JPEG
                    if (selectedFormat === 'jpeg') {
                        ctx!.fillStyle = '#FFFFFF'
                        ctx!.fillRect(0, 0, canvas.width, canvas.height)
                    }

                    // Use highest quality settings for original conversion
                    ctx!.imageSmoothingEnabled = true
                    ctx!.imageSmoothingQuality = 'high'
                    ctx?.drawImage(img, 0, 0)
                } else if (selectedFormat === 'jpeg' && selectedQuality.quality < 0.6) {
                    // Use dimension reduction for aggressive JPEG compression
                    const dimensionFactor = Math.max(0.5, selectedQuality.quality + 0.3) // Min 50% dimensions
                    const newWidth = Math.round(img.width * dimensionFactor)
                    const newHeight = Math.round(img.height * dimensionFactor)

                    canvas.width = newWidth
                    canvas.height = newHeight

                    ctx!.fillStyle = '#FFFFFF'
                    ctx!.fillRect(0, 0, newWidth, newHeight)

                    ctx!.imageSmoothingEnabled = true
                    ctx!.imageSmoothingQuality = 'high'
                    ctx?.drawImage(img, 0, 0, newWidth, newHeight)
                } else {
                    // Standard compression for normal quality levels
                    canvas.width = img.width
                    canvas.height = img.height

                    // Clear canvas with white background for JPEG
                    if (selectedFormat === 'jpeg') {
                        ctx!.fillStyle = '#FFFFFF'
                        ctx!.fillRect(0, 0, canvas.width, canvas.height)
                    }

                    // Apply image smoothing settings based on quality
                    ctx!.imageSmoothingEnabled = selectedQuality.quality > 0.5
                    ctx!.imageSmoothingQuality = selectedQuality.quality > 0.8 ? 'high' :
                        selectedQuality.quality > 0.6 ? 'medium' : 'low'

                    ctx?.drawImage(img, 0, 0)
                }
                const convertedDataUrl = canvas.toDataURL(`image/${selectedFormat}`, selectedQuality.quality)
                resolve(convertedDataUrl)
            }

            img.onerror = () => reject(new Error('Failed to load image'))
            img.src = URL.createObjectURL(file)
        })
    }, [selectedFormat, selectedQuality])

    const handleBatchConvert = useCallback(async () => {
        setIsProcessing(true)
        setCurrentProgress(0)

        const initialProcessedFiles: ProcessedFile[] = files.map(file => ({
            originalFile: file,
            convertedDataUrl: null,
            status: 'pending'
        }))

        setProcessedFiles(initialProcessedFiles)

        const results: ProcessedFile[] = []

        for (let i = 0; i < files.length; i++) {
            const file = files[i]

            // Update status to processing
            setProcessedFiles(prev => prev.map((pf, index) =>
                index === i ? { ...pf, status: 'processing' } : pf
            ))

            try {
                const convertedDataUrl = await convertSingleFile(file)
                const processedFile: ProcessedFile = {
                    originalFile: file,
                    convertedDataUrl,
                    status: 'completed'
                }

                results.push(processedFile)

                // Update status to completed
                setProcessedFiles(prev => prev.map((pf, index) =>
                    index === i ? processedFile : pf
                ))
            } catch (error) {
                const processedFile: ProcessedFile = {
                    originalFile: file,
                    convertedDataUrl: null,
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                }

                results.push(processedFile)

                // Update status to error
                setProcessedFiles(prev => prev.map((pf, index) =>
                    index === i ? processedFile : pf
                ))
            }

            setCurrentProgress(((i + 1) / files.length) * 100)
        }

        setIsProcessing(false)
        onBatchComplete(results)
    }, [files, convertSingleFile, onBatchComplete])

    const downloadAll = useCallback(() => {
        const completedFiles = processedFiles.filter(pf => pf.status === 'completed' && pf.convertedDataUrl)

        completedFiles.forEach((processedFile, index) => {
            setTimeout(() => {
                const link = document.createElement('a')
                link.href = processedFile.convertedDataUrl!
                const fileName = processedFile.originalFile.name.split('.')[0]
                link.download = `${fileName}.${selectedFormat}`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            }, index * 100) // Stagger downloads by 100ms
        })
    }, [processedFiles, selectedFormat])

    const downloadSingle = useCallback((processedFile: ProcessedFile) => {
        if (processedFile.convertedDataUrl) {
            const link = document.createElement('a')
            link.href = processedFile.convertedDataUrl
            const fileName = processedFile.originalFile.name.split('.')[0]
            link.download = `${fileName}.${selectedFormat}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }, [selectedFormat])

    const downloadAsZip = useCallback(async () => {
        const completedFiles = processedFiles.filter(pf => pf.status === 'completed' && pf.convertedDataUrl)

        if (completedFiles.length === 0) return

        const zip = new JSZip()
        const folder = zip.folder('converted-images')

        // Add each converted image to the ZIP
        for (const processedFile of completedFiles) {
            if (processedFile.convertedDataUrl) {
                // Convert data URL to blob
                const response = await fetch(processedFile.convertedDataUrl)
                const blob = await response.blob()

                const fileName = processedFile.originalFile.name.split('.')[0]
                folder?.file(`${fileName}.${selectedFormat}`, blob)
            }
        }

        // Generate and download the ZIP file
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(zipBlob)
        link.download = `converted-images.zip`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(link.href)
    }, [processedFiles, selectedFormat])

    const getStatusIcon = (status: ProcessedFile['status']) => {
        switch (status) {
            case 'pending':
                return <div className="w-5 h-5 bg-gray-300 rounded-full" />
            case 'processing':
                return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-500" />
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />
        }
    }

    const completedCount = processedFiles.filter(pf => pf.status === 'completed').length
    const errorCount = processedFiles.filter(pf => pf.status === 'error').length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Batch Convert {files.length} Images
                </h3>
                <button
                    onClick={handleBatchConvert}
                    disabled={isProcessing}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isProcessing ? 'Converting...' : 'Start Batch Conversion'}
                </button>
            </div>

            {isProcessing && (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                        <span>Converting images...</span>
                        <span>{Math.round(currentProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${currentProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {processedFiles.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            {completedCount} completed, {errorCount} errors, {files.length - completedCount - errorCount} pending
                        </div>
                        {completedCount > 0 && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={downloadAll}
                                    className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <FileDown className="w-4 h-4" />
                                    <span>Download All ({completedCount})</span>
                                </button>
                                <button
                                    onClick={downloadAsZip}
                                    className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    <Archive className="w-4 h-4" />
                                    <span>Download ZIP</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {processedFiles.map((processedFile, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    {getStatusIcon(processedFile.status)}
                                    <div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                                            {processedFile.originalFile.name}
                                        </div>
                                        {processedFile.error && (
                                            <div className="text-xs text-red-600">{processedFile.error}</div>
                                        )}
                                    </div>
                                </div>
                                {processedFile.status === 'completed' && (
                                    <button
                                        onClick={() => downloadSingle(processedFile)}
                                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

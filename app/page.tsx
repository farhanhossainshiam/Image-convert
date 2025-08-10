'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, Download, Image as ImageIcon, Zap, Shield, Globe, CheckCircle, ArrowRight } from 'lucide-react'
import ImageUpload from './components/ImageUpload'
import FormatSelector from './components/FormatSelector'
import ConversionProgress from './components/ConversionProgress'
import QualitySelector, { QualityOption } from './components/QualitySelector'
import BatchProcessor from './components/BatchProcessor'
import ThemeToggle from './components/ThemeToggle'
import PalestineBanner from './components/PalestineBanner'

export default function Home() {
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const [selectedFormat, setSelectedFormat] = useState<string>('jpeg')
    const [isConverting, setIsConverting] = useState(false)
    const [convertedImage, setConvertedImage] = useState<string | null>(null)
    const [conversionProgress, setConversionProgress] = useState(0)
    const [batchResults, setBatchResults] = useState<any[]>([])
    const [selectedQuality, setSelectedQuality] = useState<QualityOption>({
        id: 'ultra-compressed',
        name: 'Ultra Compressed',
        quality: 0.4,
        description: 'Maximum compression, significant quality loss',
        icon: <ImageIcon className="w-5 h-5" />,
        fileSize: '~10-15% of original',
        useCase: 'Thumbnails, previews, extreme size limits'
    })

    const handleFileUpload = useCallback((files: File[]) => {
        setUploadedFiles(files)
        setConvertedImage(null)
        setConversionProgress(0)
        setBatchResults([])
    }, [])

    const handleRemoveFile = useCallback((index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    }, [])

    const handleBatchComplete = useCallback((results: any[]) => {
        setBatchResults(results)
    }, [])

    const handleConvert = useCallback(async () => {
        if (uploadedFiles.length === 0) return

        setIsConverting(true)
        setConversionProgress(0)

        // For single file, use the old method
        if (uploadedFiles.length === 1) {
            const file = uploadedFiles[0]

            // Simulate conversion progress
            const progressInterval = setInterval(() => {
                setConversionProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval)
                        return 90
                    }
                    return prev + 10
                })
            }, 200)

            try {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                const img = new Image()

                await new Promise((resolve, reject) => {
                    img.onload = () => {
                        // For PNG Original, optimize for reasonable file size
                        if (selectedFormat === 'png' && selectedQuality.quality === 1.0) {
                            // PNG Original - reduce dimensions slightly to control file size
                            const scaleFactor = 0.85 // Reduce to ~85% to manage file size
                            const newWidth = Math.round(img.width * scaleFactor)
                            const newHeight = Math.round(img.height * scaleFactor)

                            canvas.width = newWidth
                            canvas.height = newHeight

                            ctx!.imageSmoothingEnabled = true
                            ctx!.imageSmoothingQuality = 'high'
                            ctx?.drawImage(img, 0, 0, newWidth, newHeight)
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

                            if (selectedFormat === 'jpeg') {
                                ctx!.fillStyle = '#FFFFFF'
                                ctx!.fillRect(0, 0, canvas.width, canvas.height)
                            }

                            ctx!.imageSmoothingEnabled = selectedQuality.quality > 0.5
                            ctx!.imageSmoothingQuality = selectedQuality.quality > 0.8 ? 'high' :
                                selectedQuality.quality > 0.6 ? 'medium' : 'low'

                            ctx?.drawImage(img, 0, 0)
                        }
                        const convertedDataUrl = canvas.toDataURL(`image/${selectedFormat}`, selectedQuality.quality)

                        // Debug logging for compression
                        console.log('Compression Debug:')
                        console.log(`Format: ${selectedFormat}`)
                        console.log(`Quality: ${selectedQuality.quality}`)
                        console.log(`Original: ${img.width}x${img.height}`)
                        console.log(`Canvas: ${canvas.width}x${canvas.height}`)
                        console.log(`Original file size: ${(file.size / 1024).toFixed(2)} KB`)

                        // Calculate new file size from data URL
                        const base64Length = convertedDataUrl.split(',')[1].length
                        const newFileSize = (base64Length * 0.75) / 1024
                        console.log(`New file size: ${newFileSize.toFixed(2)} KB`)
                        console.log(`Compression ratio: ${((newFileSize * 1024 / file.size) * 100).toFixed(1)}% of original`)

                        setConvertedImage(convertedDataUrl)
                        setConversionProgress(100)
                        setIsConverting(false)
                        resolve(convertedDataUrl)
                    }
                    img.onerror = reject
                    img.src = URL.createObjectURL(file)
                })
            } catch (error) {
                console.error('Conversion failed:', error)
                setIsConverting(false)
                setConversionProgress(0)
            }

            clearInterval(progressInterval)
        }
    }, [uploadedFiles, selectedFormat, selectedQuality])

    const handleDownload = useCallback(() => {
        if (!convertedImage || uploadedFiles.length === 0) return

        const link = document.createElement('a')
        link.href = convertedImage
        const fileName = uploadedFiles[0].name.split('.')[0]
        link.download = `${fileName}.${selectedFormat}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }, [convertedImage, uploadedFiles, selectedFormat])

    const features = [
        {
            icon: <Zap className="w-6 h-6 text-blue-500" />,
            title: "Lightning Fast",
            description: "Convert images in seconds with our optimized processing engine"
        },
        {
            icon: <Shield className="w-6 h-6 text-green-500" />,
            title: "100% Secure",
            description: "Your files are processed locally in your browser. We never store your images"
        },
        {
            icon: <Globe className="w-6 h-6 text-purple-500" />,
            title: "All Formats & Quality",
            description: "Support for JPG, PNG, WebP, AVIF, GIF with advanced quality control"
        }
    ]

    const supportedFormats = ['JPG', 'PNG', 'WebP', 'AVIF', 'GIF', 'BMP', 'TIFF']

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Palestine Banner */}
            <PalestineBanner />

            {/* Navigation */}
            <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <ImageIcon className="w-8 h-8 text-blue-600" />
                            <span className="text-xl font-bold text-gray-900 dark:text-white">ImageConverter</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-6">
                            <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Features</a>
                            <a href="#converter" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Convert</a>
                            <ThemeToggle />
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-16 pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center animate-fade-in">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                            Convert Images to
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Any Format</span>
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                            Transform your images instantly with our modern, secure, and lightning-fast converter.
                            Support for all major formats with advanced quality control and professional-grade compression.
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {supportedFormats.map((format) => (
                                <span key={format} className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                                    {format}
                                </span>
                            ))}
                        </div>
                        <a href="#converter" className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg">
                            <span className="text-lg font-semibold">Start Converting</span>
                            <ArrowRight className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-60 animate-bounce-subtle"></div>
                <div className="absolute top-40 right-16 w-16 h-16 bg-purple-200 rounded-full opacity-60 animate-bounce-subtle" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-green-200 rounded-full opacity-60 animate-bounce-subtle" style={{ animationDelay: '2s' }}></div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Why Choose ImageConverter?
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Built with modern technology to provide the best image conversion experience
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-100 dark:border-gray-600 hover:shadow-lg transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-white dark:bg-gray-900 rounded-2xl shadow-sm mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Converter Section */}
            <section id="converter" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Convert Your Images
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Upload single or multiple images, select format & quality, then download
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12">
                        <div className="space-y-8">
                            {/* Step 1: Upload */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                                        1
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Your Images</h3>
                                </div>
                                <ImageUpload
                                    onFileUpload={handleFileUpload}
                                    uploadedFiles={uploadedFiles}
                                    onRemoveFile={handleRemoveFile}
                                />
                            </div>

                            {/* Step 2: Select Format */}
                            {uploadedFiles.length > 0 && (
                                <div className="space-y-4 animate-slide-up">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                                            2
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Select Output Format</h3>
                                    </div>
                                    <FormatSelector selectedFormat={selectedFormat} onFormatChange={setSelectedFormat} />
                                </div>
                            )}

                            {/* Step 3: Select Quality */}
                            {uploadedFiles.length > 0 && (
                                <div className="space-y-4 animate-slide-up">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                                            3
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Select Quality & Compression</h3>
                                    </div>
                                    <QualitySelector
                                        selectedQuality={selectedQuality}
                                        onQualityChange={setSelectedQuality}
                                        selectedFormat={selectedFormat}
                                        originalFileSize={uploadedFiles[0]?.size}
                                    />
                                </div>
                            )}

                            {/* Step 4: Convert */}
                            {uploadedFiles.length > 0 && (
                                <div className="space-y-4 animate-slide-up">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                                            4
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Convert & Download</h3>
                                    </div>

                                    {uploadedFiles.length === 1 ? (
                                        // Single file conversion
                                        <>
                                            {isConverting && (
                                                <ConversionProgress progress={conversionProgress} />
                                            )}

                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <button
                                                    onClick={handleConvert}
                                                    disabled={isConverting}
                                                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                                                >
                                                    {isConverting ? 'Converting...' : 'Convert Image'}
                                                </button>

                                                {convertedImage && (
                                                    <button
                                                        onClick={handleDownload}
                                                        className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                                                    >
                                                        <Download className="w-5 h-5" />
                                                        <span>Download</span>
                                                    </button>
                                                )}
                                            </div>

                                            {convertedImage && (
                                                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl animate-fade-in">
                                                    <div className="flex items-center space-x-2 text-green-800 dark:text-green-300">
                                                        <CheckCircle className="w-5 h-5" />
                                                        <span className="font-medium">Conversion completed successfully!</span>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        // Multiple files batch conversion
                                        <BatchProcessor
                                            files={uploadedFiles}
                                            selectedFormat={selectedFormat}
                                            selectedQuality={selectedQuality}
                                            onBatchComplete={handleBatchComplete}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                            <ImageIcon className="w-8 h-8 text-blue-400" />
                            <span className="text-xl font-bold">ImageConverter</span>
                        </div>
                        <div className="text-center md:text-right">
                            <p className="text-gray-400 dark:text-gray-500">
                                © 2024 ImageConverter. All rights reserved.
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-600 mt-1">
                                Built with ❤️ using Next.js and modern web technologies
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

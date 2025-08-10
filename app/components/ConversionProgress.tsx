'use client'

interface ConversionProgressProps {
    progress: number
}

export default function ConversionProgress({ progress }: ConversionProgressProps) {
    return (
        <div className="space-y-3 animate-fade-in">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Converting your image...</span>
                <span className="text-sm font-medium text-blue-600">{progress}%</span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out relative"
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
                </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span>Processing image data...</span>
            </div>
        </div>
    )
}

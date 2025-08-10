'use client'

interface FormatSelectorProps {
    selectedFormat: string
    onFormatChange: (format: string) => void
}

export default function FormatSelector({ selectedFormat, onFormatChange }: FormatSelectorProps) {
    const formats = [
        { value: 'png', label: 'PNG', description: 'Best for images with transparency' },
        { value: 'jpeg', label: 'JPEG', description: 'Best for photos and complex images' },
        { value: 'webp', label: 'WebP', description: 'Modern format with great compression' },
    ]

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {formats.map((format) => (
                    <button
                        key={format.value}
                        onClick={() => onFormatChange(format.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all hover:scale-105 ${selectedFormat === format.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-lg font-bold ${selectedFormat === format.value ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'
                                }`}>
                                {format.label}
                            </span>
                            {selectedFormat === format.value && (
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            )}
                        </div>
                        <p className={`text-sm ${selectedFormat === format.value ? 'text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'
                            }`}>
                            {format.description}
                        </p>
                    </button>
                ))}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Selected Format: {formats.find(f => f.value === selectedFormat)?.label}</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    {formats.find(f => f.value === selectedFormat)?.description}
                </p>
            </div>
        </div>
    )
}
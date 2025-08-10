'use client'

export default function PalestineBanner() {
    return (
        <div className="relative bg-gradient-to-r from-green-600 via-white to-red-600 text-black overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 via-white/90 to-red-600/90"></div>
            <div className="relative flex items-center justify-center py-3 px-4">
                <div className="animate-pulse-slow font-bold text-lg md:text-xl text-center">
                    <span className="text-green-800">Free Palestine</span>
                </div>
            </div>
        </div>
    )
}

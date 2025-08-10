import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from './components/ThemeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'ImageConverter - Convert Images to Any Format',
    description: 'Convert your images to any format with our modern, fast, and secure image converter. Support for JPG, PNG, WebP, AVIF, and more.',
    keywords: 'image converter, file format converter, JPG to PNG, WebP converter, image optimization',
    authors: [{ name: 'ImageConverter' }],
    openGraph: {
        title: 'ImageConverter - Convert Images to Any Format',
        description: 'Convert your images to any format with our modern, fast, and secure image converter.',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'ImageConverter - Convert Images to Any Format',
        description: 'Convert your images to any format with our modern, fast, and secure image converter.',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    )
}

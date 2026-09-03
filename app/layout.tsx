import type { Metadata, Viewport } from 'next'
import { Sarabun } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const sarabun = Sarabun({ 
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sarabun"
});

export const metadata: Metadata = {
  title: 'DeepVoice Shield - ตรวจจับเสียง AI ปลอม',
  description: 'ตรวจสอบว่าเสียงที่คุณได้ยินเป็น AI ปลอมหรือเปล่า ใช้ง่าย ฟรี ไม่ต้องสมัครสมาชิก',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" className="bg-background">
      <body className={`${sarabun.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

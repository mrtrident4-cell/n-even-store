'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAdminPage = pathname?.startsWith('/admin')

    if (isAdminPage) {
        return <main style={{ minHeight: '100vh' }}>{children}</main>
    }

    return (
        <>
            <Navbar />
            <main style={{ minHeight: '100vh', paddingTop: '0px' }}>
                {children}
            </main>
            <Footer />
        </>
    )
}

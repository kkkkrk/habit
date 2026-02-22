'use client'

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { useState, useEffect } from "react"

export function ThemeProvider({ children }) {
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])
    if (!mounted) return <div style={{ visibility: 'hidden' }}>{children}</div>

    return (
        <NextThemesProvider attribute="data-theme" defaultTheme="dark" enableSystem>
            {children}
        </NextThemesProvider>
    )
}

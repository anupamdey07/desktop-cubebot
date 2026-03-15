import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
    isAuthenticated: boolean
    email: string | null
    login: (email: string, pin: string) => boolean
    logout: () => void
}

const VALID_ACCOUNTS: Record<string, string> = {
    'anupamdeydav@gmail.com': '1234'
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            email: null,
            login: (email: string, pin: string) => {
                const normalizedEmail = email.toLowerCase().trim()
                if (VALID_ACCOUNTS[normalizedEmail] === pin) {
                    set({ isAuthenticated: true, email: normalizedEmail })
                    return true
                }
                return false
            },
            logout: () => set({ isAuthenticated: false, email: null })
        }),
        {
            name: 'cubebot-auth-storage'
        }
    )
)

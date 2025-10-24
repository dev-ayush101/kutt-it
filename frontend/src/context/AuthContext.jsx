import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [user, setUser] = useState(() => {
        const u = localStorage.getItem('user')
        return u ? JSON.parse(u) : null
    })

    const login = (data) => {
        localStorage.setItem('user', JSON.stringify({ email: data.email, username: data.username }))
        setToken(data.token)
        setUser({ email: data.email, username: data.username })
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
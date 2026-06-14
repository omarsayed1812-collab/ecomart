import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { auth, getToken } from "@/api/client"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [authError, setAuthError] = useState(null)

  const checkUserAuth = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      setIsAuthenticated(false)
      return null
    }
    try {
      const me = await auth.me()
      setUser(me)
      setIsAuthenticated(true)
      setAuthError(null)
      return me
    } catch (err) {
      setAuthError({ type: "auth_required", message: err.message })
      setUser(null)
      setIsAuthenticated(false)
      auth.logout()
      return null
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      setIsLoadingAuth(true)
      await checkUserAuth()
      setIsLoadingAuth(false)
    })()
  }, [checkUserAuth])

  const login = async (email, password) => {
    await auth.login(email, password)
    return checkUserAuth()
  }

  const register = async (data) => {
    await auth.register(data)
    return checkUserAuth()
  }

  const logout = () => {
    auth.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    isAuthenticated,
    isLoadingAuth,
    authError,
    checkUserAuth,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

// User interface
export interface User {
  id: string
  username: string
  name: string
  role: string
  department: string
  specialization: string
  email: string
}

// Auth context interface
interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

// Static user credentials database
const USERS_DB: Record<string, { password: string; user: User }> = {
  'sarah.chen': {
    password: 'WellDoc2025!',
    user: {
      id: '1',
      username: 'sarah.chen',
      name: 'Dr. Sarah Chen',
      role: 'Chief Medical Officer',
      department: 'Internal Medicine',
      specialization: 'Chronic Care Management',
      email: 'sarah.chen@welldoc.com'
    }
  },
  'michael.rodriguez': {
    password: 'Cardio123!',
    user: {
      id: '2',
      username: 'michael.rodriguez',
      name: 'Dr. Michael Rodriguez',
      role: 'Senior Cardiologist',
      department: 'Cardiology',
      specialization: 'Heart Failure Management',
      email: 'michael.rodriguez@welldoc.com'
    }
  },
  'emily.johnson': {
    password: 'Endo456!',
    user: {
      id: '3',
      username: 'emily.johnson',
      name: 'Dr. Emily Johnson',
      role: 'Endocrinologist',
      department: 'Endocrinology',
      specialization: 'Diabetes & Metabolic Disorders',
      email: 'emily.johnson@welldoc.com'
    }
  },
  'lisa.thompson': {
    password: 'Nurse789!',
    user: {
      id: '4',
      username: 'lisa.thompson',
      name: 'Lisa Thompson, RN',
      role: 'Registered Nurse',
      department: 'Chronic Care Unit',
      specialization: 'Patient Monitoring',
      email: 'lisa.thompson@welldoc.com'
    }
  },
  'james.wilson': {
    password: 'Coord101!',
    user: {
      id: '5',
      username: 'james.wilson',
      name: 'James Wilson',
      role: 'Clinical Coordinator',
      department: 'Care Management',
      specialization: 'Risk Assessment',
      email: 'james.wilson@welldoc.com'
    }
  },
  'admin': {
    password: 'AdminWell2025!',
    user: {
      id: '6',
      username: 'admin',
      name: 'System Administrator',
      role: 'System Administrator',
      department: 'IT Operations',
      specialization: 'Full System Access',
      email: 'admin@welldoc.com'
    }
  }
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for stored session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('welldoc_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('welldoc_user')
      }
    }
    setIsLoading(false)
  }, [])

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    const userRecord = USERS_DB[username.toLowerCase()]
    
    if (userRecord && userRecord.password === password) {
      setUser(userRecord.user)
      localStorage.setItem('welldoc_user', JSON.stringify(userRecord.user))
      return true
    }
    
    return false
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem('welldoc_user')
  }

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

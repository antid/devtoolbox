import { supabase } from '../utils/supabase/client'

export interface User {
  id: string
  email: string
  name: string
}

export interface AuthState {
  user: User | null
  loading: boolean
}

class AuthService {
  private listeners: Array<(state: AuthState) => void> = []
  private currentState: AuthState = { user: null, loading: true }

  constructor() {
    this.initialize()
  }

  private async initialize() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        this.currentState = {
          user: {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'Developer'
          },
          loading: false
        }
      } else {
        this.currentState = { user: null, loading: false }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      this.currentState = { user: null, loading: false }
    }
    
    this.notifyListeners()

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      this.currentState = {
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || 'Developer'
        } : null,
        loading: false
      }
      this.notifyListeners()
    })
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener)
    listener(this.currentState) // Send current state immediately
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentState))
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw new Error(error.message)
    }

    return data.session?.access_token
  }

  async signUp(email: string, password: string, name: string) {
    const response = await fetch(`https://${await this.getProjectId()}.supabase.co/functions/v1/make-server-01f554a3/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ email, password, name })
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create account')
    }

    return result
  }

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  }

  async getAccessToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  private async getProjectId(): Promise<string> {
    // Import dynamically to avoid circular dependency
    const { projectId } = await import('../utils/supabase/info')
    return projectId
  }

  getCurrentUser(): User | null {
    return this.currentState.user
  }

  isLoading(): boolean {
    return this.currentState.loading
  }
}

export const authService = new AuthService()
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { authService } from './authService'

export interface CloudSnippet {
  id: string
  title: string
  content: string
  type: string
  isPublic: boolean
  userId?: string
  createdAt: string
  updatedAt: string
  shareUrl?: string
}

class SnippetService {
  private baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-01f554a3`

  private async getAuthHeaders() {
    const token = await authService.getAccessToken()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || publicAnonKey}`
    }
  }

  async saveSnippet(snippet: {
    title: string
    content: string
    type: string
    isPublic?: boolean
  }): Promise<CloudSnippet> {
    const headers = await this.getAuthHeaders()
    
    const response = await fetch(`${this.baseUrl}/snippets`, {
      method: 'POST',
      headers,
      body: JSON.stringify(snippet)
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to save snippet')
    }

    return result.snippet
  }

  async getSnippet(id: string): Promise<CloudSnippet> {
    const headers = await this.getAuthHeaders()
    
    const response = await fetch(`${this.baseUrl}/snippets/${id}`, {
      headers
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch snippet')
    }

    return result.snippet
  }

  async getUserSnippets(): Promise<CloudSnippet[]> {
    const headers = await this.getAuthHeaders()
    
    const response = await fetch(`${this.baseUrl}/user/snippets`, {
      headers
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch snippets')
    }

    return result.snippets || []
  }

  async deleteSnippet(id: string): Promise<void> {
    const headers = await this.getAuthHeaders()
    
    const response = await fetch(`${this.baseUrl}/snippets/${id}`, {
      method: 'DELETE',
      headers
    })

    if (!response.ok) {
      const result = await response.json()
      throw new Error(result.error || 'Failed to delete snippet')
    }
  }

  async getPublicSnippets(type?: string, limit = 20): Promise<CloudSnippet[]> {
    const params = new URLSearchParams()
    if (type) params.append('type', type)
    if (limit) params.append('limit', limit.toString())
    
    const response = await fetch(`${this.baseUrl}/snippets/public/recent?${params}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch public snippets')
    }

    return result.snippets || []
  }

  generateShareUrl(snippetId: string): string {
    return `${window.location.origin}/share/${snippetId}`
  }
}

export const snippetService = new SnippetService()
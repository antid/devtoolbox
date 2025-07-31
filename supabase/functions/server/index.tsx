import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Middleware
app.use('*', logger(console.log))
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Health check
app.get('/make-server-01f554a3/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Save snippet
app.post('/make-server-01f554a3/snippets', async (c) => {
  try {
    const { title, content, type, isPublic = false } = await c.req.json()
    
    if (!title || !content || !type) {
      return c.json({ error: 'Missing required fields: title, content, type' }, 400)
    }

    // Get user if authenticated
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    let userId = null
    
    if (accessToken && accessToken !== Deno.env.get('SUPABASE_ANON_KEY')) {
      try {
        const { data: { user } } = await supabase.auth.getUser(accessToken)
        userId = user?.id || null
      } catch (error) {
        console.log('Auth error (non-blocking):', error)
      }
    }

    const snippetId = crypto.randomUUID()
    const snippet = {
      id: snippetId,
      title,
      content,
      type,
      isPublic,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Save to KV store
    await kv.set(`snippet:${snippetId}`, snippet)
    
    // If user is authenticated, also save to user's list
    if (userId) {
      const userSnippets = await kv.get(`user_snippets:${userId}`) || []
      userSnippets.push(snippetId)
      await kv.set(`user_snippets:${userId}`, userSnippets)
    }

    return c.json({ 
      success: true, 
      snippet: { ...snippet, shareUrl: isPublic ? `/share/${snippetId}` : null }
    })
  } catch (error) {
    console.log('Error saving snippet:', error)
    return c.json({ error: 'Failed to save snippet' }, 500)
  }
})

// Get snippet by ID (public access for sharing)
app.get('/make-server-01f554a3/snippets/:id', async (c) => {
  try {
    const snippetId = c.req.param('id')
    const snippet = await kv.get(`snippet:${snippetId}`)
    
    if (!snippet) {
      return c.json({ error: 'Snippet not found' }, 404)
    }

    // Check if snippet is public or user owns it
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    let userCanAccess = snippet.isPublic
    
    if (!userCanAccess && accessToken && accessToken !== Deno.env.get('SUPABASE_ANON_KEY')) {
      try {
        const { data: { user } } = await supabase.auth.getUser(accessToken)
        userCanAccess = snippet.userId === user?.id
      } catch (error) {
        console.log('Auth error:', error)
      }
    }

    if (!userCanAccess) {
      return c.json({ error: 'Access denied' }, 403)
    }

    return c.json({ snippet })
  } catch (error) {
    console.log('Error fetching snippet:', error)
    return c.json({ error: 'Failed to fetch snippet' }, 500)
  }
})

// Get user's snippets (requires auth)
app.get('/make-server-01f554a3/user/snippets', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (!user?.id || error) {
      return c.json({ error: 'Invalid authentication' }, 401)
    }

    const snippetIds = await kv.get(`user_snippets:${user.id}`) || []
    const snippets = []
    
    for (const id of snippetIds) {
      const snippet = await kv.get(`snippet:${id}`)
      if (snippet) {
        snippets.push(snippet)
      }
    }

    // Sort by creation date (newest first)
    snippets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return c.json({ snippets })
  } catch (error) {
    console.log('Error fetching user snippets:', error)
    return c.json({ error: 'Failed to fetch snippets' }, 500)
  }
})

// Delete snippet (requires ownership)
app.delete('/make-server-01f554a3/snippets/:id', async (c) => {
  try {
    const snippetId = c.req.param('id')
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (!user?.id || error) {
      return c.json({ error: 'Invalid authentication' }, 401)
    }

    const snippet = await kv.get(`snippet:${snippetId}`)
    if (!snippet) {
      return c.json({ error: 'Snippet not found' }, 404)
    }

    if (snippet.userId !== user.id) {
      return c.json({ error: 'Access denied' }, 403)
    }

    // Remove from KV store
    await kv.del(`snippet:${snippetId}`)
    
    // Remove from user's list
    const userSnippets = await kv.get(`user_snippets:${user.id}`) || []
    const updatedSnippets = userSnippets.filter((id: string) => id !== snippetId)
    await kv.set(`user_snippets:${user.id}`, updatedSnippets)

    return c.json({ success: true })
  } catch (error) {
    console.log('Error deleting snippet:', error)
    return c.json({ error: 'Failed to delete snippet' }, 500)
  }
})

// User signup
app.post('/make-server-01f554a3/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || 'Developer' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })

    if (error) {
      console.log('Signup error:', error)
      return c.json({ error: error.message }, 400)
    }

    return c.json({ 
      success: true, 
      message: 'Account created successfully! You can now sign in.' 
    })
  } catch (error) {
    console.log('Signup error:', error)
    return c.json({ error: 'Failed to create account' }, 500)
  }
})

// Get public snippets (for discovery)
app.get('/make-server-01f554a3/snippets/public/recent', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20')
    const type = c.req.query('type')
    
    // Get all snippet keys
    const snippetKeys = await kv.getByPrefix('snippet:')
    const publicSnippets = []
    
    for (const { value: snippet } of snippetKeys) {
      if (snippet.isPublic && (!type || snippet.type === type)) {
        publicSnippets.push({
          id: snippet.id,
          title: snippet.title,
          type: snippet.type,
          createdAt: snippet.createdAt,
          // Don't include full content for listing
        })
      }
    }

    // Sort by creation date and limit
    publicSnippets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const limitedSnippets = publicSnippets.slice(0, limit)

    return c.json({ snippets: limitedSnippets })
  } catch (error) {
    console.log('Error fetching public snippets:', error)
    return c.json({ error: 'Failed to fetch public snippets' }, 500)
  }
})

Deno.serve(app.fetch)
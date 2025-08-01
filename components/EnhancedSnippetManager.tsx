import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Alert, AlertDescription } from './ui/alert';
import { Copy, Trash2, Plus, Search, Share, Cloud, HardDrive, User, LogIn, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { authService, type AuthState } from '../services/authService';
import { snippetService, type CloudSnippet } from '../services/snippetService';

interface LocalSnippet {
  id: number;
  type: string;
  title: string;
  content: string;
  createdAt: string;
}

export function EnhancedSnippetManager() {
  const [localSnippets, setLocalSnippets] = useState<LocalSnippet[]>([]);
  const [cloudSnippets, setCloudSnippets] = useState<CloudSnippet[]>([]);
  const [publicSnippets, setPublicSnippets] = useState<CloudSnippet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'local' | 'cloud' | 'public'>('local');
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  // Form states
  const [newSnippet, setNewSnippet] = useState({
    title: '',
    content: '',
    type: 'custom',
    isPublic: false,
  });
  
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    name: '',
  });

  // Auth state
  const [authState, setAuthState] = useState<AuthState>({ user: null, loading: true });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLocalSnippets();
    const unsubscribe = authService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (authState.user && activeTab === 'cloud') {
      loadCloudSnippets();
    }
  }, [authState.user, activeTab]);

  useEffect(() => {
    if (activeTab === 'public') {
      loadPublicSnippets();
    }
  }, [activeTab]);

  const loadLocalSnippets = () => {
    const saved = localStorage.getItem('devtoolbox-snippets');
    if (saved) {
      setLocalSnippets(JSON.parse(saved));
    }
  };

  const saveLocalSnippets = (snippets: LocalSnippet[]) => {
    localStorage.setItem('devtoolbox-snippets', JSON.stringify(snippets));
    setLocalSnippets(snippets);
  };

  const loadCloudSnippets = async () => {
    if (!authState.user) return;
    
    try {
      setLoading(true);
      const snippets = await snippetService.getUserSnippets();
      setCloudSnippets(snippets);
    } catch (error) {
      console.error('Failed to load cloud snippets:', error);
      toast('Failed to load cloud snippets');
    } finally {
      setLoading(false);
    }
  };

  const loadPublicSnippets = async () => {
    try {
      setLoading(true);
      const snippets = await snippetService.getPublicSnippets();
      setPublicSnippets(snippets);
    } catch (error) {
      console.error('Failed to load public snippets:', error);
      toast('Failed to load public snippets');
    } finally {
      setLoading(false);
    }
  };

  const addLocalSnippet = () => {
    if (!newSnippet.title.trim() || !newSnippet.content.trim()) {
      toast('Please fill in both title and content');
      return;
    }

    const snippet: LocalSnippet = {
      id: Date.now(),
      type: newSnippet.type,
      title: newSnippet.title,
      content: newSnippet.content,
      createdAt: new Date().toISOString(),
    };

    const updated = [snippet, ...localSnippets];
    saveLocalSnippets(updated);
    setNewSnippet({ title: '', content: '', type: 'custom', isPublic: false });
    setIsAddDialogOpen(false);
    toast('Snippet saved locally!');
  };

  const addCloudSnippet = async () => {
    if (!authState.user) {
      toast('Please sign in to save to cloud');
      return;
    }

    if (!newSnippet.title.trim() || !newSnippet.content.trim()) {
      toast('Please fill in both title and content');
      return;
    }

    try {
      setLoading(true);
      const savedSnippet = await snippetService.saveSnippet({
        title: newSnippet.title,
        content: newSnippet.content,
        type: newSnippet.type,
        isPublic: newSnippet.isPublic,
      });

      setCloudSnippets(prev => [savedSnippet, ...prev]);
      setNewSnippet({ title: '', content: '', type: 'custom', isPublic: false });
      setIsAddDialogOpen(false);
      
      if (savedSnippet.isPublic) {
        toast('Snippet saved and shared! Link copied to clipboard.');
        navigator.clipboard.writeText(snippetService.generateShareUrl(savedSnippet.id));
      } else {
        toast('Snippet saved to cloud!');
      }
    } catch (error) {
      console.error('Failed to save snippet:', error);
      toast('Failed to save snippet to cloud');
    } finally {
      setLoading(false);
    }
  };

  const deleteLocalSnippet = (id: number) => {
    const updated = localSnippets.filter(s => s.id !== id);
    saveLocalSnippets(updated);
    toast('Snippet deleted!');
  };

  const deleteCloudSnippet = async (id: string) => {
    try {
      await snippetService.deleteSnippet(id);
      setCloudSnippets(prev => prev.filter(s => s.id !== id));
      toast('Snippet deleted!');
    } catch (error) {
      console.error('Failed to delete snippet:', error);
      toast('Failed to delete snippet');
    }
  };

  const copyToClipboard = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast('Copied to clipboard!');
  };

  const shareSnippet = async (snippet: CloudSnippet) => {
    const shareUrl = snippetService.generateShareUrl(snippet.id);
    await navigator.clipboard.writeText(shareUrl);
    toast('Share link copied to clipboard!');
  };

  const handleAuth = async () => {
    if (!authForm.email || !authForm.password) {
      toast('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      if (authMode === 'signin') {
        await authService.signIn(authForm.email, authForm.password);
        toast('Signed in successfully!');
      } else {
        if (!authForm.name) {
          toast('Please enter your name');
          return;
        }
        await authService.signUp(authForm.email, authForm.password, authForm.name);
        toast('Account created! Please sign in.');
        setAuthMode('signin');
        setAuthForm(prev => ({ ...prev, password: '' }));
        return; // Don't close dialog, let user sign in
      }
      
      setIsAuthDialogOpen(false);
      setAuthForm({ email: '', password: '', name: '' });
    } catch (error) {
      console.error('Auth error:', error);
      toast(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setCloudSnippets([]);
      toast('Signed out successfully!');
    } catch (error) {
      console.error('Sign out error:', error);
      toast('Failed to sign out');
    }
  };

  // Get current snippets based on active tab
  const getCurrentSnippets = () => {
    switch (activeTab) {
      case 'local':
        return localSnippets.filter(snippet => {
          const matchesSearch = snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               snippet.content.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesType = selectedType === 'all' || snippet.type === selectedType;
          return matchesSearch && matchesType;
        });
      case 'cloud':
        return cloudSnippets.filter(snippet => {
          const matchesSearch = snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               snippet.content.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesType = selectedType === 'all' || snippet.type === selectedType;
          return matchesSearch && matchesType;
        });
      case 'public':
        return publicSnippets.filter(snippet => {
          const matchesSearch = snippet.title.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesType = selectedType === 'all' || snippet.type === selectedType;
          return matchesSearch && matchesType;
        });
      default:
        return [];
    }
  };

  const allSnippets = [...localSnippets, ...cloudSnippets];
  const uniqueTypes = ['all', ...Array.from(new Set(allSnippets.map(s => s.type)))];

  const typeColors: Record<string, string> = {
    json: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    regex: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    uuid: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    base64: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    url: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    hash: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    custom: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  };

  const currentSnippets = getCurrentSnippets();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              Snippet Manager
              {authState.user && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {authState.user.name}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {authState.user ? (
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </Button>
              ) : (
                <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <LogIn className="w-4 h-4 mr-1" />
                      Sign In
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {authMode === 'signup' && (
                        <div>
                          <label className="block mb-2">Name:</label>
                          <Input
                            value={authForm.name}
                            onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Your name"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block mb-2">Email:</label>
                        <Input
                          type="email"
                          value={authForm.email}
                          onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="block mb-2">Password:</label>
                        <Input
                          type="password"
                          value={authForm.password}
                          onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Password"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAuth} disabled={loading}>
                          {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                        >
                          {authMode === 'signin' ? 'Create Account' : 'Sign In Instead'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Snippet
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Snippet</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2">Title:</label>
                      <Input
                        value={newSnippet.title}
                        onChange={(e) => setNewSnippet(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter snippet title..."
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Type:</label>
                      <select
                        value={newSnippet.type}
                        onChange={(e) => setNewSnippet(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="custom">Custom</option>
                        <option value="json">JSON</option>
                        <option value="regex">Regex</option>
                        <option value="base64">Base64</option>
                        <option value="url">URL</option>
                        <option value="hash">Hash</option>
                      </select>
                    </div>
                    {authState.user && (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={newSnippet.isPublic}
                          onCheckedChange={(checked) => setNewSnippet(prev => ({ ...prev, isPublic: checked }))}
                        />
                        <label className="text-sm">Make public (generate share link)</label>
                      </div>
                    )}
                    <div>
                      <label className="block mb-2">Content:</label>
                      <Textarea
                        value={newSnippet.content}
                        onChange={(e) => setNewSnippet(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Enter snippet content..."
                        className="min-h-32"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={authState.user ? addCloudSnippet : addLocalSnippet} disabled={loading}>
                        {authState.user ? (
                          <>
                            <Cloud className="w-4 h-4 mr-1" />
                            Save to Cloud
                          </>
                        ) : (
                          <>
                            <HardDrive className="w-4 h-4 mr-1" />
                            Save Locally
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="local" className="flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                Local ({localSnippets.length})
              </TabsTrigger>
              <TabsTrigger value="cloud" className="flex items-center gap-2">
                <Cloud className="w-4 h-4" />
                Cloud ({cloudSnippets.length})
              </TabsTrigger>
              <TabsTrigger value="public" className="flex items-center gap-2">
                <Share className="w-4 h-4" />
                Public
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-4 mt-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search snippets..."
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border rounded"
              >
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <TabsContent value="local">
              {!authState.user && (
                <Alert>
                  <AlertDescription>
                    Sign in to sync your snippets across devices and share them with others.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="cloud">
              {!authState.user ? (
                <Alert>
                  <AlertDescription>
                    Please sign in to access cloud-saved snippets.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <AlertDescription>
                    Your snippets are automatically synced across all your devices.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="public">
              <Alert>
                <AlertDescription>
                  Discover useful snippets shared by the community.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>

          {loading && (
            <div className="text-center py-4 text-muted-foreground">
              Loading snippets...
            </div>
          )}

          {!loading && currentSnippets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {allSnippets.length === 0 ? (
                <div>
                  <p>No snippets found.</p>
                  <p className="text-sm mt-1">Use the tools above to generate and save snippets, or add custom ones.</p>
                </div>
              ) : (
                <p>No snippets match your search.</p>
              )}
            </div>
          )}

          {!loading && currentSnippets.length > 0 && (
            <div className="space-y-3">
              {currentSnippets.map((snippet) => (
                <Card key={`${activeTab}-${snippet.id}`} className="border-l-4 border-l-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{snippet.title}</h3>
                        <Badge className={typeColors[snippet.type] || typeColors.custom}>
                          {snippet.type}
                        </Badge>
                        {activeTab === 'cloud' && 'isPublic' in snippet && snippet.isPublic && (
                          <Badge variant="outline">Public</Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(snippet.content)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        {activeTab === 'cloud' && 'isPublic' in snippet && snippet.isPublic && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => shareSnippet(snippet as CloudSnippet)}
                          >
                            <Share className="w-4 h-4" />
                          </Button>
                        )}
                        {activeTab !== 'public' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (activeTab === 'local') {
                                deleteLocalSnippet(snippet.id as number);
                              } else {
                                deleteCloudSnippet((snippet as CloudSnippet).id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {new Date(snippet.createdAt).toLocaleString()}
                    </div>
                    <div className="bg-muted/30 p-3 rounded font-mono text-sm max-h-32 overflow-auto">
                      {snippet.content}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
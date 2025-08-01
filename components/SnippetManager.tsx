import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Copy, Trash2, Plus, Search, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Snippet {
  id: number;
  type: string;
  title: string;
  content: string;
  createdAt: string;
}

export function SnippetManager() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSnippet, setNewSnippet] = useState({
    title: '',
    content: '',
    type: 'custom',
  });

  useEffect(() => {
    loadSnippets();
  }, []);

  const loadSnippets = () => {
    const saved = localStorage.getItem('devtoolbox-snippets');
    if (saved) {
      setSnippets(JSON.parse(saved));
    }
  };

  const saveSnippets = (newSnippets: Snippet[]) => {
    localStorage.setItem('devtoolbox-snippets', JSON.stringify(newSnippets));
    setSnippets(newSnippets);
  };

  const addSnippet = () => {
    if (!newSnippet.title.trim() || !newSnippet.content.trim()) {
      toast('Please fill in both title and content');
      return;
    }

    const snippet: Snippet = {
      id: Date.now(),
      type: newSnippet.type,
      title: newSnippet.title,
      content: newSnippet.content,
      createdAt: new Date().toISOString(),
    };

    const updated = [snippet, ...snippets];
    saveSnippets(updated);
    setNewSnippet({ title: '', content: '', type: 'custom' });
    setIsAddDialogOpen(false);
    toast('Snippet added!');
  };

  const deleteSnippet = (id: number) => {
    const updated = snippets.filter(s => s.id !== id);
    saveSnippets(updated);
    toast('Snippet deleted!');
  };

  const copyToClipboard = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast('Copied to clipboard!');
  };

  const exportSnippets = () => {
    const dataStr = JSON.stringify(snippets, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'devtoolbox-snippets.json';
    link.click();
    URL.revokeObjectURL(url);
    toast('Snippets exported!');
  };

  const importSnippets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          const updated = [...imported, ...snippets];
          saveSnippets(updated);
          toast('Snippets imported!');
        }
      } catch (error) {
        toast('Failed to import snippets: Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         snippet.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || snippet.type === selectedType;
    return matchesSearch && matchesType;
  });

  const uniqueTypes = ['all', ...Array.from(new Set(snippets.map(s => s.type)))];

  const typeColors: Record<string, string> = {
    json: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    regex: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    uuid: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    base64: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    url: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    hash: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    custom: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Saved Snippets ({snippets.length})
            <div className="flex gap-2">
              <input
                type="file"
                accept=".json"
                onChange={importSnippets}
                className="hidden"
                id="import-snippets"
              />
              <Button variant="outline" size="sm" onClick={() => document.getElementById('import-snippets')?.click()}>
                Import
              </Button>
              <Button variant="outline" size="sm" onClick={exportSnippets}>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
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
                      <Button onClick={addSnippet}>Add Snippet</Button>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
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

          {filteredSnippets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {snippets.length === 0 ? (
                <div>
                  <p>No snippets saved yet.</p>
                  <p className="text-sm mt-1">Use the tools above to generate and save snippets, or add custom ones.</p>
                </div>
              ) : (
                <p>No snippets match your search.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSnippets.map((snippet) => (
                <Card key={snippet.id} className="border-l-4 border-l-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{snippet.title}</h3>
                        <Badge className={typeColors[snippet.type] || typeColors.custom}>
                          {snippet.type}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(snippet.content)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteSnippet(snippet.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
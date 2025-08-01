import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Copy, ArrowLeft, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { snippetService, type CloudSnippet } from '../services/snippetService';

interface SharePageProps {
  snippetId: string;
}

export function SharePage({ snippetId }: SharePageProps) {
  const [snippet, setSnippet] = useState<CloudSnippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSnippet();
  }, [snippetId]);

  const loadSnippet = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedSnippet = await snippetService.getSnippet(snippetId);
      setSnippet(loadedSnippet);
    } catch (err) {
      console.error('Failed to load snippet:', err);
      setError(err instanceof Error ? err.message : 'Failed to load snippet');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast('Copied to clipboard!');
  };

  const goHome = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const typeColors: Record<string, string> = {
    json: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    regex: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    uuid: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    base64: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    url: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    hash: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    custom: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading snippet...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="mb-6">
            <Button variant="outline" onClick={goHome}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to DevToolbox
            </Button>
          </div>
          
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="mb-6">
            <Button variant="outline" onClick={goHome}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to DevToolbox
            </Button>
          </div>
          
          <Alert>
            <AlertDescription>Snippet not found.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" onClick={goHome}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to DevToolbox
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="mb-2">DevToolbox</h1>
          <p className="text-muted-foreground">Shared Code Snippet</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span>{snippet.title}</span>
                <Badge className={typeColors[snippet.type] || typeColors.custom}>
                  {snippet.type}
                </Badge>
                <Badge variant="outline">Public</Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(snippet.content)}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={goHome}>
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open DevToolbox
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Shared on {new Date(snippet.createdAt).toLocaleDateString()}
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Content:</label>
              <div className="bg-muted/30 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap max-h-96 overflow-auto border">
                {snippet.content}
              </div>
            </div>

            <Alert>
              <AlertDescription>
                This snippet was shared from DevToolbox. 
                <a 
                  href="/" 
                  className="underline ml-1"
                  onClick={(e) => {
                    e.preventDefault();
                    goHome();
                  }}
                >
                  Try DevToolbox yourself
                </a> 
                {' '}to create your own developer tools and snippets.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
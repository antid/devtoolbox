import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Copy, Download, Upload, Cloud, HardDrive, FileText, Settings, Play, Minimize2 } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../services/authService';
import { snippetService } from '../services/snippetService';

export function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);
  const [saving, setSaving] = useState(false);

  const formatJson = () => {
    try {
      setError('');
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, indent);
      setOutput(formatted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setOutput('');
    }
  };

  const minifyJson = () => {
    try {
      setError('');
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setOutput('');
    }
  };

  const copyToClipboard = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      toast('Copied to clipboard!');
    }
  };

  const saveSnippet = async () => {
    if (!output) return;

    const user = authService.getCurrentUser();
    
    try {
      setSaving(true);
      
      if (user) {
        // Save to cloud
        const snippet = await snippetService.saveSnippet({
          title: 'JSON Snippet',
          content: output,
          type: 'json',
          isPublic: false,
        });
        toast('Snippet saved to cloud!');
      } else {
        // Save locally
        const snippets = JSON.parse(localStorage.getItem('devtoolbox-snippets') || '[]');
        const newSnippet = {
          id: Date.now(),
          type: 'json',
          title: 'JSON Snippet',
          content: output,
          createdAt: new Date().toISOString(),
        };
        snippets.push(newSnippet);
        localStorage.setItem('devtoolbox-snippets', JSON.stringify(snippets));
        toast('Snippet saved locally!');
      }
    } catch (error) {
      console.error('Failed to save snippet:', error);
      toast('Failed to save snippet');
    } finally {
      setSaving(false);
    }
  };

  const loadExample = () => {
    const example = {
      "name": "John Doe",
      "age": 30,
      "city": "New York",
      "hobbies": ["reading", "swimming", "coding"],
      "address": {
        "street": "123 Main St",
        "zipCode": "10001"
      }
    };
    setInput(JSON.stringify(example));
  };

  const user = authService.getCurrentUser();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">JSON Formatter & Validator</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Format, validate, and minify JSON data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="flowbite-card">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-gray-500" />
                Input JSON
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadExample}
                  className="text-xs"
                >
                  Load Example
                </Button>
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <select 
                    value={indent} 
                    onChange={(e) => setIndent(Number(e.target.value))}
                    className="flowbite-input py-1 px-2 text-xs min-w-0"
                  >
                    <option value={2}>2 spaces</option>
                    <option value={4}>4 spaces</option>
                    <option value={1}>1 space</option>
                  </select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paste your JSON here:
              </label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='{"name": "John", "age": 30}'
                className="min-h-64 font-mono text-sm flowbite-input"
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={formatJson}
                className="flowbite-button-primary flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Format JSON
              </Button>
              <Button 
                variant="outline" 
                onClick={minifyJson}
                className="flowbite-button-secondary flex items-center gap-2"
              >
                <Minimize2 className="w-4 h-4" />
                Minify
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                <AlertDescription className="text-red-700 dark:text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="flowbite-card">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-gray-500" />
                Formatted Output
              </CardTitle>
              {output && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyToClipboard}
                    className="text-xs flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={saveSnippet}
                    disabled={saving}
                    className="text-xs flex items-center gap-1"
                  >
                    {user ? (
                      <Cloud className="w-3 h-3" />
                    ) : (
                      <HardDrive className="w-3 h-3" />
                    )}
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {output ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Formatted result:
                </label>
                <Textarea
                  value={output}
                  readOnly
                  className="min-h-64 font-mono text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-64 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Your formatted JSON will appear here
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
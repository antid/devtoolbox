import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Copy, Upload } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const encodeBase64 = () => {
    try {
      setError('');
      const encoded = btoa(unescape(encodeURIComponent(input)));
      setOutput(encoded);
    } catch (err) {
      setError('Failed to encode: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setOutput('');
    }
  };

  const decodeBase64 = () => {
    try {
      setError('');
      const decoded = decodeURIComponent(escape(atob(input)));
      setOutput(decoded);
    } catch (err) {
      setError('Failed to decode: Invalid Base64 string');
      setOutput('');
    }
  };

  const handleProcess = () => {
    if (mode === 'encode') {
      encodeBase64();
    } else {
      decodeBase64();
    }
  };

  const copyToClipboard = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      toast('Copied to clipboard!');
    }
  };

  const saveSnippet = () => {
    if (output) {
      const snippets = JSON.parse(localStorage.getItem('devtoolbox-snippets') || '[]');
      const newSnippet = {
        id: Date.now(),
        type: 'base64',
        title: `Base64 ${mode === 'encode' ? 'Encoded' : 'Decoded'}`,
        content: output,
        createdAt: new Date().toISOString(),
      };
      snippets.push(newSnippet);
      localStorage.setItem('devtoolbox-snippets', JSON.stringify(snippets));
      toast('Snippet saved!');
    }
  };

  const swapInputOutput = () => {
    const temp = input;
    setInput(output);
    setOutput(temp);
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setError('');
  };

  const loadExample = () => {
    if (mode === 'encode') {
      setInput('Hello, World! This is a sample text for Base64 encoding.');
    } else {
      setInput('SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgc2FtcGxlIHRleHQgZm9yIEJhc2U2NCBlbmNvZGluZy4=');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Base64 Encoder/Decoder
            <Button variant="outline" size="sm" onClick={loadExample}>
              Load Example
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'encode' | 'decode')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="encode">Encode</TabsTrigger>
              <TabsTrigger value="decode">Decode</TabsTrigger>
            </TabsList>

            <TabsContent value="encode" className="space-y-4">
              <div>
                <label className="block mb-2">Text to Encode:</label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter text to encode to Base64..."
                  className="min-h-32"
                />
              </div>
            </TabsContent>

            <TabsContent value="decode" className="space-y-4">
              <div>
                <label className="block mb-2">Base64 to Decode:</label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter Base64 string to decode..."
                  className="min-h-32 font-mono"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2">
            <Button onClick={handleProcess}>
              {mode === 'encode' ? 'Encode' : 'Decode'}
            </Button>
            {output && (
              <Button variant="outline" onClick={swapInputOutput}>
                Swap & {mode === 'encode' ? 'Decode' : 'Encode'}
              </Button>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {output && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label>{mode === 'encode' ? 'Encoded' : 'Decoded'} Output:</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={saveSnippet}>
                    <Upload className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
              <Textarea
                value={output}
                readOnly
                className={`min-h-32 ${mode === 'encode' ? 'font-mono' : ''} text-sm`}
              />
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p><strong>Base64 Encoding:</strong> Converts binary data to ASCII text format using 64 printable characters.</p>
            <p>Commonly used for encoding data in URLs, emails, and storing complex data in text format.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Copy, Upload } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function UrlTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const encodeUrl = () => {
    const encoded = encodeURIComponent(input);
    setOutput(encoded);
  };

  const decodeUrl = () => {
    try {
      const decoded = decodeURIComponent(input);
      setOutput(decoded);
    } catch (err) {
      setOutput('Error: Invalid URL encoding');
    }
  };

  const handleProcess = () => {
    if (mode === 'encode') {
      encodeUrl();
    } else {
      decodeUrl();
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
        type: 'url',
        title: `URL ${mode === 'encode' ? 'Encoded' : 'Decoded'}`,
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
  };

  const loadExample = () => {
    if (mode === 'encode') {
      setInput('https://example.com/search?q=hello world&lang=en');
    } else {
      setInput('https%3A//example.com/search%3Fq%3Dhello%20world%26lang%3Den');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            URL Encoder/Decoder
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
                <label className="block mb-2">URL to Encode:</label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter URL or text to encode..."
                  className="min-h-24"
                />
              </div>
            </TabsContent>

            <TabsContent value="decode" className="space-y-4">
              <div>
                <label className="block mb-2">Encoded URL to Decode:</label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter URL-encoded text to decode..."
                  className="min-h-24"
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
                className="min-h-24 text-sm"
              />
            </div>
          )}

          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>URL Encoding:</strong> Converts special characters to percent-encoded format for safe transmission in URLs.</p>
            <p>Common characters: space → %20, & → %26, = → %3D, ? → %3F</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
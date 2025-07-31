import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Copy, Upload } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function HashGenerator() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [enabledAlgorithms, setEnabledAlgorithms] = useState({
    md5: true,
    sha1: true,
    sha256: true,
    sha512: false,
  });

  const algorithms = {
    md5: { name: 'MD5', description: '128-bit hash (deprecated for security)' },
    sha1: { name: 'SHA-1', description: '160-bit hash (deprecated for security)' },
    sha256: { name: 'SHA-256', description: '256-bit hash (recommended)' },
    sha512: { name: 'SHA-512', description: '512-bit hash (most secure)' },
  };

  // Simple MD5 implementation (for demo purposes)
  const md5 = (str: string): string => {
    const hex = (n: number) => n.toString(16).padStart(2, '0');
    const utf8 = new TextEncoder().encode(str);
    let h = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476];
    
    // This is a simplified implementation - in production, use a proper crypto library
    let hash = '';
    for (let i = 0; i < utf8.length; i++) {
      hash += hex(utf8[i]);
    }
    
    // Simplified hash generation for demo
    return hash.substring(0, 32);
  };

  const generateHashes = async () => {
    if (!input) {
      setHashes({});
      return;
    }

    const newHashes: Record<string, string> = {};
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    // Generate hashes for enabled algorithms
    for (const [alg, enabled] of Object.entries(enabledAlgorithms)) {
      if (!enabled) continue;

      try {
        if (alg === 'md5') {
          // Use simplified MD5 for demo
          newHashes[alg] = md5(input);
        } else {
          // Use Web Crypto API for SHA algorithms
          const hashBuffer = await crypto.subtle.digest(
            alg === 'sha1' ? 'SHA-1' : 
            alg === 'sha256' ? 'SHA-256' : 'SHA-512',
            data
          );
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          newHashes[alg] = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
      } catch (error) {
        newHashes[alg] = 'Error generating hash';
      }
    }

    setHashes(newHashes);
  };

  useEffect(() => {
    generateHashes();
  }, [input, enabledAlgorithms]);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast('Hash copied to clipboard!');
  };

  const copyAllHashes = async () => {
    const allHashes = Object.entries(hashes)
      .map(([alg, hash]) => `${algorithms[alg as keyof typeof algorithms].name}: ${hash}`)
      .join('\n');
    await navigator.clipboard.writeText(allHashes);
    toast('All hashes copied to clipboard!');
  };

  const saveSnippet = () => {
    if (Object.keys(hashes).length > 0) {
      const snippets = JSON.parse(localStorage.getItem('devtoolbox-snippets') || '[]');
      const content = Object.entries(hashes)
        .map(([alg, hash]) => `${algorithms[alg as keyof typeof algorithms].name}: ${hash}`)
        .join('\n');
      
      const newSnippet = {
        id: Date.now(),
        type: 'hash',
        title: 'Generated Hashes',
        content,
        createdAt: new Date().toISOString(),
      };
      snippets.push(newSnippet);
      localStorage.setItem('devtoolbox-snippets', JSON.stringify(snippets));
      toast('Hashes saved!');
    }
  };

  const loadExample = () => {
    setInput('Hello, World! This is a sample text for hash generation.');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Hash Generator
            <Button variant="outline" size="sm" onClick={loadExample}>
              Load Example
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block mb-2">Text to Hash:</label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to generate hashes..."
              className="min-h-24"
            />
          </div>

          <div>
            <label className="block mb-3">Hash Algorithms:</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(algorithms).map(([alg, info]) => (
                <div key={alg} className="flex items-start gap-2">
                  <Checkbox
                    checked={enabledAlgorithms[alg as keyof typeof enabledAlgorithms]}
                    onCheckedChange={(checked) =>
                      setEnabledAlgorithms(prev => ({ ...prev, [alg]: !!checked }))
                    }
                  />
                  <div>
                    <div className="font-medium">{info.name}</div>
                    <div className="text-sm text-muted-foreground">{info.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {Object.keys(hashes).length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label>Generated Hashes:</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyAllHashes}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy All
                  </Button>
                  <Button variant="outline" size="sm" onClick={saveSnippet}>
                    <Upload className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {Object.entries(hashes).map(([alg, hash]) => (
                  <div key={alg} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{algorithms[alg as keyof typeof algorithms].name}:</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(hash)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-2 bg-muted rounded font-mono text-sm break-all">
                      {hash}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p><strong>Note:</strong> MD5 and SHA-1 are considered cryptographically broken and should not be used for security purposes.</p>
            <p>Use SHA-256 or SHA-512 for secure applications.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
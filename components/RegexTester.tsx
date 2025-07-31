import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Copy, Upload, Regex, Search, CheckCircle, XCircle, Settings } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false });
  const [testString, setTestString] = useState('');
  const [replacement, setReplacement] = useState('');

  const regex = useMemo(() => {
    if (!pattern) return null;
    try {
      const flagString = Object.entries(flags)
        .filter(([_, enabled]) => enabled)
        .map(([flag]) => flag)
        .join('');
      return new RegExp(pattern, flagString);
    } catch {
      return null;
    }
  }, [pattern, flags]);

  const matches = useMemo(() => {
    if (!regex || !testString) return [];
    return Array.from(testString.matchAll(regex));
  }, [regex, testString]);

  const highlightedText = useMemo(() => {
    if (!matches.length || !testString) return testString;
    
    let highlighted = testString;
    let offset = 0;
    
    matches.forEach((match) => {
      if (match.index !== undefined) {
        const start = match.index + offset;
        const end = start + match[0].length;
        const before = highlighted.slice(0, start);
        const matchText = highlighted.slice(start, end);
        const after = highlighted.slice(end);
        
        highlighted = before + `<mark class="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-1 rounded">${matchText}</mark>` + after;
        offset += 95; // Length of mark tags
      }
    });
    
    return highlighted;
  }, [matches, testString]);

  const replacedText = useMemo(() => {
    if (!regex || !testString || !replacement) return '';
    try {
      return testString.replace(regex, replacement);
    } catch {
      return '';
    }
  }, [regex, testString, replacement]);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast('Copied to clipboard!');
  };

  const saveSnippet = () => {
    if (pattern) {
      const snippets = JSON.parse(localStorage.getItem('devtoolbox-snippets') || '[]');
      const newSnippet = {
        id: Date.now(),
        type: 'regex',
        title: 'Regex Pattern',
        content: `/${pattern}/${Object.entries(flags).filter(([_, enabled]) => enabled).map(([flag]) => flag).join('')}`,
        createdAt: new Date().toISOString(),
      };
      snippets.push(newSnippet);
      localStorage.setItem('devtoolbox-snippets', JSON.stringify(snippets));
      toast('Regex pattern saved!');
    }
  };

  const loadExample = () => {
    setPattern('\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b');
    setTestString('Contact us at support@example.com or sales@company.org for more information.');
    setFlags({ g: true, i: true, m: false });
  };

  const isValidPattern = pattern && regex;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg">
          <Regex className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Regex Tester</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Test and validate regular expressions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pattern & Settings */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="flowbite-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-500" />
                Pattern & Flags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Regular Expression:
                </label>
                <div className="relative">
                  <Input
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    placeholder="Enter regex pattern..."
                    className="font-mono flowbite-input pr-10"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {pattern && (
                      isValidPattern ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )
                    )}
                  </div>
                </div>
                {pattern && !regex && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    Invalid regular expression
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Flags:
                </label>
                <div className="space-y-3">
                  {Object.entries(flags).map(([flag, enabled]) => (
                    <div key={flag} className="flex items-center gap-3">
                      <Checkbox
                        checked={enabled}
                        onCheckedChange={(checked) => 
                          setFlags(prev => ({ ...prev, [flag]: !!checked }))
                        }
                        className="border-gray-300 dark:border-gray-600"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {flag}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                          {flag === 'g' ? 'Global' : flag === 'i' ? 'Ignore case' : 'Multiline'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={loadExample}
                className="w-full flowbite-button-secondary"
              >
                Load Email Example
              </Button>
            </CardContent>
          </Card>

          {/* Match Results */}
          {pattern && testString && (
            <Card className="flowbite-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-gray-500" />
                  Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Matches Found:
                  </span>
                  <Badge 
                    variant={matches.length > 0 ? "default" : "secondary"}
                    className={matches.length > 0 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}
                  >
                    {matches.length} match{matches.length !== 1 ? 'es' : ''}
                  </Badge>
                </div>
                
                {matches.length > 0 && (
                  <div className="space-y-2">
                    {matches.slice(0, 5).map((match, index) => (
                      <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm font-mono">
                        <span className="text-gray-600 dark:text-gray-400">Match {index + 1}:</span>
                        <br />
                        <span className="text-blue-600 dark:text-blue-400">{match[0]}</span>
                      </div>
                    ))}
                    {matches.length > 5 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ... and {matches.length - 5} more matches
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Test Input & Output */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="flowbite-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Test Input
              </CardTitle>
            </CardHeader>
            <CardContent>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Text to test against:
              </label>
              <Textarea
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                placeholder="Enter text to test your regex pattern..."
                className="min-h-32 flowbite-input"
              />
            </CardContent>
          </Card>

          {/* Highlighted Results */}
          {matches.length > 0 && (
            <Card className="flowbite-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Highlighted Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg whitespace-pre-wrap font-mono text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: highlightedText }}
                />
              </CardContent>
            </Card>
          )}

          {/* Replacement */}
          <Card className="flowbite-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Replace (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Replacement text:
                </label>
                <Input
                  value={replacement}
                  onChange={(e) => setReplacement(e.target.value)}
                  placeholder="Enter replacement text..."
                  className="flowbite-input"
                />
              </div>

              {replacedText && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Replaced text:
                    </label>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyToClipboard(replacedText)}
                        className="text-xs"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={saveSnippet}
                        className="text-xs"
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Save Pattern
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={replacedText}
                    readOnly
                    className="min-h-32 font-mono text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
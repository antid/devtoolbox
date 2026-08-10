import { useState, useMemo, type ReactNode } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Copy, Upload, Regex, Search, CheckCircle, XCircle, Settings } from 'lucide-react';
import { toast } from 'sonner';

type LiteralMatch = {
  value: string;
  index: number;
};

const findLiteralIndex = (source: string, needle: string, startIndex: number, ignoreCase: boolean) => {
  if (!ignoreCase) {
    return source.indexOf(needle, startIndex);
  }

  const normalizedNeedle = needle.toLocaleLowerCase();

  for (let index = startIndex; index <= source.length - needle.length; index += 1) {
    if (source.slice(index, index + needle.length).toLocaleLowerCase() === normalizedNeedle) {
      return index;
    }
  }

  return -1;
};

const findLiteralMatches = (
  source: string,
  needle: string,
  options: { global: boolean; ignoreCase: boolean },
): LiteralMatch[] => {
  if (!source || !needle) return [];

  const matches: LiteralMatch[] = [];
  let searchIndex = 0;

  while (searchIndex <= source.length - needle.length) {
    const index = findLiteralIndex(source, needle, searchIndex, options.ignoreCase);
    if (index === -1) break;

    matches.push({
      value: source.slice(index, index + needle.length),
      index,
    });

    if (!options.global) break;
    searchIndex = index + needle.length;
  }

  return matches;
};

const buildHighlightedContent = (source: string, matches: LiteralMatch[]): ReactNode[] => {
  const content: ReactNode[] = [];
  let cursor = 0;

  matches.forEach((match, matchIndex) => {
    const end = match.index + match.value.length;

    content.push(source.slice(cursor, match.index));
    content.push(
      <mark
        key={`${match.index}-${matchIndex}`}
        className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-1 rounded"
      >
        {source.slice(match.index, end)}
      </mark>,
    );
    cursor = end;
  });

  content.push(source.slice(cursor));
  return content;
};

const replaceLiteralMatches = (source: string, matches: LiteralMatch[], replacement: string) => {
  let replaced = '';
  let cursor = 0;

  matches.forEach((match) => {
    replaced += source.slice(cursor, match.index);
    replaced += replacement;
    cursor = match.index + match.value.length;
  });

  return replaced + source.slice(cursor);
};

export function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false });
  const [testString, setTestString] = useState('');
  const [replacement, setReplacement] = useState('');

  const matches = useMemo(() => {
    return findLiteralMatches(testString, pattern, {
      global: flags.g,
      ignoreCase: flags.i,
    });
  }, [flags.g, flags.i, pattern, testString]);

  const highlightedSegments = useMemo<Array<{ text: string; highlighted: boolean }>>(() => {
    if (!matches.length || !testString) {
      return [{ text: testString, highlighted: false }];
    }

    const segments: Array<{ text: string; highlighted: boolean }> = [];
    let lastIndex = 0;

    matches.forEach((match) => {
      if (match.index !== undefined) {
        const start = match.index;
        const end = start + match[0].length;

        if (start > lastIndex) {
          segments.push({ text: testString.slice(lastIndex, start), highlighted: false });
        }

        segments.push({ text: testString.slice(start, end), highlighted: true });
        lastIndex = end;
      }
    });

    if (lastIndex < testString.length) {
      segments.push({ text: testString.slice(lastIndex), highlighted: false });
    }

    return segments.length ? segments : [{ text: testString, highlighted: false }];
  }, [matches, testString]);

  const replacedText = useMemo(() => {
    if (!matches.length || !replacement) return '';
    return replaceLiteralMatches(testString, matches, replacement);
  }, [matches, replacement, testString]);

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

  const isValidPattern = pattern.length > 0;

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
                        <span className="text-blue-600 dark:text-blue-400">{match.value}</span>
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
                >
                  {highlightedSegments.map((segment, index) => (
                    segment.highlighted ? (
                      <mark
                        key={index}
                        className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-1 rounded"
                      >
                        {segment.text}
                      </mark>
                    ) : (
                      <span key={index}>{segment.text}</span>
                    )
                  ))}
                </div>
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

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Copy, RefreshCw, Upload, Shuffle, Settings, Info, Hash } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function UuidGenerator() {
  const [version, setVersion] = useState('4');
  const [quantity, setQuantity] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);

  const generateV4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const generateV1 = () => {
    // Simplified UUID v1 (timestamp-based)
    const timestamp = Date.now();
    const random = Math.random().toString(16).substr(2, 14);
    return `${timestamp.toString(16)}-${random.substr(0, 4)}-1${random.substr(4, 3)}-${random.substr(7, 4)}-${random.substr(11)}`;
  };

  const generateNil = () => {
    return '00000000-0000-0000-0000-000000000000';
  };

  const generateUuid = () => {
    switch (version) {
      case '1':
        return generateV1();
      case '4':
        return generateV4();
      case 'nil':
        return generateNil();
      default:
        return generateV4();
    }
  };

  const generateUuids = () => {
    const newUuids = Array.from({ length: quantity }, () => generateUuid());
    setUuids(newUuids);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast('Copied to clipboard!');
  };

  const copyAllUuids = async () => {
    const allUuids = uuids.join('\n');
    await navigator.clipboard.writeText(allUuids);
    toast('All UUIDs copied to clipboard!');
  };

  const saveSnippet = () => {
    if (uuids.length > 0) {
      const snippets = JSON.parse(localStorage.getItem('devtoolbox-snippets') || '[]');
      const newSnippet = {
        id: Date.now(),
        type: 'uuid',
        title: `UUID v${version} (${uuids.length})`,
        content: uuids.join('\n'),
        createdAt: new Date().toISOString(),
      };
      snippets.push(newSnippet);
      localStorage.setItem('devtoolbox-snippets', JSON.stringify(snippets));
      toast('UUIDs saved!');
    }
  };

  const getVersionInfo = () => {
    switch (version) {
      case '1':
        return {
          title: 'UUID Version 1',
          description: 'Timestamp-based UUIDs that include MAC address information. Predictable but unique.',
          icon: '🕐'
        };
      case '4':
        return {
          title: 'UUID Version 4',
          description: 'Randomly generated UUIDs. Most commonly used due to unpredictability.',
          icon: '🎲'
        };
      case 'nil':
        return {
          title: 'Nil UUID',
          description: 'Special UUID with all bits set to zero. Used as a placeholder or null value.',
          icon: '⭕'
        };
      default:
        return { title: '', description: '', icon: '' };
    }
  };

  const versionInfo = getVersionInfo();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg">
          <Shuffle className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">UUID Generator</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Generate unique identifiers for your applications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-1">
          <Card className="flowbite-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-500" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  UUID Version:
                </label>
                <Select value={version} onValueChange={setVersion}>
                  <SelectTrigger className="flowbite-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Version 1 (Timestamp)</SelectItem>
                    <SelectItem value="4">Version 4 (Random)</SelectItem>
                    <SelectItem value="nil">Nil UUID</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantity (1-100):
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  className="flowbite-input"
                />
              </div>

              <Button 
                onClick={generateUuids} 
                className="w-full flowbite-button-primary flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Generate UUIDs
              </Button>

              {/* Version Info */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{versionInfo.icon}</div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                      {versionInfo.title}
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      {versionInfo.description}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <Card className="flowbite-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Hash className="w-5 h-5 text-gray-500" />
                  Generated UUIDs
                  {uuids.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {uuids.length}
                    </span>
                  )}
                </CardTitle>
                {uuids.length > 0 && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={copyAllUuids}
                      className="text-xs"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy All
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={saveSnippet}
                      className="text-xs"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {uuids.length > 0 ? (
                <div className="space-y-3">
                  {uuids.map((uuid, index) => (
                    <div key={index} className="group flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            UUID #{index + 1}
                          </span>
                        </div>
                        <code className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                          {uuid}
                        </code>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(uuid)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="text-center">
                    <Shuffle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                      No UUIDs generated yet
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Configure your settings and click "Generate UUIDs"
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Information Section */}
      <Card className="flowbite-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-gray-500" />
            UUID Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🕐 UUID v1</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Timestamp-based UUIDs that include MAC address information. Predictable sequence but guaranteed uniqueness.
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🎲 UUID v4</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Randomly generated UUIDs. Most commonly used due to high entropy and unpredictability. Recommended for most use cases.
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">⭕ Nil UUID</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Special UUID with all bits set to zero. Used as a placeholder, null value, or to represent an empty UUID.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
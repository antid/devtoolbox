import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { JsonFormatter } from '../components/JsonFormatter';
import { RegexTester } from '../components/RegexTester';
import { UuidGenerator } from '../components/UuidGenerator';
import { Base64Tool } from '../components/Base64Tool';
import { UrlTool } from '../components/UrlTool';
import { HashGenerator } from '../components/HashGenerator';
import { EnhancedSnippetManager } from '../components/EnhancedSnippetManager';
import { SharePage } from '../components/SharePage';
import { Button } from '../components/ui/button';
import { Code, Hash, Link, Regex, Shuffle, FileText, Bookmark, Wrench, Sun, Moon } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('json');
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  // Initialize theme from localStorage or default to dark
  useEffect(() => {
    const savedTheme = localStorage.getItem('devtoolbox-theme');
    const prefersDark = savedTheme === 'dark' || (!savedTheme && true); // Default to dark if no saved preference
    setIsDarkMode(prefersDark);
    
    // Apply theme to document
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    
    // Update document class
    if (newIsDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('devtoolbox-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('devtoolbox-theme', 'light');
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check if we're on a share page
  const shareMatch = currentPath.match(/^\/share\/(.+)$/);
  if (shareMatch) {
    const snippetId = shareMatch[1];
    return <SharePage snippetId={snippetId} />;
  }

  const tools = [
    { id: 'json', label: 'JSON Formatter', icon: FileText, component: JsonFormatter },
    { id: 'regex', label: 'Regex Tester', icon: Regex, component: RegexTester },
    { id: 'uuid', label: 'UUID Generator', icon: Shuffle, component: UuidGenerator },
    { id: 'base64', label: 'Base64 Tool', icon: Code, component: Base64Tool },
    { id: 'url', label: 'URL Tool', icon: Link, component: UrlTool },
    { id: 'hash', label: 'Hash Generator', icon: Hash, component: HashGenerator },
    { id: 'snippets', label: 'Snippets', icon: Bookmark, component: EnhancedSnippetManager },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        {/* Header Section */}
        <div className="relative text-center mb-8 lg:mb-12">
          {/* Theme Toggle - Top Right */}
          <div className="absolute top-0 right-0">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="flowbite-button-secondary p-2 w-10 h-10"
              aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4 text-blue-600" />
              )}
            </Button>
          </div>

          {/* Main Header Content */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              DevToolbox
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            All your essential developer tools in one place. Format, test, generate, and manage with ease.
          </p>
        </div>

        {/* Main Content */}
        <div className="flowbite-card p-6 lg:p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 gap-1 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <TabsTrigger 
                    key={tool.id} 
                    value={tool.id} 
                    className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 py-2.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline truncate">{tool.label}</span>
                    <span className="sm:hidden text-xs truncate">{tool.label.split(' ')[0]}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {tools.map((tool) => {
              const Component = tool.component;
              return (
                <TabsContent key={tool.id} value={tool.id} className="mt-0">
                  <Component />
                </TabsContent>
              );
            })}
          </Tabs>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Built with React, Tailwind CSS, and Supabase by Alex Martinez | 
            <a 
              href="https://antid.co" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors ml-1"
            >
              antid.co
            </a> 2025
          </p>
        </div>
      </div>
    </div>
  );
}
# DevToolbox 🧰

All your essential developer tools in one place. Format, test, generate, and manage with ease.

![DevToolbox Screenshot](https://via.placeholder.com/800x400/3b82f6/ffffff?text=DevToolbox)

## Features

### 🔧 Available Tools

- **JSON Formatter & Validator** - Format, validate, and minify JSON data with syntax highlighting
- **Regex Tester** - Test regular expressions with real-time matching and replacement
- **UUID Generator** - Generate Version 1, Version 4, and Nil UUIDs in bulk
- **Base64 Tool** - Encode and decode Base64 data with file support
- **URL Tool** - Encode and decode URLs with component breakdown
- **Hash Generator** - Generate MD5, SHA-1, SHA-256, and other hash types
- **Snippet Manager** - Save, organize, and share code snippets with cloud sync

### ✨ Key Features

- 🌙 **Dark/Light Mode** - Toggle between themes with persistence
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- ☁️ **Cloud Sync** - Save snippets to the cloud with Supabase integration
- 🔗 **Share Snippets** - Generate public links for collaboration
- 💾 **Local Storage** - Works offline with local snippet storage
- 🎨 **Modern UI** - Built with Flowbite design system and Tailwind CSS

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Flowbite design system
- **UI Components**: Radix UI primitives, shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **Icons**: Lucide React
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (optional, for cloud features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/devtoolbox.git
cd devtoolbox
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables (optional, for Supabase features):
```bash
cp .env.example .env.local
```

4. Add your Supabase credentials to `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Start the development server:
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Netlify

1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure environment variables
4. Set up continuous deployment

### Other Platforms

The app is a static SPA and can be deployed to any static hosting service like:
- GitHub Pages
- Firebase Hosting
- AWS S3 + CloudFront
- DigitalOcean App Platform

## Environment Variables

```env
# Supabase Configuration (Optional)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
devtoolbox/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── JsonFormatter.tsx
│   │   ├── RegexTester.tsx
│   │   └── ...
│   ├── services/           # API services
│   ├── utils/              # Utility functions
│   ├── styles/             # Global styles
│   └── App.tsx             # Main app component
├── public/                 # Static assets
├── supabase/              # Supabase configuration
└── ...
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Alex Martinez**
- Website: [antid.co](https://antid.co)
- GitHub: [@yourusername](https://github.com/yourusername)

## Acknowledgments

- [Radix UI](https://radix-ui.com) for accessible component primitives
- [Tailwind CSS](https://tailwindcss.com) for utility-first styling
- [Lucide](https://lucide.dev) for beautiful icons
- [Supabase](https://supabase.com) for backend services
- [Flowbite](https://flowbite.com) for design inspiration

---

Made with ❤️ by Alex Martinez
<div align="center">
<img width="1200" height="475" alt="Arunika Monitoring" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Arunika Monitoring Dashboard

A comprehensive monitoring and management dashboard built with React, TypeScript, and Vite. Deploy easily to Cloudflare Pages.

## Features
- User Management
- Project Management
- Real-time Dashboard
- Google Gemini AI Integration
- Responsive Design with Tailwind CSS

## Run Locally

**Prerequisites:** Node.js 18+

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd arunika-monitoring
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file (copy from `.env.example`):
   ```bash
   cp .env.example .env.local
   ```

4. Set your API keys in `.env.local`:
   ```
   VITE_API_KEY=your_google_api_key_here
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## Build for Production

```bash
npm run build
```

This creates a `dist` folder ready for deployment.

## Deploy to Cloudflare Pages

### Prerequisites
- Cloudflare account
- GitHub repository connected to Cloudflare

### Configuration in Cloudflare Pages Dashboard

1. **Build Command**: `npm install && npm run build`
2. **Build Output Directory**: `dist`
3. **Root Directory**: `/`
4. **Node.js Version**: 18 (set in `.nvmrc`)

### Environment Variables
Add in Cloudflare Pages Dashboard under "Settings" > "Environment variables":
- `VITE_API_KEY`: Your Google API key

### Steps
1. Connect your GitHub repository to Cloudflare Pages
2. Choose the branch to deploy (usually `main`)
3. Use the build configuration above
4. Click "Save and Deploy"

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── components/      # React components
├── services/        # API services
├── App.tsx         # Main app component
├── main.tsx        # Entry point
└── types.ts        # TypeScript types

public/            # Static assets
dist/              # Production build (gitignored)
```

## Troubleshooting

### Page shows blank after deployment
- Ensure `_redirects` file is in the root (handles SPA routing)
- Check that `dist` folder is created and not gitignored
- Verify build output shows no errors

### Styling not loading
- Tailwind CSS is loaded via CDN in `index.html`
- Check browser console for any CSP errors

### API calls failing
- Verify environment variables are set in Cloudflare Pages
- Check CORS settings if calling external APIs

## License
MIT

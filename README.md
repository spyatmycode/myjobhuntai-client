# MyJobHuntAI Frontend

A modern, production-ready React frontend for the MyJobHuntAI API - your AI-powered job search assistant.

## Features

- **Dashboard**: Track all your job applications in one place
- **Resume Hub**: Upload resumes and get AI-generated summaries
- **AI Cover Letters**: Generate tailored cover letters for each application
- **Modern UI**: Dark mode SaaS aesthetic with smooth animations

## Tech Stack

- **React 18** with Vite for fast development
- **TailwindCSS** for styling
- **React Router DOM** for client-side routing
- **Axios** for API communication
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MyJobHuntAI API running (default: http://localhost:8080)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8080
```

For production, update this to your deployed API URL:

```env
VITE_API_URL=https://your-api.onrender.com
```

## Project Structure

```
src/
├── api/
│   ├── axios.js          # Axios instance with interceptors
│   └── services.js       # API service functions
├── components/
│   ├── AddApplicationModal.jsx
│   ├── Layout.jsx
│   ├── ProtectedRoute.jsx
│   ├── Sidebar.jsx
│   └── UploadResumeModal.jsx
├── context/
│   └── AuthContext.jsx   # Authentication state management
├── pages/
│   ├── Applications.jsx  # All applications with cover letter generation
│   ├── Dashboard.jsx     # Main dashboard with stats
│   ├── Login.jsx
│   ├── ResumeHub.jsx     # Resume management
│   ├── Settings.jsx
│   └── Signup.jsx
├── App.jsx               # Main app with routing
├── index.css            # Global styles
└── main.jsx             # Entry point
```

## API Integration

### Response Wrapper
All API responses follow this format:
```json
{
  "success": true,
  "data": {...},
  "token": "...",
  "message": "..."
}
```

The axios interceptor automatically:
- Adds `Authorization: Bearer <token>` to requests
- Validates `response.data.success === true`
- Handles 401 errors by redirecting to login

### Resume Upload
Resume upload uses `multipart/form-data` with `title` and `optionalUserPrompt` as query parameters.

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Deployment

Build the app and deploy the `dist` folder to any static hosting:

```bash
npm run build
```

Recommended platforms:
- Vercel
- Netlify
- Render Static Sites
- AWS S3 + CloudFront

## License

MIT

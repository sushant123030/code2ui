# UInspire

A full-stack web application for generating UI components using AI.

## Features

- User authentication (Google, Apple OAuth)
- AI-powered UI generation using Gemini
- Code editor with Monaco Editor
- Project history and management
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js, MongoDB
- **AI**: Google Gemini API
- **Authentication**: Passport.js (Google, Apple)
- **File Upload**: Cloudinary

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your environment variables
3. Install dependencies:
   ```bash
   npm run install:all
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

## Environment Variables

See `.env.example` for all required environment variables.

## Build

```bash
npm run build
```

## Deployment

### Option 1: Separate Deployment (Recommended)

- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Heroku/Railway/Render

### Option 2: Single Deployment

For platforms that support Node.js, you can deploy the entire app. The backend will serve the API, and you'll need to configure the frontend to be served statically or use a reverse proxy.

## Scripts

- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Lint frontend code
- `npm run audit:fix` - Fix security vulnerabilities

## API Endpoints

- `GET /` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /user/profile` - Get user profile
- `POST /project/generate-and-save` - Generate and save UI
- `GET /project/getbyid/:id` - Get project by ID

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and lint
5. Submit a pull request

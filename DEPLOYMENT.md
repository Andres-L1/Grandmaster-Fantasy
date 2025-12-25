# Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

## Setup

1. Go to your GitHub repository settings
2. Navigate to **Pages** (under "Code and automation")
3. Under **Build and deployment**, select:
   - **Source**: GitHub Actions

The site will automatically deploy whenever you push to the `main` branch.

## GitHub Pages URL

Your site will be available at:
```
https://andres-l1.github.io/Grandmaster-Fantasy/
```

## Local Development

To test the production build locally:

```bash
npm run build
npm run preview
```

## Important Notes

⚠️ **Database Features**: The GitHub Pages deployment is a static site, so the following features that require a backend database will not work:
- Market page (player listings)
- My Team page (team management)  
- Leagues page (leaderboards)
- Lichess integration and cron jobs

This deployment showcases the **frontend UI only**. For full functionality with database and backend services, you need to deploy to a platform like:
- Vercel
- Netlify
- Railway
- Render
- Your own VPS with PostgreSQL

## Full Stack Deployment

For a complete deployment with database, see the main README.md for instructions on:
- Setting up PostgreSQL
- Configuring environment variables
- Running migrations and seed data

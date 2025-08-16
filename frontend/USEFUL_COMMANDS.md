# Useful commands for this project (Windows PowerShell)

# Environment checks
# Show node and npm versions
node -v ; npm -v

# Install dependencies
# Use npm ci in CI for a clean install, or npm install locally
npm ci
npm install

# Start development server (Vite)
npm run dev

# If the dev port is busy, kill it then restart (kills port 5173)
# Requires npx (shipped with npm)
npx kill-port 5173 ; npm run dev

# Alternative: set PORT in PowerShell for current session then start
$env:PORT=5173 ; npm run dev

# Build and preview production bundle
npm run build
npm run preview

# Linting (project uses ESLint)
# Run lint (user used --silent earlier)
npm run lint --silent

# Auto-fix lintable issues (ESLint fix)
npx eslint "src/**" --fix

# Re-run lint after fixes
npm run lint --silent

# Formatting (Prettier - if present in project)
# Adjust glob/extensions to project files
npx prettier --write "src/**/*.{js,jsx,css,md,json}"

# Run dependency checks
npm outdated

# Git common commands
git status
git add .
git commit -m "describe changes"
git push

# Inspect a listening port and kill the process manually
# Find PID using netstat then taskkill
netstat -ano | findstr :5173
# Suppose PID is 12345
taskkill /PID 12345 /F

# Debugging API calls from PowerShell
# Example: send JSON to backend (use Invoke-RestMethod in PowerShell)
Invoke-RestMethod -Uri 'http://localhost:3000/api/user/profilepic' -Method Post -Body '{"photo":"base64..."}' -ContentType 'application/json'

# Or using curl (may map to Invoke-WebRequest in PS, but works for many cases)
curl -X POST "http://localhost:3000/api/user/profilepic" -H "Content-Type: application/json" -d '{"photo":"base64..."}'

# Reproduce and capture failing upload-after-delete (manual steps)
# 1. Open browser DevTools (F12) > Network tab
# 2. Click Delete Avatar in profile page
# 3. Upload new avatar and observe the POST request to /api/user/profilepic
# 4. Copy/paste request payload, response status and response body here for diagnosis

# Quick ESLint auto-fix + format workflow
npx eslint "src/**" --fix ; npx prettier --write "src/**/*.{js,jsx,css,md,json}" ; npm run lint --silent

# If you need to run the backend locally, replace the URL/port above with your backend's (example: http://localhost:3000)

# Notes / Tips
# - Use npm ci for CI builds and npm install for local development.
# - Use the profile page's on-page API debug (if present) or browser network tab to capture server responses.
# - For PowerShell environment variable persistence across sessions, set via System Properties or use $env:VAR in each session.

# End of file

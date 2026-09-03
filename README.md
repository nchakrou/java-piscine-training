# JavaForge - Java Coding Challenge Platform

A platform for mastering Java through real coding challenges with automated testing.

## Quick Start

```bash
# Clone the repo
git clone <your-repo-url>
cd java-piscine-training

# Install dependencies (auto-builds frontend for production)
npm install

# Start production server
npm run start
# Opens at http://localhost:3001
```

## Development Mode (Hot Reload)

```bash
npm run dev
# Backend API:  http://localhost:3001
# Frontend UI:  http://localhost:5173
```

## Alternative: Using the starter script

```bash
chmod +x run.sh
./run.sh          # Production mode
./run.sh dev      # Development mode
```

## Requirements

- Node.js 18+
- Java JDK (for test execution)

## Project Structure

- `src/` - React frontend (Vite + TypeScript)
- `server/` - Express backend with Java test runner
- `data/` - Challenge definitions & user progress
- `tests/` - Java test cases for challenges
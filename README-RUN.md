# How to Run This Application

## The Problem
This project is located in a very long directory path (191 characters), which exceeds Windows' 260-character path limit. When Next.js tries to build, it creates files that exceed this limit, causing errors.

## The Solution
The project files have been copied to **`C:\dev\dashboard`** (only 17 characters), which allows the application to run without path issues.

## Quick Start

### Option 1: Use the Launcher Script (Easiest)
Simply run this command from the current directory:

```powershell
powershell -ExecutionPolicy Bypass -File .\run-app.ps1
```

This script will automatically:
- Navigate to `C:\dev\dashboard`
- Install dependencies if needed
- Start the dev server

### Option 2: Manual Steps
1. Open a terminal
2. Navigate to the short path: `cd C:\dev\dashboard`
3. Install dependencies (first time only): `npm install`
4. Run the dev server: `npm run dev`

### Option 3: Open in VS Code
1. Open `C:\dev\dashboard` in VS Code
2. Open a terminal in VS Code
3. Run: `npm run dev`

## Accessing the Application
Once running, open your browser to:
- http://localhost:3000

## Important Notes
- **Always run the app from `C:\dev\dashboard`**, not from this current long path
- The files in both locations are identical, but only the short path will work
- If you make changes, make them in `C:\dev\dashboard`
- You can safely delete this current directory once you've confirmed the app works from the new location

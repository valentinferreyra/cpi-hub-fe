# CPI Hub Frontend

This is a React + TypeScript + Vite project.

## Prerequisites

Before running this project, make sure you have the following installed on your system:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js) or **yarn**

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cpi-hub-fe
```

2. Install dependencies:
```bash
npm install
```

## Running the Project

### Development Mode

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is busy).

### Production Build

To create a production build:

```bash
npm run build
```

The built files will be created in the `dist` folder.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── components/     # React components
├── services/       # API and service functions
├── assets/         # Static assets
├── App.tsx         # Main application component
└── main.tsx        # Application entry point
```

## Stopping the Server

To stop the development server, press `Ctrl + C` in the terminal where it's running.

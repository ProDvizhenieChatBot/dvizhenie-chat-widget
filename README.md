# Dvizhenie Chat Widget

Embeddable React + TypeScript chat widget built with Vite (library mode).

## Tech Stack

- **Build Tool**: [Vite](https://vitejs.dev/) - Fast build tool and dev server
- **Framework**: [React](https://react.dev/) - JavaScript library for building user interfaces
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Linting**: [ESLint](https://eslint.org/) - Code linting
- **Formatting**: [Prettier](https://prettier.io/) - Code formatting
- **Testing**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) - Testing framework
- **Git Hooks**: [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/okonet/lint-staged) - Pre-commit hooks
- **Commit Standards**: [Commitlint](https://commitlint.js.org/) - Commit message linting
- **CI/CD**: [GitHub Actions](https://github.com/features/actions) - Automated testing and deployment
- **Release Management**: [Semantic Release](https://semantic-release.gitbook.io/) - Automated versioning and releases

## Prerequisites

- Node.js 20.9.0+
- npm 10.1.0+

## Usage

### On a website (CDN script)

```html
<script src="https://cdn.jsdelivr.net/npm/@dvizhenie/chat-widget/dist/dvizhenie-chat-widget.iife.js"></script>
<script>
  // Widget functionality will be available via window.DvizhenieChat
  // Implementation details coming soon
</script>
```

### Via npm

```ts
import { DvizhenieChat } from '@dvizhenie/chat-widget'

// Widget functionality coming soon
```

## Development

### Install Dependencies

```bash
npm ci
```

### Start Development Server

```bash
npm run dev
```

The development server will be available at `http://localhost:5173`

## Production

### Build and Start Production Server

```bash
npm ci
npm run build
npm run start
```

The production build will be available at `http://localhost:4173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run build:types` - Generate TypeScript declarations
- `npm run lint` / `npm run lint:fix` - ESLint
- `npm run format` / `npm run format:check` - Prettier
- `npm run test` / `npm run test:watch` / `npm run test:coverage` - Testing (Vitest)
- `npm run preview` - Preview production build (requires build first)

## Commit Standards

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Examples:

- `feat: add user authentication`
- `fix: resolve navigation issue`
- `docs: update README`

## CI/CD

GitHub Actions automatically runs on every pull request:

- Linting (ESLint, Prettier)
- Type checking
- Testing (when test files are present)
- Build verification

## Deployment

The widget is published to npm and can be used via CDN or installed as a dependency.

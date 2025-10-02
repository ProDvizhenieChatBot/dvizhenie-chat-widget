# Dvizhenie Chat Widget

Embeddable React + TypeScript chat widget built with Vite (library mode).

## Tech Stack

- **Build Tool**: [Vite](https://vitejs.dev/) - Fast build tool and dev server
- **Framework**: [React 19](https://react.dev/) - JavaScript library for building user interfaces
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: CSS Modules + [Stylelint](https://stylelint.io/) - Scoped styles with linting
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

The widget is embedded **only via script inclusion**. It automatically detects the platform (website or Telegram WebApp) and adapts accordingly.

### On a Website

```html
<!-- Include React (if not already included) -->
<script crossorigin src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>

<!-- Include the widget -->
<script src="https://your-cdn.com/dvizhenie-chat-widget-init.iife.js"></script>

<script>
  // Initialize the widget - no configuration needed!
  const widget = initDvizhenieWidget()

  // Optional: custom configuration
  // const widget = initDvizhenieWidget({
  //   customConfig: { maxWidth: 450, maxHeight: 650 }
  // });
</script>
```

### In Telegram WebApp

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Chat Widget</title>
  </head>
  <body>
    <!-- Telegram WebApp API -->
    <script src="https://telegram.org/js/telegram-web-app.js"></script>

    <!-- React -->
    <script crossorigin src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
    <script
      crossorigin
      src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"
    ></script>

    <!-- Widget -->
    <script src="https://your-cdn.com/dvizhenie-chat-widget-init.iife.js"></script>

    <script>
      // Widget automatically detects Telegram WebApp and opens fullscreen
      // All data handling is done internally!
      const widget = initDvizhenieWidget()
    </script>
  </body>
</html>
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

- **🌐 Website mode** - `http://localhost:5173`
- **📲 Telegram WebApp mode** - `http://localhost:5173?mode=telegram`

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
- `npm run build` - Build for production (creates both main and init bundles)
- `npm run build:lib` - Build main library bundle
- `npm run build:init` - Build initialization bundle for script integration
- `npm run start` - Start production server
- `npm run build:types` - Generate TypeScript declarations
- `npm run lint` / `npm run lint:fix` - ESLint code linting
- `npm run lint:css` / `npm run lint:css:fix` - Stylelint CSS linting
- `npm run format` / `npm run format:check` - Prettier formatting
- `npm run test` / `npm run test:watch` / `npm run test:coverage` - Testing (Vitest)
- `npm run preview` - Preview production build (requires build first)

## Commit Standards

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Examples:

- `feat: add user authentication`
- `fix: resolve navigation issue`
- `docs: update README`

## CI/CD

GitHub Actions automatically runs on every pull request:

- Linting (ESLint, Stylelint, Prettier)
- Type checking
- Testing (when test files are present)
- Build verification

## Build & Deployment

### Building the Project

```bash
# Install dependencies
npm ci

# Build for production
npm run build
```

After building, the following files will be created in the `dist/` folder:

- `dvizhenie-chat-widget-init.iife.js` - **main file for embedding**
- `dvizhenie-chat-widget-init.iife.js.map` - source map
- `dvizhenie-chat-widget.es.js` - ES modules (for developers)
- `dvizhenie-chat-widget.umd.js` - UMD format (for developers)
- `chat-widget.css` - widget styles

### Deployment

1. **Upload files to CDN or static hosting:**

   ```
   your-cdn.com/
   ├── dvizhenie-chat-widget-init.iife.js
   ├── dvizhenie-chat-widget-init.iife.js.map
   └── chat-widget.css
   ```

2. **Popular hosting options:**
   - **GitHub Pages** - free for public repositories
   - **Netlify** - free plan with CDN
   - **Vercel** - free plan with auto-deploy
   - **AWS CloudFront** - professional CDN
   - **jsDelivr** - free CDN for npm packages

3. **CORS setup (if needed):**
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET, OPTIONS
   ```

### Integration

After deployment, replace `https://your-cdn.com/` with your actual CDN URL in the examples above.

**For websites:**

```html
<script src="https://your-actual-cdn.com/dvizhenie-chat-widget-init.iife.js"></script>
```

**For Telegram WebApp:**
Create an HTML file with the code from the example above and host it, then specify the URL in your bot settings.

### Widget Configuration

```javascript
const widget = initDvizhenieWidget({
  // Element ID for mounting (optional)
  containerId: 'my-widget-container',

  // CSS class for container
  className: 'my-custom-widget'
});

// Widget control methods
widget.destroy();           // Remove widget
widget.updateConfig({...}); // Update configuration
```

**Note:** All form submission and data handling is done internally by the widget. No external configuration needed!

### Responsive Design

The widget automatically adapts to the platform:

- **Website**: Button in bottom-right corner, opens chat window
- **Telegram WebApp**: Fullscreen mode without button, no rounded corners

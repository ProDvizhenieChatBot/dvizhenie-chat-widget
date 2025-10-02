# Dvizhenie Chat Widget

Embeddable React + TypeScript chat widget built with Vite (library mode). Interactive chat form with scenario-based flow for collecting user information.

## Tech Stack

- **Build Tool**: [Vite](https://vitejs.dev/) - Fast build tool and dev server
- **Framework**: [React 19](https://react.dev/) - JavaScript library for building user interfaces
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: CSS Modules - Scoped styles
- **Linting**: [ESLint](https://eslint.org/) - Code linting
- **Testing**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) - Testing framework
- **Icons**: [Lucide React](https://lucide.dev/) - Icon library
- **Utilities**: [clsx](https://github.com/lukeed/clsx) - Conditional className utility
- **Date Handling**: [date-fns](https://date-fns.org/) - Date utility library
- **Styling**: CSS Modules + [Stylelint](https://stylelint.io/) - Scoped styles with linting
- **Formatting**: [Prettier](https://prettier.io/) - Code formatting
- **Git Hooks**: [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/okonet/lint-staged) - Pre-commit hooks
- **Commit Standards**: [Commitlint](https://commitlint.js.org/) - Commit message linting
- **CI/CD**: [GitHub Actions](https://github.com/features/actions) - Automated testing and deployment
- **Release Management**: [Semantic Release](https://semantic-release.gitbook.io/) - Automated versioning and releases

## Prerequisites

- Node.js 20.9.0+
- npm 10.1.0+

## 🚀 Live Demo

**Try the widget in action:** [https://prodvizheniechatbot.github.io/dvizhenie-chat-widget/](https://prodvizheniechatbot.github.io/dvizhenie-chat-widget/)

- 🌐 **Website mode** - standard mode with chat button
- 📱 **Telegram WebApp mode** - fullscreen mode for Telegram
- 🎮 **Interactive controls** - test the widget functionality
- 📚 **Code examples** - ready-to-use integration examples

The demo is automatically deployed from the `main` and `dev` branches using GitHub Pages.

## Features

- **Interactive Chat Form**: Scenario-based conversation flow for collecting user information
- **Platform Detection**: Automatically adapts to website or Telegram WebApp environment
- **Form Validation**: Built-in validation for email, phone, date, and text inputs
- **File Upload Support**: Handle file attachments with progress tracking
- **Responsive Design**: Optimized for both desktop and mobile devices
- **TypeScript Support**: Full type safety and IntelliSense support
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Accessibility**: WCAG compliant with keyboard navigation support
- **Internationalization**: Ready for multi-language support
- **Performance**: Optimized bundle size and lazy loading

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
  const widget = initDvizhenieWidget({
    containerId: 'my-widget-container', // Optional: specific container ID
    className: 'my-custom-widget'       // Optional: custom CSS class
  });
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

### Development Mode Features

- **Hot Module Replacement**: Instant updates during development
- **TypeScript Support**: Full type checking and IntelliSense
- **Source Maps**: Easy debugging with original source code
- **Platform Emulation**: Test both website and Telegram WebApp modes

### Local Demo

Run the demo page locally:

```bash
# Development mode with HMR
npm run dev

# Production build and preview
npm run start

# Build demo for GitHub Pages
npm run build:demo
```

- **Development mode**: `http://localhost:5173` (with HMR)
- **Production mode**: `http://localhost:4173`
- **Telegram WebApp mode**: `http://localhost:5173?mode=telegram`

### Development Configuration

You can customize the development experience by modifying `vite.config.ts`:

```typescript
export default defineConfig(() => {
  const isInitBuild = process.env.BUILD_INIT === 'true'

  return {
    plugins: [react()],
    build: {
      lib: {
        entry: isInitBuild ? 'src/init.ts' : 'src/index.ts',
        name: 'DvizhenieChat',
        fileName: (format) => {
          const prefix = isInitBuild ? 'dvizhenie-chat-widget-init' : 'dvizhenie-chat-widget'
          return `${prefix}.${format}.js`
        },
        formats: ['es', 'umd', 'iife'],
      },
      // ... rest of config
    },
  }
})
```

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
- `npm run start` - Build and start production server
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

## Project Structure

```
src/
├── components/          # React components
│   ├── Widget/         # Main widget component
│   ├── WidgetButton/   # Chat button
│   ├── WidgetWindow/   # Chat window
│   ├── WidgetHeader/   # Chat header
│   ├── WidgetInput/    # Input component
│   ├── MessagesList/   # Messages container
│   ├── Message/        # Individual message
│   ├── FileMessage/    # File message component
│   ├── FileDropdown/   # File upload dropdown
│   └── Button/         # Reusable button
├── hooks/              # Custom React hooks
│   └── useScenario.ts  # Chat scenario logic
├── types/              # TypeScript type definitions
│   └── chat.ts         # Chat-related types
├── utils/              # Utility functions
│   ├── platform.ts     # Platform detection
│   ├── validation.ts   # Form validation
│   ├── errorHandling.ts # Error handling
│   └── scenario.json   # Chat scenario configuration
├── theme/              # Theme and styling
│   └── colors.css      # Color variables
├── index.ts            # Main library exports
├── init.ts             # Widget initialization
└── main.tsx            # Development entry point
```

## Build & Deployment

### Building the Project

```bash
# Install dependencies
npm ci

# Build for production
npm run build
```

After building, the following files will be created in the `dist/` folder:

- `dvizhenie-chat-widget-init.iife.js` - **main file for embedding** (IIFE format)
- `dvizhenie-chat-widget-init.iife.js.map` - source map for IIFE
- `dvizhenie-chat-widget-init.es.js` - ES modules version
- `dvizhenie-chat-widget-init.es.js.map` - source map for ES modules
- `dvizhenie-chat-widget-init.umd.js` - UMD format
- `dvizhenie-chat-widget-init.umd.js.map` - source map for UMD
- `chat-widget.css` - widget styles
- `bot_icon.svg` - bot icon
- `prodvizhenie_icon.svg` - organization icon

### Deployment

1. **Upload files to CDN or static hosting:**

   ```
   your-cdn.com/
   ├── dvizhenie-chat-widget-init.iife.js
   ├── dvizhenie-chat-widget-init.iife.js.map
   └── chat-widget.css
   ```

2. **Popular hosting options:**
   - **GitHub Pages** - free for public repositories (автоматический деплой настроен)
   - **Netlify** - free plan with CDN
   - **Vercel** - free plan with auto-deploy
   - **AWS CloudFront** - professional CDN
   - **jsDelivr** - free CDN for npm packages

3. **GitHub Pages (recommended):**
   - Demo automatically deploys on push to `main` or `dev` branches
   - URL: `https://prodvizheniechatbot.github.io/dvizhenie-chat-widget/`
   - Uses built files from `dist/` folder
   - Configured in `.github/workflows/deploy.yml`
   - No additional setup required - just push your code!

4. **CORS setup (if needed):**
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET, OPTIONS
   ```

### GitHub Pages Setup

To enable automatic deployment to GitHub Pages:

1. Go to repository **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Push to `main` or `dev` branch - demo will deploy automatically
4. Demo will be available at: `https://prodvizheniechatbot.github.io/dvizhenie-chat-widget/`

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

### Chat Scenario

The widget uses a JSON-based scenario system (`src/utils/scenario.json`) to define the conversation flow. The scenario includes:

- **Step Types**: `message`, `buttons`, `input`, `date`, `phone`, `email`, `link`
- **Conditional Logic**: Steps can be shown/hidden based on previous answers
- **Validation**: Built-in validation for different input types
- **Navigation**: Support for going back and restarting the conversation

### Form Validation

The widget includes comprehensive validation for:

- **Email**: Standard email format validation
- **Phone**: Russian and international phone number formats
- **Date**: DD.MM.YYYY format with date existence checks
- **URL**: Link validation with automatic protocol addition
- **Text**: Length and content validation
- **Full Name**: Multi-word name validation

**Note:** All form submission and data handling is done internally by the widget. No external configuration needed!

### Advanced Configuration

#### Custom Styling

You can customize the widget appearance by overriding CSS variables:

```css
:root {
  --widget-primary-color: #007bff;
  --widget-background: #ffffff;
  --widget-text-color: #333333;
  --widget-border-radius: 8px;
  --widget-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

#### Event Handling

The widget provides events for integration:

```javascript
const widget = initDvizhenieWidget({
  onStepChange: (stepId, stepData) => {
    console.log('Step changed:', stepId, stepData);
  },
  onFormSubmit: (formData) => {
    console.log('Form submitted:', formData);
    // Handle form submission
  },
  onError: (error) => {
    console.error('Widget error:', error);
    // Handle errors
  }
});
```

#### Custom Validation

You can extend validation rules:

```javascript
import { validateEmail, validatePhone } from '@dvizhenie/chat-widget';

// Custom validation function
const customValidator = (value) => {
  // Your validation logic
  return { isValid: true };
};
```

### API Reference

#### Exported Components

```typescript
// Main widget component
export { default as ChatWidget } from './components/Widget'
export type { ChatWidgetProps } from './components/Widget'

// Individual components
export { default as FileDropdown } from './components/FileDropdown'
export { default as FileMessage } from './components/FileMessage'

// Widget initialization
export { DvizhenieWidget, initDvizhenieWidget } from './init'
export type { DvizhenieWidgetConfig } from './init'

// Hooks
export { useScenario } from './hooks/useScenario'

// Utilities
export { isTelegramWebApp, getTelegramWebApp, isMobile, getViewportSize, getPlatformConfig } from './utils/platform'
export { validateEmail, validatePhone, validateDate, validateUrl, validateText, validateFullName } from './utils/validation'
export { safeAsync, safeSync, createRetryFunction, defaultErrorHandler, telegramErrorHandler } from './utils/errorHandling'

// Types
export type { FormData, ChatStep, ChatState, ChatFile } from './types/chat'
export type { ScenarioStep, ScenarioData, UserAnswers } from './hooks/useScenario'
export type { TelegramWebApp, PlatformConfig } from './utils/platform'
export type { ValidationResult } from './utils/validation'
export type { ErrorInfo, ErrorHandler } from './utils/errorHandling'
```

### Responsive Design

The widget automatically adapts to the platform:

- **Website**: Button in bottom-right corner, opens chat window
- **Telegram WebApp**: Fullscreen mode without button, no rounded corners

## Examples

### Basic Integration

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <h1>Welcome to our site</h1>
    
    <!-- Widget will appear here -->
    <script crossorigin src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
    <script src="https://your-cdn.com/dvizhenie-chat-widget-init.iife.js"></script>
    <script>
        initDvizhenieWidget();
    </script>
</body>
</html>
```

### Advanced Integration with Custom Container

```html
<div id="custom-chat-widget"></div>

<script>
const widget = initDvizhenieWidget({
    containerId: 'custom-chat-widget',
    className: 'my-custom-widget'
});

// Listen for events
widget.on('stepChange', (stepId) => {
    console.log('User is on step:', stepId);
});

widget.on('formSubmit', (data) => {
    // Send data to your backend
    fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
});
</script>
```

### Best Practices

1. **Load React externally** - Reduces bundle size
2. **Use CDN** - Improves loading performance
3. **Handle errors gracefully** - Implement error boundaries
4. **Test on mobile** - Ensure responsive design works
5. **Monitor performance** - Use browser dev tools

## Testing

The project uses Vitest for testing with React Testing Library for component testing.

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Run linting: `npm run lint`
6. Commit your changes: `git commit -m 'feat: add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## Troubleshooting

### Common Issues

**Widget not appearing:**
- Check if React and ReactDOM are loaded before the widget script
- Verify the CDN URL is correct and accessible
- Check browser console for errors

**Styling issues:**
- Ensure `chat-widget.css` is loaded
- Check for CSS conflicts with your site's styles
- Verify CSS variables are properly set

**Telegram WebApp not working:**
- Ensure Telegram WebApp API is loaded before the widget
- Check if the widget is running in Telegram environment
- Verify `mode=telegram` parameter in development

**Form validation errors:**
- Check if validation functions are properly imported
- Verify input types match expected formats
- Check console for validation error messages

### FAQ

**Q: Can I customize the chat scenario?**
A: Yes, modify `src/utils/scenario.json` to change the conversation flow.

**Q: How do I handle form submissions?**
A: The widget handles submissions internally, but you can listen for events to process data.

**Q: Is the widget accessible?**
A: Yes, it follows WCAG guidelines with keyboard navigation and screen reader support.

**Q: Can I use it without React?**
A: No, the widget requires React to be loaded externally.

**Q: How do I update the widget?**
A: Simply replace the script files on your CDN with the new versions.

## License

This project is private and proprietary.

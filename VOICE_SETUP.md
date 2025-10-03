# Voice Input Setup

## Feature Description

Voice input implemented using SaluteSpeech API from Sber. Features include:

- 🎤 Voice recording from microphone (maximum 1 minute)
- 🔄 Automatic speech recognition via SaluteSpeech API
- ✨ Animated microphone button with recording indicator
- 📝 Automatic insertion of recognized text into input field
- ⚡ Automatic message sending after recognition
- 🛡️ Error handling and loading states

## Setup

### 1. API Configuration

Voice input is activated when SaluteSpeech token is passed through widget configuration.

1. Register at [SaluteSpeech](https://developers.sber.ru/portal/products/smartspeech)
2. Get authorization token for API
3. Pass token when initializing widget:

```javascript
// Initialize widget with voice input
window.DvizhenieWidget.init({
  containerId: 'chat-widget',
  saluteSpeechToken: 'your_base64_encoded_credentials_here',
})
```

**Important:** Token must be in Base64 format from `username:password` string

**Security:** Token is passed through JavaScript, so get it from your server, don't store in client code.

### 2. Browser Support Check

Voice input works only in browsers with support for:

- `navigator.mediaDevices.getUserMedia`
- `MediaRecorder API`

Supported browsers:

- ✅ Chrome 47+
- ✅ Firefox 29+
- ✅ Safari 14+
- ✅ Edge 79+

### 3. HTTPS Requirement

HTTPS connection is required for microphone access (except localhost).

## Usage

### Basic Usage

Widget automatically includes voice input when token is provided:

```javascript
// Initialize without voice input
window.DvizhenieWidget.init({
  containerId: 'chat-widget',
})

// Initialize with voice input
window.DvizhenieWidget.init({
  containerId: 'chat-widget',
  saluteSpeechToken: 'your_token_here',
})
```

### Custom Usage

Components can be used separately:

```tsx
import { useVoiceInput } from './hooks/useVoiceInput'
import VoiceButton from './components/VoiceButton'

function MyComponent() {
  const voiceInput = useVoiceInput({
    onTextRecognized: (text) => {
      console.log('Recognized text:', text)
    },
    onError: (error) => {
      console.error('Error:', error)
    },
    saluteSpeechToken: 'your_token_here',
  })

  return (
    <VoiceButton
      isRecording={voiceInput.state.isRecording}
      isProcessing={voiceInput.state.isProcessing}
      duration={voiceInput.state.duration}
      error={voiceInput.state.error}
      onStartRecording={voiceInput.startRecording}
      onStopRecording={voiceInput.stopRecording}
      onCancelRecording={voiceInput.cancelRecording}
    />
  )
}
```

## API Reference

### Widget Configuration

```typescript
interface DvizhenieWidgetConfig {
  containerId?: string
  className?: string
  saluteSpeechToken?: string // Base64 encoded credentials
}
```

### useVoiceInput Hook

```typescript
interface UseVoiceInputOptions {
  maxDuration?: number // Maximum recording duration (ms)
  onTextRecognized?: (text: string) => void
  onError?: (error: string) => void
  saluteSpeechToken?: string // Base64 encoded credentials
}

interface VoiceInputState {
  isRecording: boolean
  isProcessing: boolean
  duration: number
  error: string | null
  recognizedText: string
}
```

### VoiceButton Component

```typescript
interface VoiceButtonProps {
  isRecording: boolean
  isProcessing: boolean
  duration: number
  error: string | null
  onStartRecording: () => void
  onStopRecording: () => void
  onCancelRecording: () => void
  disabled?: boolean
  className?: string
}
```

## Error Handling

The system handles the following types of errors:

1. **Missing microphone permission**
   - Automatic permission request
   - Clear error message

2. **SaluteSpeech API errors**
   - Authorization problems
   - Recognition errors
   - Network errors

3. **Technical errors**
   - Browser lack of support
   - Audio recording errors

## Security

- API token passed through configuration (not environment variables)
- Audio data not saved locally
- HTTPS used for all API requests
- Token should be obtained from your server

## Performance

- Recording limited to 1 minute
- Automatic resource cleanup
- Optimized audio data transmission

## Operating Modes

### Without Token

- 🚫 Microphone button **hidden**
- 💬 Regular text input only
- ⚡ Quick start without API setup

### With Token

- ✅ Microphone button **visible**
- 🎤 Full voice input functionality
- 🔐 Requires SaluteSpeech token

## Troubleshooting

### Recording doesn't work

1. Check browser microphone permissions
2. Make sure the site works over HTTPS
3. Check browser support for MediaRecorder API

### Recognition errors

1. Check token correctness in configuration
2. Ensure internet connection
3. Check recording quality (speak more clearly)

### CORS issues

1. Set up proxy server to bypass CORS
2. Use server-side authorization instead of client-side
3. Make sure SaluteSpeech API supports your domain

### Performance issues

1. Check internet speed
2. Make sure API limit is not exceeded
3. Check browser console for errors

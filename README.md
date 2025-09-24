## Dvizhenie Chat Widget

Embeddable React + TypeScript chat widget built with Vite (library mode).

### Usage on a website (CDN script)

```html
<script src="https://cdn.jsdelivr.net/npm/@dvizhenie/chat-widget/dist/dvizhenie-chat-widget.iife.js"></script>
<script>
  window.DvizhenieChat.init({ title: 'Support', greeting: 'Hi!' })
  // or mount into a specific container
  // window.DvizhenieChat.mount({ container: '#chat', title: 'Support' })
  // window.DvizhenieChat.unmount()
</script>
```

### Usage via npm

```ts
import { init, mount, unmount } from '@dvizhenie/chat-widget'

init({ title: 'Support' })
```

### Development

```bash
npm run dev
npm run build
```

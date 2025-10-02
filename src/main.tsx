import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'

import ChatWidget from './components/Widget'
import { isTelegramWebApp } from './utils/platform'

import './index.css'
import './theme/colors.css'

// Демо-приложение для разработки
const DemoApp: React.FC = () => {
  const [mode, setMode] = useState<'website' | 'telegram'>(() => {
    // Автоматически определяем режим
    if (isTelegramWebApp()) return 'telegram'

    // Проверяем URL параметры
    const params = new URLSearchParams(window.location.search)
    const modeParam = params.get('mode')
    if (modeParam === 'telegram') return 'telegram'

    return 'website'
  })

  // В режиме Telegram показываем только виджет
  if (mode === 'telegram') {
    return <ChatWidget />
  }

  // В режиме website показываем демо-страницу с виджетом
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1
          style={{
            color: '#1e293b',
            fontSize: '2.5rem',
            marginBottom: '1rem',
            textAlign: 'center',
          }}
        >
          💬 Демо чат-виджета фонда "Движение"
        </h1>

        <p
          style={{
            color: '#64748b',
            fontSize: '1.1rem',
            lineHeight: '1.6',
            textAlign: 'center',
            marginBottom: '2rem',
          }}
        >
          Это демонстрационная страница для тестирования чат-виджета. Нажмите на кнопку чата в
          правом нижнем углу, чтобы начать диалог.
        </p>

        <div
          style={{
            background: '#f8fafc',
            borderRadius: '8px',
            padding: '24px',
            marginTop: '2rem',
          }}
        >
          <h2
            style={{
              color: '#1e293b',
              fontSize: '1.5rem',
              marginBottom: '1rem',
            }}
          >
            🎮 Режимы просмотра
          </h2>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '16px',
            }}
          >
            <button
              onClick={() => setMode('website')}
              style={{
                background: mode === 'website' ? '#404fdb' : '#e2e8f0',
                color: mode === 'website' ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
              }}
            >
              🌐 Сайт
            </button>

            <a
              href="?mode=telegram"
              style={{
                background: '#e2e8f0',
                color: '#64748b',
                textDecoration: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                display: 'inline-block',
              }}
            >
              📲 Telegram WebApp
            </a>
          </div>

          <p
            style={{
              color: '#64748b',
              fontSize: '0.9rem',
              margin: 0,
            }}
          >
            • <strong>Сайт</strong> - виджет с кнопкой в углу (как на обычном сайте)
            <br />• <strong>Telegram WebApp</strong> - полноэкранный режим для Telegram
            мини-приложений
          </p>
        </div>
      </div>
      <ChatWidget />
    </div>
  )
}

const rootEl = document.getElementById('root')
if (rootEl) {
  createRoot(rootEl).render(<DemoApp />)
}

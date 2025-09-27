import ChatWidget from './components/ChatWidget'

import './App.css'

export default function App() {
  const handleMessageSend = (message: string) => {
    console.log('Отправлено сообщение:', message)
  }

  const handleFileUpload = (file: File) => {
    console.log('Загружен файл:', file.name)
  }

  return (
    <div className="app">
      <div className="demo-content">
        <h1>Демо чат-виджета фонда "Движение"</h1>
        <p>
          Это демонстрационная страница для тестирования чат-виджета. Нажмите на кнопку чата в
          правом нижнем углу, чтобы начать диалог.
        </p>

        <div className="demo-info">
          <h2>Функциональность виджета:</h2>
          <ul>
            <li>✅ Пошаговый диалог согласно ТЗ</li>
            <li>✅ Согласие на обработку персональных данных</li>
            <li>✅ Определение статуса заявителя</li>
            <li>✅ Дизайн в стиле Jivo</li>
            <li>✅ Адаптивная верстка</li>
            <li>🔄 Валидация форм (в разработке)</li>
            <li>🔄 Загрузка файлов (в разработке)</li>
            <li>🔄 Сохранение прогресса (в разработке)</li>
          </ul>
        </div>
      </div>

      <ChatWidget
        position="bottom-right"
        primaryColor="#4F46E5"
        title="Фонд «Движение»"
        subtitle="Мы здесь, чтобы помочь"
        onMessageSend={handleMessageSend}
        onFileUpload={handleFileUpload}
      />
    </div>
  )
}

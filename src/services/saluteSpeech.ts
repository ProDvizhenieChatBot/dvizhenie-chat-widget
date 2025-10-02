export interface SaluteSpeechConfig {
  authUrl: string
  recognitionUrl: string
  authToken: string
}

export interface RecognitionResult {
  text: string
  confidence?: number
}

export interface SaluteSpeechError {
  message: string
  code?: string
}

class SaluteSpeechService {
  private config: SaluteSpeechConfig
  private accessToken: string | null = null
  private tokenExpiryTime: number | null = null

  constructor(config: SaluteSpeechConfig) {
    this.config = config
  }

  /**
   * Получение токена доступа для SaluteSpeech API
   */
  private async getAccessToken(): Promise<string> {
    // Проверяем, есть ли действующий токен
    if (this.accessToken && this.tokenExpiryTime && Date.now() < this.tokenExpiryTime) {
      return this.accessToken
    }

    try {
      const response = await fetch(this.config.authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          Authorization: `Basic ${this.config.authToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Ошибка авторизации: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.access_token) {
        throw new Error('Не удалось получить токен доступа')
      }

      this.accessToken = data.access_token
      // Устанавливаем время истечения токена (обычно 1 час, оставляем запас 5 минут)
      this.tokenExpiryTime =
        Date.now() + (data.expires_in ? (data.expires_in - 300) * 1000 : 55 * 60 * 1000)

      return this.accessToken || ''
    } catch (error) {
      console.error('Ошибка при получении токена доступа:', error)
      throw new Error('Не удалось авторизоваться в SaluteSpeech API')
    }
  }

  /**
   * Распознавание речи из аудиофайла
   */
  async recognizeSpeech(audioBlob: Blob): Promise<RecognitionResult> {
    try {
      const accessToken = await this.getAccessToken()

      // Конвертируем Blob в нужный формат если необходимо
      const audioData = await this.prepareAudioData(audioBlob)

      const response = await fetch(this.config.recognitionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'audio/mpeg',
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: audioData,
      })

      if (!response.ok) {
        throw new Error(`Ошибка распознавания: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.result || !result.result.length) {
        throw new Error('Не удалось распознать речь')
      }

      // Берем первый результат с наибольшей уверенностью
      const bestResult = result.result[0]

      return {
        text: bestResult.text || '',
        confidence: bestResult.confidence,
      }
    } catch (error) {
      console.error('Ошибка при распознавании речи:', error)
      throw error instanceof Error ? error : new Error('Неизвестная ошибка при распознавании речи')
    }
  }

  /**
   * Подготовка аудиоданных для отправки
   */
  private async prepareAudioData(audioBlob: Blob): Promise<Blob> {
    // Если аудио уже в формате MP3, возвращаем как есть
    if (audioBlob.type === 'audio/mpeg' || audioBlob.type === 'audio/mp3') {
      return audioBlob
    }

    // Для других форматов можно добавить конвертацию
    // Пока возвращаем как есть, но в реальном проекте может потребоваться конвертация
    return audioBlob
  }

  /**
   * Проверка поддержки браузером записи аудио
   */
  static isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  }
}

// Функция для создания сервиса с токеном
export const createSaluteSpeechService = (authToken: string) => {
  return new SaluteSpeechService({
    authUrl: 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
    recognitionUrl: 'https://smartspeech.sber.ru/rest/v1/speech:recognize',
    authToken,
  })
}

// Экземпляр по умолчанию (для обратной совместимости)
const saluteSpeechService = new SaluteSpeechService({
  authUrl: 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
  recognitionUrl: 'https://smartspeech.sber.ru/rest/v1/speech:recognize',
  authToken: import.meta.env.VITE_SALUTE_SPEECH_TOKEN || '',
})

export default saluteSpeechService
export { SaluteSpeechService }

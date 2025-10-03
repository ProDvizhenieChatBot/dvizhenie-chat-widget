/**
 * API сервис для работы с бэкендом фонда "Движение"
 */

const API_BASE_URL = 'https://api.dvizhenie.ikemurami.com'

export interface FormField {
  field_id: string
  type:
    | 'info'
    | 'text'
    | 'textarea'
    | 'date'
    | 'phone'
    | 'email'
    | 'single_choice_buttons'
    | 'multiple_choice_checkbox'
    | 'file'
  label: string
  required?: boolean
  options?: string[]
  condition?: {
    field_id: string
    operator: 'equals' | 'not_equals' | 'in' | 'not_in'
    value: string | string[]
  }
  validation?: {
    maxDate?: string
    mask?: string
  }
  allow_multiple?: boolean
  text?: string // для типа info
}

export interface FormStep {
  step_id: string
  title: string
  fields: FormField[]
  navigation: {
    type: 'direct' | 'conditional'
    next_step_id?: string
    source_field_id?: string
    rules?: Array<{
      value: string
      next_step_id: string
    }>
    default_next_step_id?: string
  }
}

export interface FormSchema {
  name: string
  version: string
  start_step_id: string // Стартовый шаг по step_id
  steps: FormStep[]
}

export interface SessionResponse {
  application_uuid: string
  session_id: string
}

export interface ApplicationData {
  [key: string]: any
}

class ApiService {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Получить активную схему формы
   */
  async getActiveFormSchema(): Promise<FormSchema> {
    const response = await fetch(`${this.baseUrl}/api/v1/forms/schema/active`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.detail
        ? `Failed to fetch form schema: ${JSON.stringify(errorData.detail)}`
        : `Failed to fetch form schema: ${response.status}`
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Получена схема формы:', data)
    return data
  }

  /**
   * Создать новую сессию для веб-виджета
   */
  async createWebSession(): Promise<SessionResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/sessions/web`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.detail
        ? `Failed to create web session: ${JSON.stringify(errorData.detail)}`
        : `Failed to create web session: ${response.status}`
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Создана веб-сессия:', data)
    return { application_uuid: data.application_uuid, session_id: data.application_uuid }
  }

  /**
   * Создать или возобновить сессию для Telegram
   */
  async createTelegramSession(telegramId: number): Promise<SessionResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/sessions/telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ telegram_id: telegramId }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.detail
        ? `Failed to create telegram session: ${JSON.stringify(errorData.detail)}`
        : `Failed to create telegram session: ${response.status}`
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Создана/возобновлена Telegram сессия:', data)
    return { application_uuid: data.application_uuid, session_id: data.application_uuid }
  }

  /**
   * Получить статус заявки для Telegram пользователя
   */
  async getTelegramApplicationStatus(telegramId: number): Promise<{ status: string }> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/sessions/telegram/status?telegram_id=${telegramId}`,
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.detail
        ? `Failed to get telegram application status: ${JSON.stringify(errorData.detail)}`
        : `Failed to get telegram application status: ${response.status}`
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Статус заявки Telegram:', data)
    return data
  }

  /**
   * Получить статус заявки
   */
  async getApplicationStatus(applicationUuid: string): Promise<{ status: string }> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/applications/${applicationUuid}/public/status`,
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.detail
        ? `Failed to fetch application status: ${JSON.stringify(errorData.detail)}`
        : `Failed to fetch application status: ${response.status}`
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Статус заявки:', data)
    return data
  }

  /**
   * Получить данные заявки
   */
  async getApplicationData(applicationUuid: string): Promise<ApplicationData> {
    const response = await fetch(`${this.baseUrl}/api/v1/applications/${applicationUuid}/public`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.detail
        ? `Failed to fetch application data: ${JSON.stringify(errorData.detail)}`
        : `Failed to fetch application data: ${response.status}`
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Получены данные заявки:', data)
    return data
  }

  /**
   * Сохранить прогресс заявки
   */
  async saveApplicationProgress(applicationUuid: string, data: ApplicationData): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/applications/${applicationUuid}/public`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.detail
        ? `Failed to save application progress: ${JSON.stringify(errorData.detail)}`
        : `Failed to save application progress: ${response.status}`
      throw new Error(errorMessage)
    }

    console.log('Прогресс сохранен')
  }

  /**
   * Загрузить файл и привязать к заявке (объединенный метод)
   * Вместо двух отдельных запросов делаем один с multipart/form-data
   */
  async uploadAndLinkFile(
    applicationUuid: string,
    file: File,
    formFieldId: string,
  ): Promise<{ file_id: string }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('form_field_id', formFieldId)
    formData.append('original_filename', file.name)

    const response = await fetch(`${this.baseUrl}/api/v1/applications/${applicationUuid}/files`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.detail
        ? `Failed to upload file: ${JSON.stringify(errorData.detail)}`
        : `Failed to upload file: ${response.status}`
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Файл загружен и привязан:', data)
    return { file_id: data }
  }

  /**
   * Получить ссылку для продолжения заполнения анкеты
   * Эта ссылка может быть отправлена пользователю, чтобы он мог вернуться к заполнению
   */
  getApplicationResumeUrl(applicationUuid: string): string {
    // URL виджета с параметром application_uuid
    const widgetBaseUrl = window.location.origin
    return `${widgetBaseUrl}/?application_uuid=${applicationUuid}`
  }

  /**
   * Получить URL для просмотра/скачивания файла
   */
  getFileUrl(fileId: string): string {
    return `${this.baseUrl}/api/v1/files/${fileId}`
  }

  /**
   * Получить URL для скачивания файла
   */
  getFileDownloadUrl(fileId: string): string {
    return `${this.baseUrl}/api/v1/files/${fileId}/download`
  }

  /**
   * Привязать уже загруженный файл к заявке (если file_id уже известен)
   * Используется редко, обычно используется uploadAndLinkFile
   */
  async linkFileToApplication(
    applicationUuid: string,
    fileId: string,
    originalFilename: string,
    formFieldId: string,
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/applications/${applicationUuid}/files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_id: fileId,
        original_filename: originalFilename,
        form_field_id: formFieldId,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.detail
        ? `Failed to link file to application: ${JSON.stringify(errorData.detail)}`
        : `Failed to link file to application: ${response.status}`
      throw new Error(errorMessage)
    }

    console.log('Файл привязан к заявке')
  }

  /**
   * Отправить заявку на проверку
   */
  async submitApplication(applicationUuid: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/applications/${applicationUuid}/submit`, {
      method: 'POST',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.detail
        ? `Failed to submit application: ${JSON.stringify(errorData.detail)}`
        : `Failed to submit application: ${response.status}`
      throw new Error(errorMessage)
    }

    console.log('Заявка отправлена на проверку')
  }
}

export const apiService = new ApiService()

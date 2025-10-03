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
  start_step_id: string
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
      throw new Error(`Failed to fetch form schema: ${response.status}`)
    }

    const data = await response.json()
    console.log('Получена схема формы:', data)
    return data
  }

  /**
   * Создать новую сессию
   */
  async createSession(platform: 'web' | 'miniapp' = 'web'): Promise<SessionResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ platform }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.status}`)
    }

    const data = await response.json()
    console.log('Создана сессия:', data)
    return data
  }

  /**
   * Получить данные заявки
   */
  async getApplicationData(applicationUuid: string): Promise<ApplicationData> {
    const response = await fetch(`${this.baseUrl}/api/v1/applications/${applicationUuid}/public`)

    if (!response.ok) {
      throw new Error(`Failed to fetch application data: ${response.status}`)
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
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to save application progress: ${response.status}`)
    }

    console.log('Прогресс сохранен')
  }

  /**
   * Привязать файл к заявке
   */
  async linkFileToApplication(
    applicationUuid: string,
    fileId: string,
    fieldId: string,
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/applications/${applicationUuid}/files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_id: fileId,
        field_id: fieldId,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to link file to application: ${response.status}`)
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
      throw new Error(`Failed to submit application: ${response.status}`)
    }

    console.log('Заявка отправлена на проверку')
  }
}

export const apiService = new ApiService()

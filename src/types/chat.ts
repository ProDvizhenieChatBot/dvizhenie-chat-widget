export interface FormData {
  // Согласие и статус
  hasConsent: boolean
  applicantType: 'self' | 'parent' | 'guardian' | 'relative'

  // Контактное лицо (если не подопечный)
  contactPersonName?: string

  // Основные данные подопечного
  beneficiaryName: string
  birthDate: string
  city: string
  phone: string
  email: string

  // Что нужно приобрести
  needType: 'wheelchair' | 'console' | 'components'

  // Сертификат ТСР
  hasCertificate: boolean
  certificateNumber?: string
  certificateAmount?: string
  certificateExpiry?: string

  // Открытые сборы
  hasOtherFundraisers: boolean
  otherFundraisersInfo?: string

  // Консультационная помощь
  needConsultation: 'ipra' | 'mse' | 'sfr' | 'none'

  // Продвижение сбора
  canPromote: boolean
  socialLinks?: string

  // Информация о позиционировании
  wantPositioningInfo: boolean

  // История подопечного
  diagnosis: string
  healthCondition: string
  diagnosisDate: string
  isInMedicalDocument: boolean
  hasDeadlines: boolean
  deadlineInfo?: string
  familyInfo: string
  supportInfo: string
  hobbies: string
  achievements: string
  whyNeedEquipment: string
  messageToReaders: string
  readyForVideo: boolean
  additionalInfo?: string

  // Документы
  hasGosuslugiRecord: boolean
  uploadedFiles: File[]

  // Финальное подтверждение
  submitForm?: boolean
}

export interface ChatStep {
  id: string
  type: 'message' | 'buttons' | 'input' | 'file-upload'
  text: string
  buttons?: Array<{
    id: string
    text: string
    action: string
    value?: any
  }>
  inputType?: 'text' | 'email' | 'phone' | 'date' | 'textarea'
  placeholder?: string
  required?: boolean
  validation?: (value: string) => boolean | string
  nextStep?: string | ((formData: Partial<FormData>) => string)
}

export interface ChatState {
  currentStepId: string
  formData: Partial<FormData>
  completedSteps: string[]
  canGoBack: boolean
}

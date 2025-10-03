/**
 * Типы для динамической формы
 */

export interface ApplicationData {
  [key: string]: any
}

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
  text?: string
}

export interface FormStep {
  step_id: string
  title: string
  type?: 'normal' | 'terminate' | 'summary'
  text?: string // для terminate и summary шагов
  fields?: FormField[]
  navigation: {
    type: 'direct' | 'conditional' | 'submit'
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

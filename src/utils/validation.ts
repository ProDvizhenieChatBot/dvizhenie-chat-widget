/**
 * Утилиты для валидации пользовательского ввода
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Валидация email адреса
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, error: 'Email не может быть пустым' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Введите корректный email адрес' }
  }

  return { isValid: true }
}

/**
 * Валидация номера телефона
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone.trim()) {
    return { isValid: false, error: 'Номер телефона не может быть пустым' }
  }

  // Убираем все символы кроме цифр и +
  const cleanPhone = phone.replace(/[^\d+]/g, '')

  // Проверяем российские номера и международные
  const phoneRegex = /^(\+7|7|8)?[0-9]{10}$|^\+[1-9]\d{1,14}$/
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'Введите корректный номер телефона' }
  }

  return { isValid: true }
}

/**
 * Валидация даты в формате ДД.ММ.ГГГГ
 */
export const validateDate = (date: string): ValidationResult => {
  if (!date.trim()) {
    return { isValid: false, error: 'Дата не может быть пустой' }
  }

  // Проверяем формат ДД.ММ.ГГГГ
  const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/
  const match = date.match(dateRegex)

  if (!match) {
    return { isValid: false, error: 'Введите дату в формате ДД.ММ.ГГГГ' }
  }

  const [, dayStr, monthStr, yearStr] = match
  const day = parseInt(dayStr, 10)
  const month = parseInt(monthStr, 10)
  const year = parseInt(yearStr, 10)

  // Проверяем базовые диапазоны
  if (month < 1 || month > 12) {
    return { isValid: false, error: 'Месяц должен быть от 01 до 12' }
  }

  if (day < 1 || day > 31) {
    return { isValid: false, error: 'День должен быть от 01 до 31' }
  }

  // Создаем объект даты (месяц в JS начинается с 0)
  const parsedDate = new Date(year, month - 1, day)

  // Проверяем, что дата корректная (например, 31.02 будет некорректной)
  if (
    parsedDate.getDate() !== day ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getFullYear() !== year
  ) {
    return { isValid: false, error: 'Введите существующую дату' }
  }

  // Проверяем, что дата не в будущем (для даты рождения)
  const now = new Date()
  if (parsedDate > now) {
    return { isValid: false, error: 'Дата не может быть в будущем' }
  }

  // Проверяем разумные границы (не раньше 1900 года)
  if (year < 1900) {
    return { isValid: false, error: 'Год должен быть не раньше 1900' }
  }

  return { isValid: true }
}

/**
 * Валидация URL/ссылки
 */
export const validateUrl = (url: string): ValidationResult => {
  if (!url.trim()) {
    return { isValid: false, error: 'Ссылка не может быть пустой' }
  }

  try {
    new URL(url)
    return { isValid: true }
  } catch {
    // Пробуем добавить протокол если его нет
    try {
      new URL(`https://${url}`)
      return { isValid: true }
    } catch {
      return { isValid: false, error: 'Введите корректную ссылку' }
    }
  }
}

/**
 * Валидация обычного текстового ввода
 */
export const validateText = (text: string, minLength = 1, maxLength = 1000): ValidationResult => {
  if (!text.trim()) {
    return { isValid: false, error: 'Поле не может быть пустым' }
  }

  if (text.trim().length < minLength) {
    return { isValid: false, error: `Минимальная длина: ${minLength} символов` }
  }

  if (text.length > maxLength) {
    return { isValid: false, error: `Максимальная длина: ${maxLength} символов` }
  }

  return { isValid: true }
}

/**
 * Валидация ФИО
 */
export const validateFullName = (name: string): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, error: 'ФИО не может быть пустым' }
  }

  const words = name.trim().split(/\s+/)
  if (words.length < 2) {
    return { isValid: false, error: 'Введите как минимум имя и фамилию' }
  }

  // Проверяем, что каждое слово содержит только буквы
  const nameRegex = /^[а-яёА-ЯЁa-zA-Z-]+$/
  for (const word of words) {
    if (!nameRegex.test(word)) {
      return { isValid: false, error: 'ФИО должно содержать только буквы' }
    }
  }

  return { isValid: true }
}

/**
 * Получить валидатор по типу шага
 */
export const getValidatorByType = (type: string) => {
  switch (type) {
    case 'email':
      return validateEmail
    case 'phone':
      return validatePhone
    case 'date':
      return validateDate
    case 'link':
      return validateUrl
    case 'input':
      return validateText
    default:
      return validateText
  }
}

import type { ChatStep, FormData } from '../types/chat'

// Валидация email
const validateEmail = (email: string): boolean | string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Пожалуйста, введите корректный email адрес'
  }
  return true
}

// Валидация телефона
const validatePhone = (phone: string): boolean | string => {
  const phoneRegex = /^\+7\d{10}$/
  if (!phoneRegex.test(phone)) {
    return 'Пожалуйста, введите телефон в формате +7XXXXXXXXXX'
  }
  return true
}

// Валидация даты рождения
const validateBirthDate = (date: string): boolean | string => {
  const birthDate = new Date(date)
  const today = new Date()
  if (birthDate > today) {
    return 'Дата рождения не может быть в будущем'
  }
  return true
}

export const chatSteps: Record<string, ChatStep> = {
  // Этап 0: Приветствие и согласие
  welcome: {
    id: 'welcome',
    type: 'buttons',
    text: 'Здравствуйте! Добро пожаловать в сервис фонда «Движение». Чтобы продолжить, необходимо согласиться с условиями и дать согласие на обработку персональных данных (152-ФЗ).',
    buttons: [
      { id: 'agree', text: '✅ Согласен', action: 'consent', value: true },
      { id: 'disagree', text: '❌ Отказываюсь', action: 'consent', value: false },
    ],
    nextStep: (formData: Partial<FormData>) =>
      formData.hasConsent ? 'applicant-type' : 'no-consent',
  },

  'no-consent': {
    id: 'no-consent',
    type: 'buttons',
    text: 'К сожалению, без согласия на обработку данных мы не можем продолжить заполнение анкеты. Если вы передумали и готовы дать согласие, можете начать заново. Если у вас есть вопросы, пожалуйста, свяжитесь с нами: 📧 info@dvizhenie.life',
    buttons: [{ id: 'restart', text: '🔄 Начать заново', action: 'restart', value: true }],
  },

  'applicant-type': {
    id: 'applicant-type',
    type: 'buttons',
    text: 'Отлично! Давайте начнем. Скажите, кто заполняет заявку?',
    buttons: [
      { id: 'self', text: 'Я и есть подопечный', action: 'applicant-type', value: 'self' },
      { id: 'parent', text: 'Мать/отец', action: 'applicant-type', value: 'parent' },
      { id: 'guardian', text: 'Опекун', action: 'applicant-type', value: 'guardian' },
      { id: 'relative', text: 'Родственник', action: 'applicant-type', value: 'relative' },
    ],
    nextStep: (formData: Partial<FormData>) =>
      formData.applicantType === 'self' ? 'beneficiary-name' : 'contact-person-name',
  },

  // Контактное лицо (если не подопечный)
  'contact-person-name': {
    id: 'contact-person-name',
    type: 'input',
    text: 'Укажите ваше ФИО (контактное лицо):',
    inputType: 'text',
    placeholder: 'Введите ваше полное ФИО',
    required: true,
    nextStep: 'beneficiary-name',
  },

  // Этап 1: Основные данные
  'beneficiary-name': {
    id: 'beneficiary-name',
    type: 'input',
    text: 'Укажите ФИО подопечного:',
    inputType: 'text',
    placeholder: 'Введите полное ФИО подопечного',
    required: true,
    nextStep: 'birth-date',
  },

  'birth-date': {
    id: 'birth-date',
    type: 'input',
    text: 'Укажите дату рождения подопечного:',
    inputType: 'date',
    placeholder: 'Выберите дату рождения',
    required: true,
    validation: validateBirthDate,
    nextStep: 'city',
  },

  city: {
    id: 'city',
    type: 'input',
    text: 'Укажите город проживания:',
    inputType: 'text',
    placeholder: 'Введите город проживания',
    required: true,
    nextStep: 'phone',
  },

  phone: {
    id: 'phone',
    type: 'input',
    text: 'Укажите контактный телефон:',
    inputType: 'phone',
    placeholder: '+7XXXXXXXXXX',
    required: true,
    validation: validatePhone,
    nextStep: 'email',
  },

  email: {
    id: 'email',
    type: 'input',
    text: 'Укажите email адрес:',
    inputType: 'email',
    placeholder: 'example@email.com',
    required: true,
    validation: validateEmail,
    nextStep: 'need-type',
  },

  'need-type': {
    id: 'need-type',
    type: 'buttons',
    text: 'Что нужно приобрести?',
    buttons: [
      { id: 'wheelchair', text: 'Коляска (ТСР)', action: 'need-type', value: 'wheelchair' },
      { id: 'console', text: 'Приставка', action: 'need-type', value: 'console' },
      { id: 'components', text: 'Комплектующие', action: 'need-type', value: 'components' },
    ],
    nextStep: 'has-certificate',
  },

  'has-certificate': {
    id: 'has-certificate',
    type: 'buttons',
    text: 'Есть ли сертификат на ТСР?',
    buttons: [
      { id: 'yes', text: 'Да', action: 'has-certificate', value: true },
      { id: 'no', text: 'Нет', action: 'has-certificate', value: false },
    ],
    nextStep: (formData: Partial<FormData>) =>
      formData.hasCertificate ? 'certificate-number' : 'has-other-fundraisers',
  },

  'certificate-number': {
    id: 'certificate-number',
    type: 'input',
    text: 'Укажите номер сертификата:',
    inputType: 'text',
    placeholder: 'Введите номер сертификата',
    required: true,
    nextStep: 'certificate-amount',
  },

  'certificate-amount': {
    id: 'certificate-amount',
    type: 'input',
    text: 'Укажите сумму сертификата:',
    inputType: 'text',
    placeholder: 'Введите сумму в рублях',
    required: true,
    nextStep: 'certificate-expiry',
  },

  'certificate-expiry': {
    id: 'certificate-expiry',
    type: 'input',
    text: 'Укажите срок действия сертификата:',
    inputType: 'date',
    placeholder: 'Выберите дату окончания действия',
    required: true,
    nextStep: 'has-other-fundraisers',
  },

  'has-other-fundraisers': {
    id: 'has-other-fundraisers',
    type: 'buttons',
    text: 'Есть ли открытые сборы в других фондах?',
    buttons: [
      { id: 'yes', text: 'Да', action: 'has-other-fundraisers', value: true },
      { id: 'no', text: 'Нет', action: 'has-other-fundraisers', value: false },
    ],
    nextStep: (formData: Partial<FormData>) =>
      formData.hasOtherFundraisers ? 'other-fundraisers-info' : 'need-consultation',
  },

  'other-fundraisers-info': {
    id: 'other-fundraisers-info',
    type: 'input',
    text: 'Укажите информацию о других сборах (фонд, цель, ссылка):',
    inputType: 'textarea',
    placeholder: 'Опишите другие активные сборы',
    required: true,
    nextStep: 'need-consultation',
  },

  'need-consultation': {
    id: 'need-consultation',
    type: 'buttons',
    text: 'Нужна ли консультационная помощь?',
    buttons: [
      { id: 'ipra', text: 'Да, по ИПРА', action: 'need-consultation', value: 'ipra' },
      { id: 'mse', text: 'Да, по МСЭ', action: 'need-consultation', value: 'mse' },
      { id: 'sfr', text: 'Да, по СФР', action: 'need-consultation', value: 'sfr' },
      { id: 'none', text: 'Нет', action: 'need-consultation', value: 'none' },
    ],
    nextStep: 'can-promote',
  },

  'can-promote': {
    id: 'can-promote',
    type: 'buttons',
    text: 'Есть ли возможность продвигать сбор самостоятельно?',
    buttons: [
      { id: 'yes', text: 'Да', action: 'can-promote', value: true },
      { id: 'no', text: 'Нет', action: 'can-promote', value: false },
    ],
    nextStep: (formData: Partial<FormData>) =>
      formData.canPromote ? 'social-links' : 'want-positioning-info',
  },

  'social-links': {
    id: 'social-links',
    type: 'input',
    text: 'Укажите ссылки на соцсети или медиа:',
    inputType: 'textarea',
    placeholder: 'Введите ссылки на ваши соцсети',
    required: true,
    nextStep: 'want-positioning-info',
  },

  'want-positioning-info': {
    id: 'want-positioning-info',
    type: 'buttons',
    text: 'Хотели бы получать информацию о правильном позиционировании?',
    buttons: [
      { id: 'yes', text: 'Да', action: 'want-positioning-info', value: true },
      { id: 'no', text: 'Нет', action: 'want-positioning-info', value: false },
    ],
    nextStep: 'diagnosis',
  },

  // Этап 2: История подопечного
  diagnosis: {
    id: 'diagnosis',
    type: 'input',
    text: 'Укажите диагноз подопечного:',
    inputType: 'text',
    placeholder: 'Введите диагноз',
    required: true,
    nextStep: 'health-condition',
  },

  'health-condition': {
    id: 'health-condition',
    type: 'input',
    text: 'Опишите текущее состояние здоровья и ограничения:',
    inputType: 'textarea',
    placeholder: 'Опишите состояние здоровья',
    required: true,
    nextStep: 'diagnosis-date',
  },

  'diagnosis-date': {
    id: 'diagnosis-date',
    type: 'input',
    text: 'Когда был поставлен диагноз?',
    inputType: 'text',
    placeholder: 'Укажите дату или период',
    required: true,
    nextStep: 'is-in-medical-document',
  },

  'is-in-medical-document': {
    id: 'is-in-medical-document',
    type: 'buttons',
    text: 'Прописано ли ТСР в медзаключении или ИПРА?',
    buttons: [
      { id: 'yes', text: 'Да', action: 'is-in-medical-document', value: true },
      { id: 'no', text: 'Нет', action: 'is-in-medical-document', value: false },
    ],
    nextStep: 'has-deadlines',
  },

  'has-deadlines': {
    id: 'has-deadlines',
    type: 'buttons',
    text: 'Есть ли сроки, к которым особенно важно получить помощь?',
    buttons: [
      { id: 'yes', text: 'Да', action: 'has-deadlines', value: true },
      { id: 'no', text: 'Нет', action: 'has-deadlines', value: false },
    ],
    nextStep: (formData: Partial<FormData>) =>
      formData.hasDeadlines ? 'deadline-info' : 'family-info',
  },

  'deadline-info': {
    id: 'deadline-info',
    type: 'input',
    text: 'Укажите сроки и причину их важности:',
    inputType: 'textarea',
    placeholder: 'Опишите сроки и их важность',
    required: true,
    nextStep: 'family-info',
  },

  'family-info': {
    id: 'family-info',
    type: 'input',
    text: 'Расскажите о семье или близких, кто рядом и поддерживает:',
    inputType: 'textarea',
    placeholder: 'Расскажите о семье',
    required: true,
    nextStep: 'support-info',
  },

  'support-info': {
    id: 'support-info',
    type: 'input',
    text: 'Кто вас вдохновляет или поддерживает?',
    inputType: 'textarea',
    placeholder: 'Расскажите о поддержке',
    required: true,
    nextStep: 'hobbies',
  },

  hobbies: {
    id: 'hobbies',
    type: 'input',
    text: 'Чем увлекаетесь? Есть ли любимое хобби?',
    inputType: 'textarea',
    placeholder: 'Расскажите об увлечениях',
    required: true,
    nextStep: 'achievements',
  },

  achievements: {
    id: 'achievements',
    type: 'input',
    text: 'Какие успехи или достижения особенно дороги?',
    inputType: 'textarea',
    placeholder: 'Расскажите о достижениях',
    required: true,
    nextStep: 'why-need-equipment',
  },

  'why-need-equipment': {
    id: 'why-need-equipment',
    type: 'input',
    text: 'Почему нужна новая коляска/приставка/комплектующие?',
    inputType: 'textarea',
    placeholder: 'Объясните необходимость',
    required: true,
    nextStep: 'message-to-readers',
  },

  'message-to-readers': {
    id: 'message-to-readers',
    type: 'input',
    text: 'Что бы вы хотели сказать людям, которые прочитают вашу историю?',
    inputType: 'textarea',
    placeholder: 'Ваше сообщение читателям',
    required: true,
    nextStep: 'ready-for-video',
  },

  'ready-for-video': {
    id: 'ready-for-video',
    type: 'buttons',
    text: 'Готовы ли записать короткое видео о своей жизни?',
    buttons: [
      { id: 'yes', text: 'Да', action: 'ready-for-video', value: true },
      { id: 'no', text: 'Нет', action: 'ready-for-video', value: false },
    ],
    nextStep: 'additional-info',
  },

  'additional-info': {
    id: 'additional-info',
    type: 'input',
    text: 'Хотите добавить что-то от себя?',
    inputType: 'textarea',
    placeholder: 'Дополнительная информация (необязательно)',
    required: false,
    nextStep: 'documents-intro',
  },

  // Этап 3: Документы
  'documents-intro': {
    id: 'documents-intro',
    type: 'buttons',
    text: 'Теперь давайте загрузим документы. Список документов зависит от возраста и статуса подопечного.',
    buttons: [{ id: 'continue', text: '📄 Продолжить', action: 'continue', value: true }],
    nextStep: 'has-gosuslugi-record',
  },

  'has-gosuslugi-record': {
    id: 'has-gosuslugi-record',
    type: 'buttons',
    text: 'Подтверждена ли запись на Госуслугах?',
    buttons: [
      { id: 'yes', text: 'Да', action: 'has-gosuslugi-record', value: true },
      { id: 'no', text: 'Нет', action: 'has-gosuslugi-record', value: false },
    ],
    nextStep: (formData: Partial<FormData>) => {
      // Определяем возраст подопечного
      if (formData.birthDate) {
        const birthDate = new Date(formData.birthDate)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        return age < 14 ? 'upload-child-docs' : 'upload-adult-docs'
      }
      return 'upload-child-docs' // По умолчанию
    },
  },

  // Документы для детей (до 14 лет)
  'upload-child-docs': {
    id: 'upload-child-docs',
    type: 'file-upload',
    text: 'Загрузите документы для ребенка:\n\n📋 Обязательные документы:\n• Копия свидетельства о рождении\n• Паспорт родителя/опекуна (1-я страница + прописка)\n• Копия ИПРА (все страницы)\n• Медицинское заключение/выписка\n• Справка об инвалидности (обе стороны)\n• СНИЛС\n• Несколько качественных фотографий подопечного',
    nextStep: 'preview-form',
  },

  // Документы для подростков и взрослых (14+ лет)
  'upload-adult-docs': {
    id: 'upload-adult-docs',
    type: 'file-upload',
    text: 'Загрузите документы:\n\n📋 Обязательные документы:\n• Паспорт подопечного (1-я страница + прописка)\n• Копия ИПРА (все страницы)\n• Медицинское заключение/выписка\n• Справка об инвалидности (обе стороны)\n• СНИЛС\n• Несколько качественных фотографий подопечного',
    nextStep: 'preview-form',
  },

  'preview-form': {
    id: 'preview-form',
    type: 'buttons',
    text: 'Спасибо! ✅ Ваша анкета заполнена. Вы можете просмотреть её и подтвердить отправку.',
    buttons: [
      { id: 'submit', text: '📤 Отправить анкету', action: 'submit', value: true },
      { id: 'edit', text: '✏️ Вернуться и исправить', action: 'edit', value: false },
    ],
    nextStep: (formData: Partial<FormData>) =>
      formData.submitForm ? 'completion' : 'applicant-type', // Возврат к началу для редактирования
  },

  completion: {
    id: 'completion',
    type: 'message',
    text: 'Благодарим за заполнение анкеты! Ваша заявка отправлена в фонд «Движение». Мы свяжемся с вами в течение 3-5 рабочих дней для уточнения деталей.\n\nЕсли у вас есть вопросы, обращайтесь: 📧 info@dvizhenie.life',
  },
}

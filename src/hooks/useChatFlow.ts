import { useState, useCallback } from 'react'

import type { ChatState, FormData } from '../types/chat'
import { chatSteps } from '../config/chatSteps'

export const useChatFlow = () => {
  const [chatState, setChatState] = useState<ChatState>({
    currentStepId: 'welcome',
    formData: {},
    completedSteps: [],
    canGoBack: false,
  })

  const updateFormData = useCallback((field: keyof FormData, value: any) => {
    setChatState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
    }))
  }, [])

  const goToNextStep = useCallback(
    (stepId?: string) => {
      const currentStep = chatSteps[chatState.currentStepId]
      let nextStepId: string

      if (stepId) {
        nextStepId = stepId
      } else if (typeof currentStep.nextStep === 'function') {
        nextStepId = currentStep.nextStep(chatState.formData)
      } else if (typeof currentStep.nextStep === 'string') {
        nextStepId = currentStep.nextStep
      } else {
        // Если нет следующего шага, остаемся на текущем
        return
      }

      setChatState((prev) => ({
        ...prev,
        currentStepId: nextStepId,
        completedSteps: [...prev.completedSteps, prev.currentStepId],
        canGoBack: true,
      }))
    },
    [chatState.currentStepId, chatState.formData],
  )

  const goToPreviousStep = useCallback(() => {
    if (chatState.completedSteps.length > 0) {
      const previousStepId = chatState.completedSteps[chatState.completedSteps.length - 1]
      setChatState((prev) => ({
        ...prev,
        currentStepId: previousStepId,
        completedSteps: prev.completedSteps.slice(0, -1),
        canGoBack: prev.completedSteps.length > 1,
      }))
    }
  }, [chatState.completedSteps])

  const handleButtonClick = useCallback(
    (action: string, value: any) => {
      // Обновляем данные формы на основе действия
      switch (action) {
        case 'consent':
          updateFormData('hasConsent', value)
          break
        case 'applicant-type':
          updateFormData('applicantType', value)
          break
        case 'need-type':
          updateFormData('needType', value)
          break
        case 'has-certificate':
          updateFormData('hasCertificate', value)
          break
        case 'has-other-fundraisers':
          updateFormData('hasOtherFundraisers', value)
          break
        case 'need-consultation':
          updateFormData('needConsultation', value)
          break
        case 'can-promote':
          updateFormData('canPromote', value)
          break
        case 'want-positioning-info':
          updateFormData('wantPositioningInfo', value)
          break
        case 'is-in-medical-document':
          updateFormData('isInMedicalDocument', value)
          break
        case 'has-deadlines':
          updateFormData('hasDeadlines', value)
          break
        case 'ready-for-video':
          updateFormData('readyForVideo', value)
          break
        case 'has-gosuslugi-record':
          updateFormData('hasGosuslugiRecord', value)
          break
        default:
          break
      }

      // Переходим к следующему шагу
      goToNextStep()
    },
    [updateFormData, goToNextStep],
  )

  const handleInputSubmit = useCallback(
    (value: string) => {
      const currentStep = chatSteps[chatState.currentStepId]

      // Валидация, если есть
      if (currentStep.validation) {
        const validationResult = currentStep.validation(value)
        if (validationResult !== true) {
          return validationResult // Возвращаем ошибку валидации
        }
      }

      // Определяем поле для сохранения на основе ID шага
      const fieldMapping: Record<string, keyof FormData> = {
        'contact-person-name': 'contactPersonName',
        'beneficiary-name': 'beneficiaryName',
        'birth-date': 'birthDate',
        city: 'city',
        phone: 'phone',
        email: 'email',
        'certificate-number': 'certificateNumber',
        'certificate-amount': 'certificateAmount',
        'certificate-expiry': 'certificateExpiry',
        'other-fundraisers-info': 'otherFundraisersInfo',
        'social-links': 'socialLinks',
        diagnosis: 'diagnosis',
        'health-condition': 'healthCondition',
        'diagnosis-date': 'diagnosisDate',
        'deadline-info': 'deadlineInfo',
        'family-info': 'familyInfo',
        'support-info': 'supportInfo',
        hobbies: 'hobbies',
        achievements: 'achievements',
        'why-need-equipment': 'whyNeedEquipment',
        'message-to-readers': 'messageToReaders',
        'additional-info': 'additionalInfo',
      }

      const field = fieldMapping[chatState.currentStepId]
      if (field) {
        updateFormData(field, value)
      }

      goToNextStep()
      return true // Успешная валидация
    },
    [chatState.currentStepId, updateFormData, goToNextStep],
  )

  const handleFileUpload = useCallback(
    (files: File[]) => {
      setChatState((prev) => ({
        ...prev,
        formData: {
          ...prev.formData,
          uploadedFiles: [...(prev.formData.uploadedFiles || []), ...files],
        },
      }))

      goToNextStep()
    },
    [goToNextStep],
  )

  const getCurrentStep = useCallback(() => {
    return chatSteps[chatState.currentStepId]
  }, [chatState.currentStepId])

  const resetChat = useCallback(() => {
    setChatState({
      currentStepId: 'welcome',
      formData: {},
      completedSteps: [],
      canGoBack: false,
    })
  }, [])

  const saveProgress = useCallback(() => {
    // Сохраняем прогресс в localStorage
    const progressData = {
      chatState,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem('dvizhenie-chat-progress', JSON.stringify(progressData))

    // Генерируем уникальную ссылку для возврата
    const token = btoa(JSON.stringify({ timestamp: progressData.timestamp }))
    return `${window.location.origin}${window.location.pathname}?resume=${token}`
  }, [chatState])

  const loadProgress = useCallback((token?: string) => {
    try {
      const savedProgress = localStorage.getItem('dvizhenie-chat-progress')
      if (savedProgress) {
        const progressData = JSON.parse(savedProgress)

        // Проверяем токен, если он передан
        if (token) {
          const tokenData = JSON.parse(atob(token))
          if (tokenData.timestamp !== progressData.timestamp) {
            return false // Токен не соответствует сохраненным данным
          }
        }

        setChatState(progressData.chatState)
        return true
      }
    } catch (error) {
      console.error('Ошибка загрузки прогресса:', error)
    }
    return false
  }, [])

  return {
    chatState,
    getCurrentStep,
    handleButtonClick,
    handleInputSubmit,
    handleFileUpload,
    goToNextStep,
    goToPreviousStep,
    updateFormData,
    resetChat,
    saveProgress,
    loadProgress,
  }
}

import { useState, useCallback } from 'react'

import { chatSteps } from '../config/chatSteps'
import type { ChatState, FormData } from '../types/chat'

export const useChatFlow = () => {
  const [chatState, setChatState] = useState<ChatState>({
    currentStepId: 'welcome',
    formData: {},
    completedSteps: [],
    canGoBack: false,
  })

  const updateFormData = useCallback((field: keyof FormData, value: string | boolean) => {
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

      console.log('🚀 GO TO NEXT STEP:', {
        currentStepId: chatState.currentStepId,
        formData: chatState.formData,
        currentStep: currentStep?.id,
      })

      if (stepId) {
        nextStepId = stepId
      } else if (typeof currentStep.nextStep === 'function') {
        nextStepId = currentStep.nextStep(chatState.formData)
        console.log('📋 NEXT STEP CALCULATED:', {
          nextStepId,
          hasConsent: chatState.formData.hasConsent,
        })
      } else if (typeof currentStep.nextStep === 'string') {
        nextStepId = currentStep.nextStep
      } else {
        // Если нет следующего шага, остаемся на текущем
        console.log('❌ NO NEXT STEP FOUND')
        return
      }

      console.log('✅ MOVING TO STEP:', nextStepId)
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
    (action: string, value: string | boolean) => {
      console.log('🔥🔥🔥 NEW VERSION BUTTON CLICK:', {
        action,
        value,
        currentStep: chatState.currentStepId,
      })

      // Специальная обработка для перезапуска
      if (action === 'restart') {
        restartAfterDecline()
        return
      }

      // Специальная обработка для продолжения (не обновляет formData)
      if (action === 'continue') {
        // Сразу переходим к следующему шагу без обновления formData
        setChatState((prev) => {
          const currentStep = chatSteps[prev.currentStepId]
          const nextStepId =
            typeof currentStep?.nextStep === 'function'
              ? currentStep.nextStep(prev.formData)
              : currentStep?.nextStep

          if (nextStepId && chatSteps[nextStepId]) {
            console.log('✅ CONTINUE TO STEP:', nextStepId)
            return {
              ...prev,
              currentStepId: nextStepId,
              completedSteps: [...prev.completedSteps, prev.currentStepId],
              canGoBack: true,
            }
          } else {
            console.log('❌ NO NEXT STEP FOUND FOR CONTINUE')
            return prev
          }
        })
        return
      }

      // Определяем какое поле обновить
      let fieldToUpdate: keyof FormData | null = null
      switch (action) {
        case 'consent':
          fieldToUpdate = 'hasConsent'
          break
        case 'applicant-type':
          fieldToUpdate = 'applicantType'
          break
        case 'need-type':
          fieldToUpdate = 'needType'
          break
        case 'has-certificate':
          fieldToUpdate = 'hasCertificate'
          break
        case 'has-other-fundraisers':
          fieldToUpdate = 'hasOtherFundraisers'
          break
        case 'need-consultation':
          fieldToUpdate = 'needConsultation'
          break
        case 'can-promote':
          fieldToUpdate = 'canPromote'
          break
        case 'want-positioning-info':
          fieldToUpdate = 'wantPositioningInfo'
          break
        case 'is-in-medical-document':
          fieldToUpdate = 'isInMedicalDocument'
          break
        case 'has-deadlines':
          fieldToUpdate = 'hasDeadlines'
          break
        case 'ready-for-video':
          fieldToUpdate = 'readyForVideo'
          break
        case 'has-gosuslugi-record':
          fieldToUpdate = 'hasGosuslugiRecord'
          break
        case 'submit':
          fieldToUpdate = 'submitForm'
          break
        case 'edit':
          // Для редактирования не обновляем formData, просто переходим
          break
        default:
          break
      }

      // Обновляем состояние синхронно и сразу переходим к следующему шагу
      setChatState((prev) => {
        const newFormData = fieldToUpdate
          ? { ...prev.formData, [fieldToUpdate]: value }
          : prev.formData

        console.log('🎯 FORM DATA UPDATED SYNC:', newFormData)

        // Вычисляем следующий шаг с обновленными данными
        const currentStep = chatSteps[prev.currentStepId]
        const nextStepId =
          typeof currentStep?.nextStep === 'function'
            ? currentStep.nextStep(newFormData)
            : currentStep?.nextStep

        console.log('📋 NEXT STEP CALCULATED SYNC:', { nextStepId, formData: newFormData })

        if (nextStepId && chatSteps[nextStepId]) {
          console.log('✅ MOVING TO STEP SYNC:', nextStepId)
          return {
            ...prev,
            formData: newFormData,
            currentStepId: nextStepId,
            completedSteps: [...prev.completedSteps, prev.currentStepId],
            canGoBack: true,
          }
        } else {
          console.log('❌ NO NEXT STEP FOUND SYNC')
          return {
            ...prev,
            formData: newFormData,
          }
        }
      })
    },
    [chatState.currentStepId],
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

      // Переходим к следующему шагу после обновления данных
      setTimeout(() => {
        goToNextStep()
      }, 100)

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

      setTimeout(() => {
        goToNextStep()
      }, 100)
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

  const restartAfterDecline = useCallback(() => {
    // Сбрасываем состояние чата
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
    restartAfterDecline,
    saveProgress,
    loadProgress,
  }
}

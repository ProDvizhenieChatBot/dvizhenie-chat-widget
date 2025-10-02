import { useState, useCallback } from 'react'

import scenarioData from '../utils/scenario.json'

export interface ScenarioStep {
  id: string
  text: string
  type: 'message' | 'buttons' | 'input' | 'date' | 'phone' | 'email' | 'link'
  options?: string[]
  next?: string | Record<string, string>
  showIf?: string
}

export interface ScenarioData {
  start: string
  steps: ScenarioStep[]
}

export interface UserAnswers {
  [stepId: string]: string
}

export const useScenario = () => {
  const [currentStepId, setCurrentStepId] = useState<string>(scenarioData.start)
  const [answers, setAnswers] = useState<UserAnswers>({})
  const [stepHistory, setStepHistory] = useState<string[]>([])

  const scenario = scenarioData as ScenarioData

  const getCurrentStep = useCallback((): ScenarioStep | null => {
    return scenario.steps.find((step) => step.id === currentStepId) || null
  }, [currentStepId, scenario.steps])

  const evaluateCondition = useCallback((condition: string, answers: UserAnswers): boolean => {
    // Безопасная оценка условий с предопределенными правилами
    try {
      // Парсим условие в формате "answers.field == 'value'" или "answers.field != 'value'"
      const conditionRegex = /^answers\.(\w+)\s*(==|!=)\s*['"]([^'"]+)['"]$/
      const match = condition.match(conditionRegex)

      if (!match) {
        console.warn(`Неподдерживаемое условие: ${condition}`)
        return true
      }

      const [, fieldName, operator, expectedValue] = match
      const actualValue = answers[fieldName]

      if (operator === '==') {
        return actualValue === expectedValue
      } else if (operator === '!=') {
        return actualValue !== expectedValue
      }

      return true
    } catch (error) {
      console.warn(`Ошибка при оценке условия "${condition}":`, error)
      return true
    }
  }, [])

  const shouldShowStep = useCallback(
    (step: ScenarioStep): boolean => {
      if (!step.showIf) return true
      return evaluateCondition(step.showIf, answers)
    },
    [answers, evaluateCondition],
  )

  const getNextStepId = useCallback((step: ScenarioStep, userAnswer?: string): string | null => {
    if (!step.next) return null

    if (typeof step.next === 'string') {
      return step.next
    }

    // Обработка объекта next с вариантами
    if (typeof step.next === 'object' && userAnswer) {
      // Сначала ищем точное совпадение
      if (step.next[userAnswer]) {
        return step.next[userAnswer]
      }

      // Затем ищем default
      if (step.next.default) {
        return step.next.default
      }
    }

    return null
  }, [])

  const findNextValidStep = useCallback(
    (startStepId: string, currentAnswers: UserAnswers): string | null => {
      const startIndex = scenario.steps.findIndex((step) => step.id === startStepId)
      if (startIndex === -1) return null

      // Ищем следующий подходящий шаг
      for (let i = startIndex; i < scenario.steps.length; i++) {
        const step = scenario.steps[i]
        if (!step.showIf || evaluateCondition(step.showIf, currentAnswers)) {
          return step.id
        }
      }

      return null
    },
    [evaluateCondition, scenario.steps],
  )

  const handleUserAnswer = useCallback(
    (answer: string) => {
      const currentStep = getCurrentStep()
      if (!currentStep) return

      // Сохраняем ответ пользователя
      const newAnswers = { ...answers, [currentStepId]: answer }
      setAnswers(newAnswers)

      // Выводим в консоль
      console.log(`${currentStepId}: ${answer}`)

      // Добавляем текущий шаг в историю
      setStepHistory((prev) => [...prev, currentStepId])

      // Определяем следующий шаг
      const nextStepId = getNextStepId(currentStep, answer)

      if (nextStepId) {
        // Проверяем, нужно ли показывать следующий шаг
        const nextStep = scenario.steps.find((step) => step.id === nextStepId)
        if (nextStep && shouldShowStep(nextStep)) {
          setCurrentStepId(nextStepId)
        } else {
          // Если следующий шаг не должен показываться, ищем следующий подходящий
          const nextValidStep = findNextValidStep(nextStepId, newAnswers)
          if (nextValidStep) {
            setCurrentStepId(nextValidStep)
          }
        }
      }
    },
    [
      currentStepId,
      answers,
      getCurrentStep,
      getNextStepId,
      shouldShowStep,
      scenario.steps,
      findNextValidStep,
    ],
  )

  const canGoBack = useCallback((): boolean => {
    return stepHistory.length > 0
  }, [stepHistory])

  const goBack = useCallback(() => {
    if (stepHistory.length > 0) {
      const previousStepId = stepHistory[stepHistory.length - 1]
      setStepHistory((prev) => prev.slice(0, -1))
      setCurrentStepId(previousStepId)

      // Удаляем ответ для текущего шага
      const newAnswers = { ...answers }
      delete newAnswers[currentStepId]
      setAnswers(newAnswers)
    }
  }, [stepHistory, currentStepId, answers])

  const restart = useCallback(() => {
    setCurrentStepId(scenario.start)
    setAnswers({})
    setStepHistory([])
  }, [scenario.start])

  return {
    currentStep: getCurrentStep(),
    currentStepId,
    answers,
    canGoBack: canGoBack(),
    handleUserAnswer,
    goBack,
    restart,
    isComplete: !getCurrentStep(),
  }
}

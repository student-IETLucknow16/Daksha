using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace SIH26041.Scenarios
{
    public enum ScenarioResult
    {
        InProgress,
        PassedNumeric,      // met/exceeded passing score, no critical failure
        FailedCriticalError, // a critical step was failed/violated -> automatic fail regardless of score
        FailedLowScore,      // completed all steps but total score below passingScore
        FailedTimeout
    }

    /// <summary>
    /// Drives a ScenarioData through its steps sequentially. Completely
    /// data-driven and content-agnostic: it has no idea what a "fire" or
    /// "gas leak" is. All scene objects report actionId strings via
    /// ReportAction(); this class only compares those strings against the
    /// current step's expected values.
    /// </summary>
    public class ScenarioManager : MonoBehaviour
    {
        public static ScenarioManager Instance { get; private set; }

        [SerializeField] private string scenarioResourcePath = "Scenarios/fire_emergency";
        public string ScenarioResourcePath => scenarioResourcePath;

        public event Action<ScenarioStepData> OnStepStarted;
        public event Action<ScenarioStepData, bool /*wasCorrect*/, string /*feedback*/> OnStepCompleted;
        public event Action<ScenarioStepData, float /*secondsRemaining*/> OnStepTimerTick;
        public event Action<ScenarioResult, int /*finalScorePercent*/> OnScenarioEnded;
        public event Action<string /*hint*/> OnHintRequested;

        public ScenarioData CurrentScenario { get; private set; }
        public ScenarioStepData CurrentStep { get; private set; }
        public int CurrentStepIndex { get; private set; } = -1;
        public int EarnedPoints { get; private set; }
        public List<string> MistakesLog { get; private set; } = new List<string>();
        public ScenarioResult Result { get; private set; } = ScenarioResult.InProgress;

        private Coroutine _stepTimerRoutine;
        private bool _scenarioActive;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
        }

        /// <summary>Call this once the AR scenario prefab has been placed and is ready.</summary>
        public void BeginScenario()
        {
            Debug.Log("[ScenarioManager] BeginScenario() CALLED");

            CurrentScenario = ScenarioData.LoadFromResources(scenarioResourcePath);
            if (CurrentScenario == null || CurrentScenario.steps == null || CurrentScenario.steps.Length == 0)
            {
                Debug.LogError("[ScenarioManager] No valid scenario data — cannot start.");
                return;
            }

            EarnedPoints = 0;
            MistakesLog.Clear();
            CurrentStepIndex = -1;
            Result = ScenarioResult.InProgress;
            _scenarioActive = true;

            AdvanceToNextStep();
        }

        private void AdvanceToNextStep()
        {
            CurrentStepIndex++;

            if (CurrentStepIndex >= CurrentScenario.steps.Length)
            {
                FinishScenario();
                return;
            }

            CurrentStep = CurrentScenario.steps[CurrentStepIndex];
            OnStepStarted?.Invoke(CurrentStep);

            if (_stepTimerRoutine != null) StopCoroutine(_stepTimerRoutine);

            if (CurrentStep.Type == ScenarioStepType.Avoid)
            {
                // "Avoid" steps pass automatically once the timer runs out
                // WITHOUT a disallowed action being reported in the meantime.
                _stepTimerRoutine = StartCoroutine(RunAvoidStepTimer(CurrentStep));
            }
            else if (CurrentStep.timeLimitSeconds > 0)
            {
                _stepTimerRoutine = StartCoroutine(RunStepTimeout(CurrentStep));
            }
        }

        private IEnumerator RunAvoidStepTimer(ScenarioStepData step)
        {
            float remaining = step.timeLimitSeconds > 0 ? step.timeLimitSeconds : 5f;
            float total = remaining;
            while (remaining > 0 && _scenarioActive && CurrentStep == step)
            {
                OnStepTimerTick?.Invoke(step, remaining);
                yield return new WaitForSeconds(0.5f);
                remaining -= 0.5f;
            }

            // If we're still on this step when the timer expires, the worker
            // successfully avoided the hazard for the whole window.
            if (_scenarioActive && CurrentStep == step)
            {
                CompleteStep(step, wasCorrect: true, feedback: step.feedbackCorrect);
            }
        }

        private IEnumerator RunStepTimeout(ScenarioStepData step)
        {
            float remaining = step.timeLimitSeconds;
            while (remaining > 0 && _scenarioActive && CurrentStep == step)
            {
                OnStepTimerTick?.Invoke(step, remaining);
                yield return new WaitForSeconds(0.5f);
                remaining -= 0.5f;

                // Offer a hint at the halfway point.
                if (!string.IsNullOrEmpty(step.hint) && remaining <= step.timeLimitSeconds / 2f && remaining > step.timeLimitSeconds / 2f - 0.5f)
                {
                    OnHintRequested?.Invoke(step.hint);
                }
            }

            if (_scenarioActive && CurrentStep == step)
            {
                // Timed out without the correct action.
                RegisterMistake(step, "Timed out");
                if (step.critical)
                {
                    EndScenarioAsFailed(ScenarioResult.FailedCriticalError);
                }
                else
                {
                    CompleteStep(step, wasCorrect: false, feedback: step.feedbackIncorrect);
                }
            }
        }

        /// <summary>
        /// Any interactable in the scene (button, extinguisher, hazard zone)
        /// calls this with its actionId when the worker interacts with it.
        /// </summary>
        public void ReportAction(string actionId)
        {
            if (!_scenarioActive || CurrentStep == null) return;

            bool isCorrect = actionId == CurrentStep.correctAction;
            bool isKnownWrong = CurrentStep.incorrectActions != null && CurrentStep.incorrectActions.Contains(actionId);

            if (isCorrect)
            {
                CompleteStep(CurrentStep, wasCorrect: true, feedback: CurrentStep.feedbackCorrect);
            }
            else if (isKnownWrong || CurrentStep.Type == ScenarioStepType.Avoid)
            {
                // For "Avoid" steps, ANY reported action other than the
                // correct one (usually there isn't one) counts as entering
                // the hazard — e.g. HazardZone reports its own actionId.
                RegisterMistake(CurrentStep, actionId);

                if (CurrentStep.critical)
                {
                    EndScenarioAsFailed(ScenarioResult.FailedCriticalError);
                }
                else
                {
                    CompleteStep(CurrentStep, wasCorrect: false, feedback: CurrentStep.feedbackIncorrect);
                }
            }
            // else: action doesn't match anything relevant to the current
            // step (e.g. worker tapped an unrelated object) — ignore it.
        }

        private void RegisterMistake(ScenarioStepData step, string actionTaken)
        {
            MistakesLog.Add($"{step.stepId}: {actionTaken}");
        }

        private void CompleteStep(ScenarioStepData step, bool wasCorrect, string feedback)
        {
            if (_stepTimerRoutine != null) StopCoroutine(_stepTimerRoutine);

            if (wasCorrect)
            {
                EarnedPoints += step.points;
            }

            OnStepCompleted?.Invoke(step, wasCorrect, feedback);
            AdvanceToNextStep();
        }

        private void FinishScenario()
        {
            _scenarioActive = false;
            int totalPossible = CurrentScenario.TotalPossiblePoints();
            int percent = totalPossible > 0 ? Mathf.RoundToInt((EarnedPoints / (float)totalPossible) * 100f) : 0;

            Debug.Log($"[ScenarioManager] Score: {percent}%, Passing Score Loaded: {CurrentScenario.passingScore}");

            Result = percent >= CurrentScenario.passingScore
                ? ScenarioResult.PassedNumeric
                : ScenarioResult.FailedLowScore;

            OnScenarioEnded?.Invoke(Result, percent);
        }

        private void EndScenarioAsFailed(ScenarioResult failureReason)
        {
            _scenarioActive = false;
            if (_stepTimerRoutine != null) StopCoroutine(_stepTimerRoutine);

            Result = failureReason;
            int totalPossible = CurrentScenario.TotalPossiblePoints();
            int percent = totalPossible > 0 ? Mathf.RoundToInt((EarnedPoints / (float)totalPossible) * 100f) : 0;
            OnScenarioEnded?.Invoke(Result, percent);
        }

        /// <summary>Restarts the same scenario from step 0 (worker tapped "Retry").</summary>
        public void RetryScenario()
        {
            BeginScenario();
        }


        public bool SetScenarioByModuleId(string moduleId)
        {
            if (string.IsNullOrEmpty(moduleId))
                return false;

            switch (moduleId)
            {
                case "fire_emergency":
                    scenarioResourcePath = "Scenarios/fire_emergency";
                    return true;

                case "gas_leak_confined_space":
                    scenarioResourcePath = "Scenarios/gas_leak_confined_space";
                    return true;

                default:
                    Debug.LogError(
                        "[ScenarioManager] Unknown moduleId: " + moduleId
                    );
                    return false;
            }
        }
    }
    
    }

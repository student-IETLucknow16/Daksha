using UnityEngine;
using TMPro;
using SIH26041.Scenarios;
using SIH26041.Audio;
using SIH26041.Localization;

namespace SIH26041.UI
{
    public class ScenarioUIController : MonoBehaviour
    {
        [Header("Instruction")]
        [SerializeField] private TMP_Text instructionText;
        [SerializeField] private TMP_Text timerText;

        [Header("Feedback")]
        [SerializeField] private GameObject correctFeedbackPanel;
        [SerializeField] private GameObject incorrectFeedbackPanel;
        [SerializeField] private TMP_Text feedbackText;
        [SerializeField] private float feedbackDisplaySeconds = 1.5f;

        [Header("Hint")]
        [SerializeField] private GameObject hintPanel;
        [SerializeField] private TMP_Text hintText;

        [Header("Result")]
        [SerializeField] private GameObject resultPanel;
        [SerializeField] private TMP_Text resultTitleText;
        [SerializeField] private TMP_Text resultScoreText;
        [SerializeField] private GameObject retryButton;
        [SerializeField] private GameObject continueButton;

        [Header("Language Fonts")]
        [SerializeField] private TMP_FontAsset englishFont;
        [SerializeField] private TMP_FontAsset hindiFont;
        [SerializeField] private TMP_FontAsset santaliFont;

        private ScenarioStepData _currentStep;

        private void Start()
        {
            var sm = ScenarioManager.Instance;

            if (sm == null)
            {
                Debug.LogError(
                    "[ScenarioUIController] ScenarioManager not found!"
                );
                return;
            }

            sm.OnStepStarted += HandleStepStarted;
            sm.OnStepCompleted += HandleStepCompleted;
            sm.OnStepTimerTick += HandleTimerTick;
            sm.OnHintRequested += HandleHintRequested;
            sm.OnScenarioEnded += HandleScenarioEnded;

            if (LocalizationManager.Instance != null)
            {
                LocalizationManager.Instance.OnLanguageChanged
                    += HandleLanguageChanged;

                Debug.Log(
                    "[ScenarioUIController] Subscribed to language changes"
                );
            }
            else
            {
                Debug.LogError(
                    "[ScenarioUIController] LocalizationManager.Instance is NULL"
                );
            }

            resultPanel?.SetActive(false);
            correctFeedbackPanel?.SetActive(false);
            incorrectFeedbackPanel?.SetActive(false);
            hintPanel?.SetActive(false);

            ApplyCurrentFonts();
        }

        private void OnDisable()
        {
            var sm = ScenarioManager.Instance;

            if (sm != null)
            {
                sm.OnStepStarted -= HandleStepStarted;
                sm.OnStepCompleted -= HandleStepCompleted;
                sm.OnStepTimerTick -= HandleTimerTick;
                sm.OnHintRequested -= HandleHintRequested;
                sm.OnScenarioEnded -= HandleScenarioEnded;
            }

            if (LocalizationManager.Instance != null)
            {
                LocalizationManager.Instance.OnLanguageChanged
                    -= HandleLanguageChanged;
            }
        }

        // ============================================================
        // LANGUAGE CHANGE
        // ============================================================

        private void HandleLanguageChanged(string languageCode)
        {
            Debug.Log(
                "[ScenarioUIController] LANGUAGE CHANGED: "
                + languageCode
            );

            ApplyCurrentFonts();
            RefreshCurrentStep();
        }

        // ============================================================
        // FONT MANAGEMENT
        // ============================================================

        private TMP_FontAsset GetCurrentFont()
        {
            if (LocalizationManager.Instance == null)
                return englishFont;

            string language =
                LocalizationManager.Instance.CurrentLanguage;

            if (language == LocalizationManager.Hindi)
                return hindiFont;

            if (language == LocalizationManager.Santali)
                return santaliFont;

            return englishFont;
        }

        private void ApplyCurrentFonts()
        {
            TMP_FontAsset currentFont = GetCurrentFont();

            if (currentFont == null)
            {
                Debug.LogWarning(
                    "[ScenarioUIController] Current language font is not assigned."
                );
                return;
            }

            ApplyFont(instructionText);
            ApplyFont(feedbackText);
            ApplyFont(hintText);
            ApplyFont(resultTitleText);
            ApplyFont(resultScoreText);

            Debug.Log(
                "[ScenarioUIController] Applied font: "
                + currentFont.name
                + " | Language: "
                + (
                    LocalizationManager.Instance != null
                        ? LocalizationManager.Instance.CurrentLanguage
                        : "unknown"
                )
            );
        }

        private void ApplyFont(TMP_Text text)
        {
            if (text == null)
                return;

            TMP_FontAsset currentFont = GetCurrentFont();

            if (currentFont != null)
            {
                text.font = currentFont;

                Debug.Log(
                    "[ScenarioUIController] Font applied to "
                    + text.gameObject.name
                    + " = "
                    + currentFont.name
                );
            }
        }

        // ============================================================
        // STEP START
        // ============================================================

        private void HandleStepStarted(ScenarioStepData step)
        {
            _currentStep = step;

            RefreshCurrentStep();

            hintPanel?.SetActive(false);
        }

        // ============================================================
        // REFRESH CURRENT STEP
        // ============================================================

        private void RefreshCurrentStep()
        {
            if (_currentStep == null)
                return;

            if (LocalizationManager.Instance == null)
            {
                Debug.LogWarning(
                    "[ScenarioUIController] LocalizationManager not found."
                );
                return;
            }

            string instructionKey =
                GetStepLocalizationKey(
                    _currentStep,
                    "instruction"
                );

            string localizedInstruction =
                LocalizationManager.Instance.Get(instructionKey);

            if (instructionText != null)
            {
                ApplyFont(instructionText);
                instructionText.text = localizedInstruction;
            }

            Debug.Log(
                "[ScenarioUIController] Instruction key = "
                + instructionKey
                + " | value = "
                + localizedInstruction
            );
        }

        // ============================================================
        // STEP COMPLETED
        // ============================================================

        private void HandleStepCompleted(
            ScenarioStepData step,
            bool wasCorrect,
            string feedback)
        {
            AudioManager.Instance?.PlaySfx(
                wasCorrect
                    ? "step_correct"
                    : "step_incorrect"
            );

            string feedbackKey =
                GetStepLocalizationKey(
                    step,
                    wasCorrect
                        ? "feedback_correct"
                        : "feedback_incorrect"
                );

            string localizedFeedback =
                LocalizationManager.Instance != null
                    ? LocalizationManager.Instance.Get(feedbackKey)
                    : feedback;

            ShowFeedback(
                wasCorrect
                    ? correctFeedbackPanel
                    : incorrectFeedbackPanel,
                localizedFeedback
            );

            Debug.Log(
                "[ScenarioUIController] Feedback key = "
                + feedbackKey
                + " | value = "
                + localizedFeedback
            );
        }

        // ============================================================
        // FEEDBACK
        // ============================================================

        private void ShowFeedback(
            GameObject panel,
            string message)
        {
            if (feedbackText != null)
            {
                ApplyFont(feedbackText);
                feedbackText.text = message;
            }

            panel?.SetActive(true);

            CancelInvoke(nameof(HideFeedbackPanels));

            Invoke(
                nameof(HideFeedbackPanels),
                feedbackDisplaySeconds
            );
        }

        private void HideFeedbackPanels()
        {
            correctFeedbackPanel?.SetActive(false);
            incorrectFeedbackPanel?.SetActive(false);
        }

        // ============================================================
        // TIMER
        // ============================================================

        private void HandleTimerTick(
            ScenarioStepData step,
            float secondsRemaining)
        {
            if (timerText != null)
            {
                timerText.text =
                    Mathf.CeilToInt(secondsRemaining).ToString();
            }
        }

        // ============================================================
        // HINT
        // ============================================================

        private void HandleHintRequested(string hint)
        {
            if (_currentStep == null)
                return;

            string hintKey =
                GetStepLocalizationKey(
                    _currentStep,
                    "hint"
                );

            string localizedHint =
                LocalizationManager.Instance != null
                    ? LocalizationManager.Instance.Get(hintKey)
                    : hint;

            if (hintText != null)
            {
                ApplyFont(hintText);
                hintText.text = localizedHint;
            }

            hintPanel?.SetActive(true);

            Debug.Log(
                "[ScenarioUIController] Hint key = "
                + hintKey
                + " | value = "
                + localizedHint
            );
        }

        // ============================================================
        // RESULT
        // ============================================================

        private void HandleScenarioEnded(
            ScenarioResult result,
            int scorePercent)
        {
            resultPanel?.SetActive(true);

            bool passed =
                result == ScenarioResult.PassedNumeric;

            AudioManager.Instance?.PlaySfx(
                passed
                    ? "scenario_pass"
                    : "scenario_fail"
            );

            string resultKey;

            switch (result)
            {
                case ScenarioResult.PassedNumeric:
                    resultKey = "scenario_result_pass_title";
                    break;

                case ScenarioResult.FailedCriticalError:
                    resultKey = "scenario_result_critical_title";
                    break;

                case ScenarioResult.FailedLowScore:
                    resultKey = "scenario_result_pass_title";
                    break;

                case ScenarioResult.FailedTimeout:
                    resultKey = "scenario_result_critical_title";
                    break;

                default:
                    resultKey = "scenario_result_pass_title";
                    break;
            }

            if (resultTitleText != null)
            {
                ApplyFont(resultTitleText);

                resultTitleText.text =
                    LocalizationManager.Instance != null
                        ? LocalizationManager.Instance.Get(resultKey)
                        : "Scenario Ended";
            }

            if (resultScoreText != null)
            {
                ApplyFont(resultScoreText);

                string scoreLabel =
                    LocalizationManager.Instance != null
                        ? LocalizationManager.Instance.Get(
                            "scenario_result_score_label"
                        )
                        : "Score";

                resultScoreText.text =
                    scoreLabel + ": " + scorePercent + "%";
            }

            retryButton?.SetActive(!passed);
            continueButton?.SetActive(passed);
        }

        // ============================================================
        // RETRY
        // ============================================================

        public void RetryTraining()
        {
            resultPanel?.SetActive(false);
            correctFeedbackPanel?.SetActive(false);
            incorrectFeedbackPanel?.SetActive(false);
            hintPanel?.SetActive(false);

            ScenarioManager.Instance?.RetryScenario();
        }

        // ============================================================
        // KEY BUILDER
        // ============================================================

        private string GetStepLocalizationKey(
            ScenarioStepData step,
            string suffix)
        {
            if (step == null)
                return string.Empty;

            /*
             * The scenario ID is now taken from the currently loaded
             * ScenarioData instead of being hardcoded.
             *
             * Fire:
             * fire_emergency_identify_hazard_instruction
             *
             * Gas:
             * gas_leak_confined_space_identify_leak_instruction
             */

            string scenarioId = "fire_emergency";

            if (ScenarioManager.Instance != null &&
                ScenarioManager.Instance.CurrentScenario != null &&
                !string.IsNullOrEmpty(
                    ScenarioManager.Instance.CurrentScenario.moduleId))
            {
                scenarioId =
                    ScenarioManager.Instance.CurrentScenario.moduleId;
            }

            return scenarioId
                + "_"
                + step.stepId
                + "_"
                + suffix;
        }
    }
}

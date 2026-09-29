using UnityEngine;
using TMPro;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using SIH26041.Localization;

namespace SIH26041.Assessment
{
    /// <summary>
    /// Assessment UI.
    ///
    /// Supports:
    /// - Manual UI wiring
    /// - Automatic UI creation
    /// - English / Hindi / Santali localization
    /// - Dynamic question localization
    /// - Dynamic answer-option localization
    /// - Dynamic feedback localization
    /// - Dynamic result localization
    /// </summary>
    public class AssessmentUIController : MonoBehaviour
    {
        [Header("Optional manual UI wiring")]
        [SerializeField] private GameObject assessmentPanel;
        [SerializeField] private TMP_Text questionNumberText;
        [SerializeField] private TMP_Text questionText;
        [SerializeField] private Button[] answerButtons;
        [SerializeField] private TMP_Text[] answerTexts;
        [SerializeField] private Button nextButton;
        [SerializeField] private TMP_Text feedbackText;
        [SerializeField] private GameObject resultPanel;
        [SerializeField] private TMP_Text resultTitleText;
        [SerializeField] private TMP_Text arScoreText;
        [SerializeField] private TMP_Text safetyScoreText;
        [SerializeField] private TMP_Text quizScoreText;
        [SerializeField] private TMP_Text finalScoreText;
        [SerializeField] private Button retryButton;

        [Header("Localization Fonts")]
        [SerializeField] private TMP_FontAsset englishFont;
        [SerializeField] private TMP_FontAsset hindiFont;
        [SerializeField] private TMP_FontAsset santaliFont;

        private int _selectedAnswer = -1;
        private bool _answered;
        private bool _builtAutomatically;

        private AssessmentQuestionData _currentQuestion;
        private int _currentQuestionIndex = 0;
        private bool? _lastAnswerCorrect = null;

        private void Start()
        {
            var manager = AssessmentManager.Instance;

            if (manager == null)
            {
                Debug.LogError(
                    "[AssessmentUIController] AssessmentManager not found!"
                );
                return;
            }

            manager.OnAssessmentStarted += HandleAssessmentStarted;
            manager.OnQuestionStarted += HandleQuestionStarted;
            manager.OnQuestionAnswered += HandleQuestionAnswered;
            manager.OnAssessmentEnded += HandleAssessmentEnded;

            // Listen for language changes.
            if (LocalizationManager.Instance != null)
            {
                LocalizationManager.Instance.OnLanguageChanged
                    += HandleLanguageChanged;

                Debug.Log(
                    "[AssessmentUIController] Subscribed to language changes."
                );
            }
            else
            {
                Debug.LogError(
                    "[AssessmentUIController] LocalizationManager not found!"
                );
            }

            if (assessmentPanel == null)
                BuildDefaultUI();
            else
                SetupManualUI();

            assessmentPanel?.SetActive(false);
            resultPanel?.SetActive(false);
        }

        private void OnDestroy()
        {
            var manager = AssessmentManager.Instance;

            if (manager != null)
            {
                manager.OnAssessmentStarted -= HandleAssessmentStarted;
                manager.OnQuestionStarted -= HandleQuestionStarted;
                manager.OnQuestionAnswered -= HandleQuestionAnswered;
                manager.OnAssessmentEnded -= HandleAssessmentEnded;
            }

            if (LocalizationManager.Instance != null)
            {
                LocalizationManager.Instance.OnLanguageChanged
                    -= HandleLanguageChanged;
            }
        }

        // =========================================================
        // MANUAL UI SETUP
        // =========================================================

        private void SetupManualUI()
        {
            if (nextButton != null)
            {
                nextButton.gameObject.SetActive(false);

                nextButton.onClick.RemoveAllListeners();
                nextButton.onClick.AddListener(SubmitSelectedAnswer);
            }

            if (retryButton != null)
            {
                retryButton.onClick.RemoveAllListeners();
                retryButton.onClick.AddListener(RetryAssessment);
            }
        }

        // =========================================================
        // AUTOMATIC UI CREATION
        // =========================================================

        private void BuildDefaultUI()
        {
            _builtAutomatically = true;

            Canvas canvas = GetComponentInParent<Canvas>();

            if (canvas == null)
                canvas = FindFirstObjectByType<Canvas>();

            if (canvas == null)
            {
                var canvasObject =
                    new GameObject("AssessmentCanvas");

                canvas =
                    canvasObject.AddComponent<Canvas>();

                canvas.renderMode =
                    RenderMode.ScreenSpaceOverlay;

                canvasObject.AddComponent<CanvasScaler>();
                canvasObject.AddComponent<GraphicRaycaster>();
            }

            if (EventSystem.current == null)
            {
                var eventSystem =
                    new GameObject("AssessmentEventSystem");

                eventSystem.AddComponent<EventSystem>();

                eventSystem.AddComponent<
                    UnityEngine.InputSystem.UI.InputSystemUIInputModule>();
            }

            // -----------------------------------------------------
            // Assessment Panel
            // -----------------------------------------------------

            assessmentPanel =
                CreatePanel(
                    "AssessmentPanel",
                    canvas.transform
                );

            SetFullScreen(
                assessmentPanel.GetComponent<RectTransform>()
            );

            var title =
                CreateText(
                    "AssessmentTitle",
                    assessmentPanel.transform,
                    GetLocalizedText(
                        "assessment_title",
                        "FIRE SAFETY ASSESSMENT"
                    ),
                    48
                );

            SetRect(
                title.rectTransform,
                0,
                -55,
                900,
                80,
                TextAnchor.MiddleCenter
            );

            questionNumberText =
                CreateText(
                    "QuestionNumber",
                    assessmentPanel.transform,
                    GetLocalizedText(
                        "quiz_question_number",
                        "Question 1"
                    ),
                    32
                );

            SetRect(
                questionNumberText.rectTransform,
                0,
                -135,
                900,
                60,
                TextAnchor.MiddleCenter
            );

            questionText =
                CreateText(
                    "QuestionText",
                    assessmentPanel.transform,
                    "Question",
                    34
                );

            SetRect(
                questionText.rectTransform,
                0,
                -250,
                1000,
                150,
                TextAnchor.MiddleCenter
            );

            answerButtons = new Button[4];
            answerTexts = new TMP_Text[4];

            for (int i = 0; i < 4; i++)
            {
                int row = i;

                Button button =
                    CreateButton(
                        $"AnswerButton{i + 1}",
                        assessmentPanel.transform
                    );

                SetRect(
                    button.GetComponent<RectTransform>(),
                    0,
                    -390 - row * 105,
                    1000,
                    85,
                    TextAnchor.MiddleCenter
                );

                TMP_Text buttonText =
                    button.GetComponentInChildren<TMP_Text>();

                answerButtons[i] = button;
                answerTexts[i] = buttonText;
            }

            feedbackText =
                CreateText(
                    "FeedbackText",
                    assessmentPanel.transform,
                    GetLocalizedText(
                        "quiz_select_answer",
                        "Select one answer."
                    ),
                    26
                );

            SetRect(
                feedbackText.rectTransform,
                0,
                40,
                900,
                55,
                TextAnchor.MiddleCenter
            );

            nextButton =
                CreateButton(
                    "NextButton",
                    assessmentPanel.transform
                );

            SetRect(
                nextButton.GetComponent<RectTransform>(),
                0,
                125,
                360,
                75,
                TextAnchor.MiddleCenter
            );

            nextButton.GetComponentInChildren<TMP_Text>().text =
                GetLocalizedText(
                    "quiz_next_button",
                    "NEXT"
                );

            nextButton.onClick.AddListener(
                SubmitSelectedAnswer
            );

            nextButton.gameObject.SetActive(false);

            // -----------------------------------------------------
            // Result Panel
            // -----------------------------------------------------

            resultPanel =
                CreatePanel(
                    "AssessmentResultPanel",
                    canvas.transform
                );

            SetFullScreen(
                resultPanel.GetComponent<RectTransform>()
            );

            resultTitleText =
                CreateText(
                    "ResultTitle",
                    resultPanel.transform,
                    GetLocalizedText(
                        "assessment_result_title",
                        "ASSESSMENT RESULT"
                    ),
                    52
                );

            SetRect(
                resultTitleText.rectTransform,
                0,
                -80,
                1000,
                90,
                TextAnchor.MiddleCenter
            );

            arScoreText =
                CreateText(
                    "ARScore",
                    resultPanel.transform,
                    "AR Performance (50%): 0%",
                    30
                );

            SetRect(
                arScoreText.rectTransform,
                0,
                -200,
                900,
                60,
                TextAnchor.MiddleCenter
            );

            safetyScoreText =
                CreateText(
                    "SafetyScore",
                    resultPanel.transform,
                    "Safety Decisions (30%): 0%",
                    30
                );

            SetRect(
                safetyScoreText.rectTransform,
                0,
                -270,
                900,
                60,
                TextAnchor.MiddleCenter
            );

            quizScoreText =
                CreateText(
                    "QuizScore",
                    resultPanel.transform,
                    "Safety Quiz (20%): 0%",
                    30
                );

            SetRect(
                quizScoreText.rectTransform,
                0,
                -340,
                900,
                60,
                TextAnchor.MiddleCenter
            );

            finalScoreText =
                CreateText(
                    "FinalScore",
                    resultPanel.transform,
                    "Final Score: 0%",
                    42
                );

            SetRect(
                finalScoreText.rectTransform,
                0,
                -430,
                900,
                70,
                TextAnchor.MiddleCenter
            );

            retryButton =
                CreateButton(
                    "RetryAssessmentButton",
                    resultPanel.transform
                );

            SetRect(
                retryButton.GetComponent<RectTransform>(),
                0,
                -550,
                420,
                80,
                TextAnchor.MiddleCenter
            );

            retryButton.GetComponentInChildren<TMP_Text>().text =
                GetLocalizedText(
                    "quiz_retry_button",
                    "RETRY TRAINING"
                );

            retryButton.onClick.AddListener(
                RetryAssessment
            );
        }

        // =========================================================
        // ASSESSMENT START
        // =========================================================

        private void HandleAssessmentStarted(
            AssessmentQuizData quiz)
        {
            assessmentPanel?.SetActive(true);
            resultPanel?.SetActive(false);

            _currentQuestion = null;
            _currentQuestionIndex = 0;
            _lastAnswerCorrect = null;

            if (feedbackText != null)
            {
                feedbackText.text =
                    GetLocalizedText(
                        "quiz_select_answer",
                        "Select one answer."
                    );
            }
        }

        // =========================================================
        // QUESTION START
        // =========================================================

        private void HandleQuestionStarted(
            AssessmentQuestionData question,
            int index)
        {
            _currentQuestion = question;
            _currentQuestionIndex = index;
            _lastAnswerCorrect = null;

            _selectedAnswer = -1;
            _answered = false;

            ApplyQuestionLocalization();

            if (nextButton != null)
                nextButton.gameObject.SetActive(false);

            if (feedbackText != null)
            {
                feedbackText.text =
                    GetLocalizedText(
                        "quiz_select_answer",
                        "Select one answer."
                    );
            }
        }

        // =========================================================
        // APPLY QUESTION LOCALIZATION
        // =========================================================

        private void ApplyQuestionLocalization()
        {
            if (_currentQuestion == null)
                return;

            // Question number
            if (questionNumberText != null)
            {
                string questionLabel =
                    GetLocalizedText(
                        "quiz_question_number",
                        "Question"
                    );

                questionNumberText.text =
                    questionLabel
                    + " "
                    + (_currentQuestionIndex + 1);
            }

            // Question
            if (questionText != null)
            {
                questionText.text =
                    GetLocalizedText(
                        _currentQuestion.question,
                        _currentQuestion.question
                    );
            }

            // Options
            if (answerButtons == null)
                return;

            for (int i = 0;
                 i < answerButtons.Length;
                 i++)
            {
                bool exists =
                    _currentQuestion.options != null
                    && i < _currentQuestion.options.Length;

                if (answerButtons[i] == null)
                    continue;

                answerButtons[i].gameObject.SetActive(exists);
                answerButtons[i].interactable = exists;

                answerButtons[i].onClick.RemoveAllListeners();

                if (!exists)
                    continue;

                if (i < answerTexts.Length
                    && answerTexts[i] != null)
                {
                    string optionKey =
                        _currentQuestion.options[i];

                    answerTexts[i].text =
                        GetLocalizedText(
                            optionKey,
                            optionKey
                        );
                }

                int capturedIndex = i;

                answerButtons[i].onClick.AddListener(
                    () => SelectAnswer(capturedIndex)
                );
            }
        }

        // =========================================================
        // SELECT ANSWER
        // =========================================================

        private void SelectAnswer(int index)
        {
            if (_answered)
                return;

            _selectedAnswer = index;
            _answered = true;

            AssessmentManager.Instance?.SubmitAnswer(
                _selectedAnswer
            );
        }

        private void SubmitSelectedAnswer()
        {
            if (_answered || _selectedAnswer < 0)
                return;

            _answered = true;

            AssessmentManager.Instance?.SubmitAnswer(
                _selectedAnswer
            );
        }

        // =========================================================
        // ANSWER RESULT
        // =========================================================

        private void HandleQuestionAnswered(
            AssessmentQuestionData question,
            bool correct)
        {
            _lastAnswerCorrect = correct;

            if (feedbackText != null)
            {
                feedbackText.text =
                    correct
                        ? GetLocalizedText(
                            "quiz_feedback_correct",
                            "Correct!"
                        )
                        : GetLocalizedText(
                            "quiz_feedback_incorrect",
                            "Incorrect."
                        );
            }
        }

        private void ApplyCurrentFontToAllTexts()
        {
            ApplyCurrentFont(questionNumberText);
            ApplyCurrentFont(questionText);
            ApplyCurrentFont(feedbackText);

            ApplyCurrentFont(resultTitleText);
            ApplyCurrentFont(arScoreText);
            ApplyCurrentFont(safetyScoreText);
            ApplyCurrentFont(quizScoreText);
            ApplyCurrentFont(finalScoreText);

            if (answerTexts != null)
            {
                foreach (TMP_Text answerText in answerTexts)
                {
                    ApplyCurrentFont(answerText);
                }
            }

            if (nextButton != null)
            {
                ApplyCurrentFont(
                    nextButton.GetComponentInChildren<TMP_Text>()
                );
            }

            if (retryButton != null)
            {
                ApplyCurrentFont(
                    retryButton.GetComponentInChildren<TMP_Text>()
                );
            }
        }

        // =========================================================
        // LANGUAGE CHANGE
        // =========================================================

        private void HandleLanguageChanged(string languageCode)
        {
            Debug.Log(
                "[AssessmentUIController] LANGUAGE CHANGED: "
                + languageCode
            );

            // Change fonts first.
            ApplyCurrentFontToAllTexts();

            // Update static/generated UI labels.
            UpdateStaticTexts();

            // Update current question and options.
            if (_currentQuestion != null)
                ApplyQuestionLocalization();

            // Update current feedback.
            if (_lastAnswerCorrect.HasValue
                && feedbackText != null)
            {
                feedbackText.text =
                    _lastAnswerCorrect.Value
                        ? GetLocalizedText(
                            "quiz_feedback_correct",
                            "Correct!"
                        )
                        : GetLocalizedText(
                            "quiz_feedback_incorrect",
                            "Incorrect."
                        );
            }
            else if (feedbackText != null
                     && assessmentPanel != null
                     && assessmentPanel.activeSelf)
            {
                feedbackText.text =
                    GetLocalizedText(
                        "quiz_select_answer",
                        "Select one answer."
                    );
            }
        }

        // =========================================================
        // STATIC TEXT UPDATE
        // =========================================================

        private void UpdateStaticTexts()
        {
            if (questionNumberText != null
                && _currentQuestion == null)
            {
                questionNumberText.text =
                    GetLocalizedText(
                        "quiz_question_number",
                        "Question 1"
                    );
            }

            if (nextButton != null)
            {
                TMP_Text nextText =
                    nextButton.GetComponentInChildren<TMP_Text>();

                if (nextText != null)
                {
                    nextText.text =
                        GetLocalizedText(
                            "quiz_next_button",
                            "NEXT"
                        );
                }
            }

            if (retryButton != null)
            {
                TMP_Text retryText =
                    retryButton.GetComponentInChildren<TMP_Text>();

                if (retryText != null)
                {
                    retryText.text =
                        GetLocalizedText(
                            "quiz_retry_button",
                            "RETRY TRAINING"
                        );
                }
            }

            if (resultTitleText != null)
            {
                resultTitleText.text =
                    GetLocalizedText(
                        "assessment_result_title",
                        "ASSESSMENT RESULT"
                    );
            }
        }

        // =========================================================
        // ASSESSMENT END
        // =========================================================

        private void HandleAssessmentEnded(
            int arScore,
            int safetyScore,
            int quizScore,
            int finalScore,
            AssessmentResult result)
        {
            assessmentPanel?.SetActive(false);
            resultPanel?.SetActive(true);

            if (arScoreText != null)
            {
                arScoreText.text =
                    GetLocalizedText(
                        "assessment_ar_score",
                        "AR Performance (50%)"
                    )
                    + ": "
                    + arScore
                    + "%";
            }

            if (safetyScoreText != null)
            {
                safetyScoreText.text =
                    GetLocalizedText(
                        "assessment_safety_score",
                        "Safety Decisions (30%)"
                    )
                    + ": "
                    + safetyScore
                    + "%";
            }

            if (quizScoreText != null)
            {
                quizScoreText.text =
                    GetLocalizedText(
                        "assessment_quiz_score",
                        "Safety Quiz (20%)"
                    )
                    + ": "
                    + quizScore
                    + "%";
            }

            if (finalScoreText != null)
            {
                finalScoreText.text =
                    GetLocalizedText(
                        "assessment_final_score",
                        "Final Score"
                    )
                    + ": "
                    + finalScore
                    + "%";
            }

            if (resultTitleText != null)
            {
                resultTitleText.text =
                    GetResultTitle(result);
            }

            if (retryButton != null)
            {
                retryButton.gameObject.SetActive(
                    result != AssessmentResult.Passed
                );
            }
        }

        // =========================================================
        // RESULT TITLE
        // =========================================================

        private string GetResultTitle(
            AssessmentResult result)
        {
            switch (result)
            {
                case AssessmentResult.Passed:
                    return GetLocalizedText(
                        "assessment_passed",
                        "ASSESSMENT PASSED"
                    );

                case AssessmentResult.CriticalFailure:
                    return GetLocalizedText(
                        "assessment_critical_failure",
                        "CRITICAL SAFETY FAILURE"
                    );

                default:
                    return GetLocalizedText(
                        "assessment_failed",
                        "ASSESSMENT FAILED"
                    );
            }
        }

        // =========================================================
        // RETRY
        // =========================================================

        private void RetryAssessment()
        {
            assessmentPanel?.SetActive(false);
            resultPanel?.SetActive(false);

            _currentQuestion = null;
            _currentQuestionIndex = 0;
            _lastAnswerCorrect = null;

            AssessmentManager.Instance?.RetryAssessment();
        }

        // =========================================================
        // LOCALIZATION HELPER
        // =========================================================

        private string GetLocalizedText(
            string key,
            string fallback)
        {
            if (string.IsNullOrEmpty(key))
                return fallback;

            if (LocalizationManager.Instance == null)
                return fallback;

            string value =
                LocalizationManager.Instance.Get(key);

            // Missing key returns [key].
            if (string.IsNullOrEmpty(value)
                || value == "[" + key + "]")
            {
                return fallback;
            }

            return value;
        }

        // =========================================================
        // UI CREATION HELPERS
        // =========================================================

        private static GameObject CreatePanel(
            string name,
            Transform parent)
        {
            var go =
                new GameObject(
                    name,
                    typeof(RectTransform),
                    typeof(Image)
                );

            go.transform.SetParent(
                parent,
                false
            );

            var image =
                go.GetComponent<Image>();

            image.color =
                new Color(
                    0.05f,
                    0.05f,
                    0.05f,
                    0.96f
                );

            return go;
        }

        private TMP_FontAsset GetCurrentFont()
        {
            if (LocalizationManager.Instance == null)
                return englishFont;

            switch (LocalizationManager.Instance.CurrentLanguage)
            {
                case LocalizationManager.Hindi:
                    return hindiFont != null ? hindiFont : englishFont;

                case LocalizationManager.Santali:
                    return santaliFont != null ? santaliFont : englishFont;

                case LocalizationManager.English:
                default:
                    return englishFont;
            }
        }

        private void ApplyCurrentFont(TMP_Text text)
        {
            if (text == null)
                return;

            TMP_FontAsset font = GetCurrentFont();

            if (font != null)
                text.font = font;
        }

        private TMP_Text CreateText(
    string name,
    Transform parent,
    string text,
    float size)
        {
            var go =
                new GameObject(
                    name,
                    typeof(RectTransform)
                );

            go.transform.SetParent(
                parent,
                false
            );

            var tmp =
                go.AddComponent<TextMeshProUGUI>();

            tmp.text = text;
            tmp.fontSize = size;
            tmp.alignment =
                TextAlignmentOptions.Center;
            tmp.enableWordWrapping = true;
            tmp.raycastTarget = false;

            ApplyCurrentFont(tmp);

            return tmp;
        }

        private  Button CreateButton(
            string name,
            Transform parent)
        {
            var go =
                new GameObject(
                    name,
                    typeof(RectTransform),
                    typeof(Image),
                    typeof(Button)
                );

            go.transform.SetParent(
                parent,
                false
            );

            var image =
                go.GetComponent<Image>();

            image.color =
                new Color(
                    0.15f,
                    0.15f,
                    0.15f,
                    1f
                );

            var text =
                CreateText(
                    "Label",
                    go.transform,
                    "Answer",
                    27
                );

            SetFullScreen(
                text.rectTransform
            );

            return go.GetComponent<Button>();
        }

        private static void SetFullScreen(
            RectTransform rt)
        {
            rt.anchorMin =
                Vector2.zero;

            rt.anchorMax =
                Vector2.one;

            rt.offsetMin =
                Vector2.zero;

            rt.offsetMax =
                Vector2.zero;
        }

        private static void SetRect(
            RectTransform rt,
            float x,
            float y,
            float width,
            float height,
            TextAnchor anchor)
        {
            rt.anchorMin =
                new Vector2(
                    0.5f,
                    1f
                );

            rt.anchorMax =
                new Vector2(
                    0.5f,
                    1f
                );

            rt.pivot =
                new Vector2(
                    0.5f,
                    0.5f
                );

            rt.anchoredPosition =
                new Vector2(
                    x,
                    y
                );

            rt.sizeDelta =
                new Vector2(
                    width,
                    height
                );
        }
    }
}
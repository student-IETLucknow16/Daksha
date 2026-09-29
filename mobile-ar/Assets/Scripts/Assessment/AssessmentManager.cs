using System;
using UnityEngine;
using SIH26041.Scenarios;

namespace SIH26041.Assessment
{
    public enum AssessmentResult
    {
        InProgress,
        Passed,
        Failed,
        CriticalFailure
    }

    /// <summary>
    /// Combines the completed Fire scenario score with a safety-decision score
    /// and a five-question safety quiz.
    /// Weights: AR performance 50%, safety decisions 30%, quiz 20%.
    /// A critical scenario failure always fails the assessment.
    /// </summary>
    public class AssessmentManager : MonoBehaviour
    {
        public static AssessmentManager Instance { get; private set; }

        [SerializeField] private string quizResourcePath = "Assessments/fire_assessment";
        [SerializeField] private int passingScore = 40;
        [SerializeField] private GameObject scenarioResultPanel;

        public event Action<AssessmentQuizData> OnAssessmentStarted;
        public event Action<AssessmentQuestionData, int> OnQuestionStarted;
        public event Action<AssessmentQuestionData, bool> OnQuestionAnswered;
        public event Action<int, int, int, int, AssessmentResult> OnAssessmentEnded;

        public AssessmentQuizData CurrentQuiz { get; private set; }
        public int CurrentQuestionIndex { get; private set; } = -1;
        public int CorrectAnswers { get; private set; }
        public int QuizScorePercent { get; private set; }
        public int ARPerformancePercent { get; private set; }
        public int SafetyDecisionPercent { get; private set; }
        public int FinalScorePercent { get; private set; }
        public AssessmentResult Result { get; private set; } = AssessmentResult.InProgress;

        private bool _assessmentActive;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
        }

        private void Start()
        {
            SubscribeToScenario();
        }

        private void SubscribeToScenario()
        {
            var scenario = ScenarioManager.Instance;

            if (scenario == null)
            {
                Debug.LogError("[AssessmentManager] ScenarioManager not found!");
                return;
            }

            scenario.OnScenarioEnded -= HandleScenarioEnded;
            scenario.OnScenarioEnded += HandleScenarioEnded;

            Debug.Log("[AssessmentManager] Successfully subscribed to ScenarioManager.");
        }

        private void OnDestroy()
        {
            var scenario = ScenarioManager.Instance;
            if (scenario != null)
                scenario.OnScenarioEnded -= HandleScenarioEnded;
        }

        private void HandleScenarioEnded(ScenarioResult result, int scorePercent)
        {
            Debug.Log($"[AssessmentManager] Scenario ended: {result}, Score: {scorePercent}%");

            ARPerformancePercent = Mathf.Clamp(scorePercent, 0, 100);

            if (result == ScenarioResult.FailedCriticalError)
            {
                Result = AssessmentResult.CriticalFailure;
                SafetyDecisionPercent = CalculateSafetyDecisionScore();
                QuizScorePercent = 0;
                FinalScorePercent = CalculateFinalScore();
                OnAssessmentEnded?.Invoke(ARPerformancePercent, SafetyDecisionPercent,
                    QuizScorePercent, FinalScorePercent, Result);
                return;
            }

            if (result != ScenarioResult.PassedNumeric)
                return;

            if (scenarioResultPanel != null)
                scenarioResultPanel.SetActive(false);

            BeginAssessment();
        }

        public void BeginAssessment()
        {
            CurrentQuiz = AssessmentQuizData.LoadFromResources(quizResourcePath);
            if (CurrentQuiz == null || CurrentQuiz.questions == null || CurrentQuiz.questions.Length == 0)
            {
                Debug.LogError("[AssessmentManager] No valid assessment quiz found.");
                return;
            }

            passingScore = CurrentQuiz.passingScore > 0 ? CurrentQuiz.passingScore : passingScore;
            CurrentQuestionIndex = -1;
            CorrectAnswers = 0;
            QuizScorePercent = 0;
            Result = AssessmentResult.InProgress;
            _assessmentActive = true;

            SafetyDecisionPercent = CalculateSafetyDecisionScore();
            OnAssessmentStarted?.Invoke(CurrentQuiz);
            AdvanceQuestion();
        }

        private void AdvanceQuestion()
        {
            CurrentQuestionIndex++;

            if (CurrentQuestionIndex >= CurrentQuiz.questions.Length)
            {
                FinishAssessment();
                return;
            }

            OnQuestionStarted?.Invoke(CurrentQuiz.questions[CurrentQuestionIndex], CurrentQuestionIndex);
        }

        public void SubmitAnswer(int selectedOptionIndex)
        {
            if (!_assessmentActive || CurrentQuiz == null || CurrentQuestionIndex < 0 ||
                CurrentQuestionIndex >= CurrentQuiz.questions.Length)
                return;

            var question = CurrentQuiz.questions[CurrentQuestionIndex];
            bool correct = selectedOptionIndex == question.correctOptionIndex;

            if (correct)
                CorrectAnswers++;

            OnQuestionAnswered?.Invoke(question, correct);
            AdvanceQuestion();
        }

        private void FinishAssessment()
        {
            _assessmentActive = false;

            QuizScorePercent = CurrentQuiz.questions.Length > 0
                ? Mathf.RoundToInt((CorrectAnswers / (float)CurrentQuiz.questions.Length) * 100f)
                : 0;

            SafetyDecisionPercent = CalculateSafetyDecisionScore();
            FinalScorePercent = CalculateFinalScore();

            Result = FinalScorePercent >= passingScore
                ? AssessmentResult.Passed
                : AssessmentResult.Failed;

            // Scenario critical failure has absolute priority.
            if (ScenarioManager.Instance != null &&
                ScenarioManager.Instance.Result == ScenarioResult.FailedCriticalError)
            {
                Result = AssessmentResult.CriticalFailure;
            }

            OnAssessmentEnded?.Invoke(
                ARPerformancePercent,
                SafetyDecisionPercent,
                QuizScorePercent,
                FinalScorePercent,
                Result);
        }

        private int CalculateFinalScore()
        {
            return Mathf.RoundToInt(
                ARPerformancePercent * 0.50f +
                SafetyDecisionPercent * 0.30f +
                QuizScorePercent * 0.20f);
        }

        private int CalculateSafetyDecisionScore()
        {
            var scenario = ScenarioManager.Instance;
            if (scenario == null)
                return 0;

            // Safety decisions are the key procedural decisions in Module 1.
            // Start at 100 and deduct for recorded wrong/timed-out actions.
            int score = 100;
            foreach (string mistake in scenario.MistakesLog)
            {
                if (mistake.StartsWith("raise_alarm:")) score -= 25;
                else if (mistake.StartsWith("select_extinguisher:")) score -= 25;
                else if (mistake.StartsWith("find_exit:")) score -= 20;
                else if (mistake.StartsWith("extinguish_fire:")) score -= 20;
                else if (mistake.StartsWith("avoid_hazard_zone:")) score -= 100;
                else score -= 10;
            }

            return Mathf.Clamp(score, 0, 100);
        }

        public void RetryAssessment()
        {
            if (ScenarioManager.Instance != null)
            {
                ScenarioManager.Instance.RetryScenario();
                return;
            }

            BeginAssessment();
        }
    }
}

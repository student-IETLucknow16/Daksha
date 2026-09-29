using System;
using UnityEngine;
using UnityEngine.Networking;
using SIH26041.Scenarios;

namespace SIH26041.Training
{
    public class TrainingResultSender : MonoBehaviour
    {
        public static TrainingResultSender Instance { get; private set; }

        [Serializable]
        private class MistakesWrapper
        {
            public string[] mistakes;
        }

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        private void OnEnable()
        {
            SubscribeToScenarioManager();
        }

        private void OnDisable()
        {
            if (ScenarioManager.Instance != null)
            {
                ScenarioManager.Instance.OnScenarioEnded -= HandleScenarioEnded;
            }
        }

        private void Start()
        {
            SubscribeToScenarioManager();
        }

        private void SubscribeToScenarioManager()
        {
            if (ScenarioManager.Instance == null)
            {
                Debug.LogWarning(
                    "[TrainingResultSender] ScenarioManager not ready yet."
                );

                return;
            }

            ScenarioManager.Instance.OnScenarioEnded -= HandleScenarioEnded;
            ScenarioManager.Instance.OnScenarioEnded += HandleScenarioEnded;

            Debug.Log(
                "[TrainingResultSender] Connected to ScenarioManager."
            );
        }

        private void HandleScenarioEnded(
            ScenarioResult result,
            int score
        )
        {
            Debug.Log(
                "[TrainingResultSender] Scenario ended. Result: "
                + result +
                ", Score: " +
                score
            );

            string backendResult;

            switch (result)
            {
                case ScenarioResult.PassedNumeric:
                    backendResult = "passed";
                    break;

                case ScenarioResult.FailedCriticalError:
                    backendResult = "failed_critical";
                    break;

                case ScenarioResult.FailedTimeout:
                    backendResult = "failed_timeout";
                    break;

                case ScenarioResult.FailedLowScore:
                    backendResult = "failed";
                    break;

                default:
                    Debug.LogWarning(
                        "[TrainingResultSender] Unknown scenario result."
                    );

                    return;
            }

            // --------------------------------
            // Convert mistakes to JSON
            // --------------------------------

            string mistakesJson = "[]";

            if (
                ScenarioManager.Instance != null &&
                ScenarioManager.Instance.MistakesLog != null
            )
            {
                MistakesWrapper wrapper =
                    new MistakesWrapper
                    {
                        mistakes =
                            ScenarioManager.Instance
                                .MistakesLog
                                .ToArray()
                    };

                mistakesJson = JsonUtility.ToJson(wrapper);

                int startIndex =
                    mistakesJson.IndexOf('[');

                int endIndex =
                    mistakesJson.LastIndexOf(']');

                if (
                    startIndex >= 0 &&
                    endIndex >= startIndex
                )
                {
                    mistakesJson =
                        mistakesJson.Substring(
                            startIndex,
                            endIndex - startIndex + 1
                        );
                }
            }

            SendResult(
                score,
                backendResult,
                mistakesJson
            );
        }

        public void SendResult(
            int score,
            string result,
            string mistakes
        )
        {
            // --------------------------------
            // Make sure deep-link handler exists
            // --------------------------------

            if (
                TrainingDeepLinkHandler.Instance == null
            )
            {
                Debug.LogError(
                    "[TrainingResultSender] " +
                    "TrainingDeepLinkHandler not found."
                );

                return;
            }

            // --------------------------------
            // Get module ID
            // --------------------------------

            string moduleId =
                TrainingDeepLinkHandler
                    .Instance
                    .ModuleId;

            // --------------------------------
            // Get attempt ID
            // --------------------------------

            string attemptId =
                TrainingDeepLinkHandler
                    .Instance
                    .AttemptId;

            // --------------------------------
            // Validate IDs
            // --------------------------------

            if (string.IsNullOrEmpty(moduleId))
            {
                Debug.LogError(
                    "[TrainingResultSender] " +
                    "Module ID is missing."
                );

                return;
            }

            if (string.IsNullOrEmpty(attemptId))
            {
                Debug.LogError(
                    "[TrainingResultSender] " +
                    "Attempt ID is missing."
                );

                return;
            }

            Debug.Log(
                "[TrainingResultSender] Module ID: "
                + moduleId
            );

            Debug.Log(
                "[TrainingResultSender] Attempt ID: "
                + attemptId
            );

            // --------------------------------
            // Encode URL parameters
            // --------------------------------

            string encodedModuleId =
                UnityWebRequest.EscapeURL(moduleId);

            string encodedAttemptId =
                UnityWebRequest.EscapeURL(attemptId);

            string encodedResult =
                UnityWebRequest.EscapeURL(result);

            string encodedMistakes =
                UnityWebRequest.EscapeURL(
                    mistakes ?? "[]"
                );

            // --------------------------------
            // Build Expo deep link
            // --------------------------------

            string url =
                "sih26041app://training-result" +
                "?moduleId=" +
                encodedModuleId +
                "&attemptId=" +
                encodedAttemptId +
                "&score=" +
                score +
                "&result=" +
                encodedResult +
                "&mistakes=" +
                encodedMistakes;

            // --------------------------------
            // Log final URL
            // --------------------------------

            Debug.Log(
                "[TrainingResultSender] Sending result: "
                + url
            );

            // --------------------------------
            // Open Expo application
            // --------------------------------

            Application.OpenURL(url);
        }
    }
}


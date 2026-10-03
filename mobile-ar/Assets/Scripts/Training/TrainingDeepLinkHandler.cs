using UnityEngine;
using System;
using SIH26041.Scenarios;

namespace SIH26041.Training
{
    public class TrainingDeepLinkHandler : MonoBehaviour
    {
        public static TrainingDeepLinkHandler Instance { get; private set; }

        public string ModuleId { get; private set; }
        public string AttemptId { get; private set; }

        public bool HasTrainingLaunchData =>
            !string.IsNullOrEmpty(ModuleId) &&
            !string.IsNullOrEmpty(AttemptId);

        private string pendingUrl;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);

            Application.deepLinkActivated += HandleDeepLink;

            Debug.Log(
                "[TrainingDeepLinkHandler] Awake."
            );

            Debug.Log(
                "[TrainingDeepLinkHandler] Application.absoluteURL: "
                + Application.absoluteURL
            );

            if (!string.IsNullOrEmpty(Application.absoluteURL))
            {
                pendingUrl = Application.absoluteURL;
            }
        }

        private void Start()
        {
            Debug.Log(
                "[TrainingDeepLinkHandler] Start."
            );

            if (!string.IsNullOrEmpty(pendingUrl))
            {
                HandleDeepLink(pendingUrl);
                pendingUrl = null;
            }

            if (HasTrainingLaunchData)
            {
                ApplyModuleToScenario();
            }
        }

        private void OnDestroy()
        {
            Application.deepLinkActivated -= HandleDeepLink;
        }

        private void HandleDeepLink(string url)
        {
            Debug.Log(
                "[TrainingDeepLinkHandler] Deep link received: "
                + url
            );

            if (string.IsNullOrEmpty(url))
            {
                Debug.LogError(
                    "[TrainingDeepLinkHandler] Received empty URL."
                );

                return;
            }

            if (!url.StartsWith(
                "sih26041://training",
                StringComparison.OrdinalIgnoreCase))
            {
                Debug.LogWarning(
                    "[TrainingDeepLinkHandler] Ignoring unknown URL: "
                    + url
                );

                return;
            }

            Uri uri;

            try
            {
                uri = new Uri(url);
            }
            catch (Exception error)
            {
                Debug.LogError(
                    "[TrainingDeepLinkHandler] Invalid URL: "
                    + error.Message
                );

                return;
            }

            ModuleId =
                GetQueryParameter(
                    uri,
                    "moduleId"
                );

            AttemptId =
                GetQueryParameter(
                    uri,
                    "attemptId"
                );

            Debug.Log(
                "[TrainingDeepLinkHandler] Module ID: "
                + ModuleId
            );

            Debug.Log(
                "[TrainingDeepLinkHandler] Attempt ID: "
                + AttemptId
            );

            if (!string.IsNullOrEmpty(ModuleId) &&
                !string.IsNullOrEmpty(AttemptId))
            {
                Debug.Log(
                    "[TrainingDeepLinkHandler] " +
                    "Training launch data received successfully."
                );

                ApplyModuleToScenario();
            }
            else
            {
                Debug.LogError(
                    "[TrainingDeepLinkHandler] " +
                    "Module ID or Attempt ID is missing."
                );
            }
        }

        private string GetQueryParameter(
            Uri uri,
            string key
        )
        {
            string query = uri.Query;

            Debug.Log(
                "[TrainingDeepLinkHandler] Query: "
                + query
            );

            if (string.IsNullOrEmpty(query))
            {
                return null;
            }

            if (query.StartsWith("?"))
            {
                query = query.Substring(1);
            }

            string[] parameters =
                query.Split('&');

            foreach (string parameter in parameters)
            {
                string[] parts =
                    parameter.Split(
                        new[] { '=' },
                        2
                    );

                if (parts.Length != 2)
                {
                    continue;
                }

                string parameterKey =
                    Uri.UnescapeDataString(
                        parts[0]
                    );

                string parameterValue =
                    Uri.UnescapeDataString(
                        parts[1]
                    );

                Debug.Log(
                    "[TrainingDeepLinkHandler] " +
                    "Parameter: " +
                    parameterKey +
                    " = " +
                    parameterValue
                );

                if (string.Equals(
                    parameterKey,
                    key,
                    StringComparison.OrdinalIgnoreCase))
                {
                    return parameterValue;
                }
            }

            return null;
        }

        public void ApplyModuleToScenario()
        {
            if (!HasTrainingLaunchData)
            {
                Debug.LogWarning(
                    "[TrainingDeepLinkHandler] " +
                    "Cannot apply scenario because " +
                    "training launch data is incomplete."
                );

                return;
            }

            if (ScenarioManager.Instance == null)
            {
                Debug.LogWarning(
                    "[TrainingDeepLinkHandler] " +
                    "ScenarioManager is not ready yet. " +
                    "Will retry."
                );

                Invoke(
                    nameof(RetryApplyModuleToScenario),
                    0.5f
                );

                return;
            }

            bool applied =
                ScenarioManager.Instance
                    .SetScenarioByModuleId(
                        ModuleId
                    );

            if (applied)
            {
                Debug.Log(
                    "[TrainingDeepLinkHandler] " +
                    "Scenario selected: " +
                    ModuleId
                );
            }
            else
            {
                Debug.LogError(
                    "[TrainingDeepLinkHandler] " +
                    "Failed to select scenario for moduleId: "
                    + ModuleId
                );
            }
        }

        private void RetryApplyModuleToScenario()
        {
            ApplyModuleToScenario();
        }

        [ContextMenu("Test Training Deep Link")]
        private void TestTrainingDeepLink()
        {
            HandleDeepLink(
                "sih26041://training" +
                "?moduleId=fire_emergency" +
                "&attemptId=test-attempt-123"
            );
        }
    }
}


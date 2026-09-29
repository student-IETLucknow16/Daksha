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

            // Handles the case where Unity was completely closed
            // and Android launches it using the deep link.
            if (!string.IsNullOrEmpty(Application.absoluteURL))
            {
                HandleDeepLink(Application.absoluteURL);
            }
        }

        private void Start()
        {
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
            Debug.Log($"[TrainingDeepLinkHandler] Deep link received: {url}");

            if (string.IsNullOrEmpty(url))
                return;

            if (!url.StartsWith("sih26041://training", StringComparison.OrdinalIgnoreCase))
            {
                Debug.LogWarning(
                    $"[TrainingDeepLinkHandler] Ignoring unknown URL: {url}"
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
                    $"[TrainingDeepLinkHandler] Invalid URL: {error.Message}"
                );

                return;
            }

            ModuleId = GetQueryParameter(uri, "moduleId");
            AttemptId = GetQueryParameter(uri, "attemptId");

            Debug.Log(
                $"[TrainingDeepLinkHandler] Module ID: {ModuleId}"
            );

            Debug.Log(
                $"[TrainingDeepLinkHandler] Attempt ID: {AttemptId}"
            );

            if (HasTrainingLaunchData)
            {
                Debug.Log(
                    "[TrainingDeepLinkHandler] Training launch data received successfully."
                );
                ApplyModuleToScenario();
            }
            else
            {
                Debug.LogError(
                    "[TrainingDeepLinkHandler] Missing moduleId or attemptId."
                );
            }
        }

        private string GetQueryParameter(Uri uri, string key)
        {
            string query = uri.Query;

            if (string.IsNullOrEmpty(query))
                return null;

            if (query.StartsWith("?"))
                query = query.Substring(1);

            string[] parameters = query.Split('&');

            foreach (string parameter in parameters)
            {
                string[] parts = parameter.Split('=');

                if (parts.Length != 2)
                    continue;

                string parameterKey =
                    Uri.UnescapeDataString(parts[0]);

                string parameterValue =
                    Uri.UnescapeDataString(parts[1]);

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
                return;

            if (ScenarioManager.Instance == null)
            {
                Debug.LogWarning(
                    "[TrainingDeepLinkHandler] ScenarioManager is not ready yet."
                );
                return;
            }

            bool applied = ScenarioManager.Instance.SetScenarioByModuleId(ModuleId);

            if (applied)
            {
                Debug.Log(
                    "[TrainingDeepLinkHandler] Scenario selected: " + ModuleId
                );
            }
            else
            {
                Debug.LogError(
                    "[TrainingDeepLinkHandler] Failed to select scenario for moduleId: "
                    + ModuleId
                );
            }
        }
    }
}
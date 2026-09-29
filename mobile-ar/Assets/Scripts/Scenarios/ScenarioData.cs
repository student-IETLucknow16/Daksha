using System;
using UnityEngine;

namespace SIH26041.Scenarios
{
    [Serializable]
    public class ScenarioData
    {
        public string moduleId;
        public string title;
        public string description;
        public int passingScore;      // percentage, e.g. 70
        public int version;
        public ScenarioStepData[] steps;

        /// <summary>
        /// Loads scenario JSON from a Resources path (e.g. "Scenarios/fire_emergency",
        /// no extension). In Phase 6 this will be replaced/augmented with a loader
        /// that reads from local offline storage first, falling back to Resources
        /// only as a bundled-default fallback.
        /// </summary>
        public static ScenarioData LoadFromResources(string resourcePath)
        {
            TextAsset jsonAsset = Resources.Load<TextAsset>(resourcePath);
            if (jsonAsset == null)
            {
                Debug.LogError($"[ScenarioData] Could not find scenario JSON at Resources/{resourcePath}");
                return null;
            }
            return JsonUtility.FromJson<ScenarioData>(jsonAsset.text);
        }

        public int TotalPossiblePoints()
        {
            int total = 0;
            foreach (var step in steps) total += step.points;
            return total;
        }
    }
}

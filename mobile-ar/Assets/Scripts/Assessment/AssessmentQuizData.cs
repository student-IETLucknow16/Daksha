using System;
using UnityEngine;

namespace SIH26041.Assessment
{
    [Serializable]
    public class AssessmentQuizData
    {
        public string moduleId;
        public int passingScore;
        public AssessmentQuestionData[] questions;

        public static AssessmentQuizData LoadFromResources(string resourcePath)
        {
            TextAsset json = Resources.Load<TextAsset>(resourcePath);
            if (json == null)
            {
                Debug.LogError($"[AssessmentQuizData] Could not find Resources/{resourcePath}.json");
                return null;
            }

            return JsonUtility.FromJson<AssessmentQuizData>(json.text);
        }
    }
}

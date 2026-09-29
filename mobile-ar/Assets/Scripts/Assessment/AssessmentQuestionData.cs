using System;

namespace SIH26041.Assessment
{
    [Serializable]
    public class AssessmentQuestionData
    {
        public string id;
        public string question;
        public string[] options;
        public int correctOptionIndex;
        public int safetyWeight;
    }
}

using System;

namespace SIH26041.Scenarios
{
    /// <summary>
    /// The type of interaction a step expects. Drives how ScenarioManager
    /// waits for completion:
    ///   Identify / Interact / Select  -> waits for a matching ReportAction() call
    ///   Avoid                         -> waits for the step's timeLimitSeconds to
    ///                                    elapse without a disallowed action being reported
    ///   Navigate                      -> waits for a "reached waypoint" action
    /// </summary>
    public enum ScenarioStepType
    {
        Identify,
        Interact,
        Navigate,
        Avoid,
        Select
    }

    [Serializable]
    public class ScenarioStepData
    {
        public string stepId;

        // Stored as a string, not ScenarioStepType directly: Unity's JsonUtility
        // only deserializes enums from their integer value, not their name, so
        // a human-readable JSON file ("type": "avoid") would silently fail to
        // parse if this field were typed as the enum itself. We parse it
        // ourselves via the Type property below.
        public string type;
        public string instruction;          // shown to worker (localization key in later phase)
        public string correctAction;        // actionId that completes this step successfully
        public string[] incorrectActions;   // actionIds that are known-wrong for this step (optional)
        public int points;
        public bool critical;               // if true, a wrong/failed action here fails the whole scenario
        public string feedbackCorrect;
        public string feedbackIncorrect;
        public string hint;                 // optional, shown if the worker is stuck
        public int timeLimitSeconds;        // 0 = no timer

        public ScenarioStepType Type =>
            Enum.TryParse(type, ignoreCase: true, out ScenarioStepType parsed)
                ? parsed
                : ScenarioStepType.Interact; // safe default if JSON has a typo
    }
}

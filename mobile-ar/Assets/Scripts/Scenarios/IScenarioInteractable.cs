namespace SIH26041.Scenarios
{
    /// <summary>
    /// Anything in the scene that can report a worker action to the scenario
    /// engine implements this. ScenarioManager only ever deals with plain
    /// actionId strings — it has no knowledge of "extinguishers" or "buttons".
    /// This is what lets Module 2 (gas leak) reuse the engine unchanged.
    /// </summary>
    public interface IScenarioActionSource
    {
        string ActionId { get; }
    }
}

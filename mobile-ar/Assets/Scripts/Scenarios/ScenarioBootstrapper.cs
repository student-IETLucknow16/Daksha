using UnityEngine;
using SIH26041.AR;
using SIH26041.Scenarios;

namespace SIH26041.Scenarios
{
    /// <summary>
    /// Bridges AR placement to scenario start. Deliberately tiny and
    /// single-purpose: ARPlacementManager doesn't know ScenarioManager
    /// exists, and vice versa — this is the only script that couples them.
    /// </summary>
    public class ScenarioBootstrapper : MonoBehaviour
    {
        [SerializeField] private ARPlacementManager placementManager;

        private void OnEnable()
        {
            if (placementManager != null)
            {
                placementManager.OnScenarioPlaced += HandleScenarioPlaced;
            }
        }

        private void OnDisable()
        {
            if (placementManager != null)
            {
                placementManager.OnScenarioPlaced -= HandleScenarioPlaced;
            }
        }

        private void HandleScenarioPlaced(GameObject placedRoot)
        {
            ScenarioManager.Instance?.BeginScenario();
        }
    }
}

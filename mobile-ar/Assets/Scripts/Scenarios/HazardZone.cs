using UnityEngine;
using SIH26041.Scenarios;

namespace SIH26041.Scenarios
{
    /// <summary>
    /// Represents a hazardous area (fire radius, gas cloud, confined-space
    /// entrance). Because this is handheld AR, "the worker's position" is the
    /// AR camera's world position — there's no separate player rig to collide
    /// with. This class polls the distance from the camera to its own
    /// position each frame and reports its actionId if the worker walks in.
    /// </summary>
    public class HazardZone : MonoBehaviour, IScenarioActionSource
    {
        [Tooltip("The actionId reported when the worker enters this zone.")]
        [SerializeField] private string actionId = "enter_hazard_zone";

        [Tooltip("Radius (meters) of the danger area, centered on this transform.")]
        [SerializeField] private float hazardRadius = 0.75f;

        [Tooltip("Visual representation of the danger area (ring/decal). Optional.")]
        [SerializeField] private GameObject visualIndicator;

        public string ActionId => actionId;

        private Camera _mainCamera;
        private bool _hasReportedThisStep;

        private void Awake()
        {
            _mainCamera = Camera.main;
        }

        private void OnEnable()
        {
            if (ScenarioManager.Instance != null)
            {
                ScenarioManager.Instance.OnStepStarted += HandleStepStarted;
            }
        }

        private void OnDisable()
        {
            if (ScenarioManager.Instance != null)
            {
                ScenarioManager.Instance.OnStepStarted -= HandleStepStarted;
            }
        }

        private void HandleStepStarted(ScenarioStepData step)
        {
            _hasReportedThisStep = false;
        }

        private void Update()
        {
            if (_hasReportedThisStep) return;
            if (_mainCamera == null) _mainCamera = Camera.main;
            if (_mainCamera == null) return;

            float distance = Vector3.Distance(_mainCamera.transform.position, transform.position);
            if (distance <= hazardRadius)
            {
                _hasReportedThisStep = true;
                ScenarioManager.Instance?.ReportAction(actionId);
            }
        }

        /// <summary>Enable/disable the zone (e.g. only "live" during specific steps).</summary>
        public void SetActive(bool active)
        {
            enabled = active;
            if (visualIndicator != null) visualIndicator.SetActive(active);
        }

#if UNITY_EDITOR
        private void OnDrawGizmosSelected()
        {
            Gizmos.color = new Color(1f, 0.2f, 0.2f, 0.35f);
            Gizmos.DrawSphere(transform.position, hazardRadius);
        }
#endif
    }
}

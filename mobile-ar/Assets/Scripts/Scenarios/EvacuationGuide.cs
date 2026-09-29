using UnityEngine;
using SIH26041.Scenarios;

namespace SIH26041.Scenarios.Fire
{
    public class EvacuationGuide : MonoBehaviour, IScenarioActionSource
    {
        [SerializeField] private Transform arrowVisual;
        [SerializeField] private Transform exitWaypoint;
        [SerializeField] private string actionId = "reach_exit_point";
        [SerializeField] private string activeDuringStepId = "find_exit";
        [SerializeField] private float reachDistance = 0.5f;

        public string ActionId => actionId;

        private Camera _mainCamera;
        private bool _isActive;
        private bool _hasReported;

        private void Awake()
        {
            _mainCamera = Camera.main;

            if (arrowVisual != null)
                arrowVisual.gameObject.SetActive(false);
        }

        private void Start()
        {
            var sm = ScenarioManager.Instance;

            if (sm == null)
            {
                Debug.LogError("[EvacuationGuide] ScenarioManager not found!");
                return;
            }

            sm.OnStepStarted += HandleStepStarted;

            // Check the current step immediately.
            if (sm.CurrentStep != null)
            {
                HandleStepStarted(sm.CurrentStep);
            }
        }

        private void OnDestroy()
        {
            var sm = ScenarioManager.Instance;

            if (sm != null)
                sm.OnStepStarted -= HandleStepStarted;
        }

        private void HandleStepStarted(ScenarioStepData step)
        {
            Debug.Log(
                $"[EvacuationGuide] Step received: {step.stepId}"
            );

            _isActive = step.stepId == activeDuringStepId;
            _hasReported = false;

            if (arrowVisual != null)
            {
                arrowVisual.gameObject.SetActive(_isActive);

                Debug.Log(
                    $"[EvacuationGuide] Arrow active: {_isActive}"
                );
            }
        }

        private void Update()
        {
            if (!_isActive || _hasReported)
                return;

            if (_mainCamera == null)
                _mainCamera = Camera.main;

            if (_mainCamera == null || exitWaypoint == null)
                return;

            if (arrowVisual != null)
            {
                Vector3 direction =
                    exitWaypoint.position - arrowVisual.position;

                direction.y = 0f;

                if (direction.sqrMagnitude > 0.001f)
                {
                    arrowVisual.rotation =
                        Quaternion.LookRotation(direction);
                }
            }

            float distance = Vector3.Distance(
                _mainCamera.transform.position,
                exitWaypoint.position
            );

            if (distance <= reachDistance)
            {
                _hasReported = true;

                ScenarioManager.Instance?.ReportAction(
                    actionId
                );
            }
        }
    }
}
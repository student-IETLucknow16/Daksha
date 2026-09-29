using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.EnhancedTouch;
using SIH26041.Scenarios;
using Touch = UnityEngine.InputSystem.EnhancedTouch.Touch;

namespace SIH26041.AR
{
    [RequireComponent(typeof(Collider))]
    public class ARInteractable : MonoBehaviour, IScenarioActionSource
    {
        [Tooltip("The actionId reported to ScenarioManager when this object is tapped.")]
        [SerializeField] protected string actionId;

        [Tooltip("If false, this object ignores taps.")]
        [SerializeField] private bool interactable = true;

        public string ActionId => actionId;

        [Tooltip("Optional visual feedback object.")]
        [SerializeField] private GameObject highlightIndicator;

        private Camera _mainCamera;

        protected virtual void Awake()
        {
            _mainCamera = Camera.main;
        }

        protected virtual void OnEnable()
        {
            EnhancedTouchSupport.Enable();
            Touch.onFingerDown += HandleFingerDown;

            UpdateHighlight();
        }

        protected virtual void OnDisable()
        {
            Touch.onFingerDown -= HandleFingerDown;
        }

        private void Update()
        {
            // Mouse support for Unity Editor / XR Simulation
            if (Mouse.current != null &&
                Mouse.current.leftButton.wasPressedThisFrame)
            {
                HandleScreenTap(Mouse.current.position.ReadValue());
            }
        }

        public void SetInteractable(bool value)
        {
            interactable = value;
            UpdateHighlight();
        }

        private void UpdateHighlight()
        {
            if (highlightIndicator != null)
                highlightIndicator.SetActive(interactable);
        }

        private void HandleFingerDown(Finger finger)
        {
            if (finger.index != 0)
                return;

            HandleScreenTap(finger.screenPosition);
        }

        private void HandleScreenTap(Vector2 screenPosition)
        {
            Debug.Log($"[ARInteractable] Click received on {gameObject.name}");

            if (!interactable)
                return;

            if (IsPointerOverUI(screenPosition))
                return;

            if (_mainCamera == null)
                _mainCamera = Camera.main;

            if (_mainCamera == null)
                return;

            Ray ray = _mainCamera.ScreenPointToRay(screenPosition);

            RaycastHit[] hits = Physics.RaycastAll(ray, 10f);

            foreach (RaycastHit hit in hits)
            {
                if (hit.collider.gameObject == gameObject ||
                    hit.transform.IsChildOf(transform))
                {
                    OnTapped();
                    return;
                }
            }
        }

        protected virtual void OnTapped()
        {
            if (string.IsNullOrEmpty(actionId))
            {
                Debug.LogWarning(
                    $"[ARInteractable] {name} was tapped but has no actionId set."
                );
                return;
            }

            ScenarioManager.Instance?.ReportAction(actionId);
        }

        private static bool IsPointerOverUI(Vector2 screenPosition)
        {
            if (EventSystem.current == null)
                return false;

            var eventData = new PointerEventData(EventSystem.current)
            {
                position = screenPosition
            };

            var results =
                new System.Collections.Generic.List<RaycastResult>();

            EventSystem.current.RaycastAll(eventData, results);

            return results.Count > 0;
        }
    }
}
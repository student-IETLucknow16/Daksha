using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.EnhancedTouch;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;

using SIH26041.Scenarios;
using SIH26041.Training;

using Touch = UnityEngine.InputSystem.EnhancedTouch.Touch;

namespace SIH26041.AR
{
    /// <summary>
    /// Handles placement of the selected AR scenario on a detected AR plane.
    ///
    /// Supports:
    /// 1. Touch input on a real mobile device.
    /// 2. Left mouse click when testing XR Simulation in Unity Editor.
    ///
    /// The prefab is selected according to the scenario configured
    /// in ScenarioManager.
    /// </summary>
    [RequireComponent(typeof(ARRaycastManager))]
    public class ARPlacementManager : MonoBehaviour
    {
        [Header("Scenario Prefabs")]

        [Tooltip("Prefab used for the Fire Emergency scenario.")]
        [SerializeField] private GameObject fireScenarioPrefab;

        [Tooltip("Prefab used for the Gas Leak & Confined Space scenario.")]
        [SerializeField] private GameObject gasLeakScenarioPrefab;

        [Header("Placement Settings")]

        [Tooltip("If true, only the first successful tap/click places the object.")]
        [SerializeField] private bool lockAfterFirstPlacement = true;

        public event Action<GameObject> OnScenarioPlaced;

        private ARRaycastManager _raycastManager;

        private readonly List<ARRaycastHit> _hits =
            new List<ARRaycastHit>();

        private GameObject _placedInstance;

        private bool _placementLocked;

        private GameObject _selectedScenarioPrefab;

        private void Awake()
        {
            _raycastManager = GetComponent<ARRaycastManager>();
        }

        private void Start()
        {
            if (TrainingDeepLinkHandler.Instance != null)
            {
                TrainingDeepLinkHandler.Instance.ApplyModuleToScenario();
            }

            SelectScenarioPrefab();
        }

        private void OnEnable()
        {
            EnhancedTouchSupport.Enable();

            Touch.onFingerDown += HandleFingerDown;
        }

        private void OnDisable()
        {
            Touch.onFingerDown -= HandleFingerDown;

            EnhancedTouchSupport.Disable();
        }

        private void Update()
        {
            if (Mouse.current == null)
                return;

            if (Mouse.current.leftButton.wasPressedThisFrame)
            {
                Vector2 position = Mouse.current.position.ReadValue();

                Debug.Log("================================");
                Debug.Log("LEFT CLICK DETECTED!");
                Debug.Log("CLICK POSITION = " + position);

                HandlePlacement(position);
            }
        }

        /// <summary>
        /// Selects the correct scenario prefab based on
        /// ScenarioManager's resource path.
        /// </summary>
        private void SelectScenarioPrefab()
        {
            if (ScenarioManager.Instance == null)
            {
                Debug.LogError(
                    "[ARPlacementManager] ScenarioManager.Instance is NULL."
                );

                return;
            }

            string resourcePath =
                ScenarioManager.Instance.ScenarioResourcePath;

            Debug.Log(
                "[ARPlacementManager] Scenario Resource Path = "
                + resourcePath
            );

            if (string.IsNullOrEmpty(resourcePath))
            {
                Debug.LogError(
                    "[ARPlacementManager] Scenario Resource Path is empty."
                );

                return;
            }

            if (resourcePath.Contains("gas_leak_confined_space"))
            {
                _selectedScenarioPrefab = gasLeakScenarioPrefab;

                Debug.Log(
                    "[ARPlacementManager] Selected GAS LEAK scenario prefab."
                );
            }
            else if (resourcePath.Contains("fire_emergency"))
            {
                _selectedScenarioPrefab = fireScenarioPrefab;

                Debug.Log(
                    "[ARPlacementManager] Selected FIRE scenario prefab."
                );
            }
            else
            {
                Debug.LogError(
                    "[ARPlacementManager] Unknown scenario resource path: "
                    + resourcePath
                );
            }

            if (_selectedScenarioPrefab == null)
            {
                Debug.LogError(
                    "[ARPlacementManager] Selected scenario prefab is NULL."
                );
            }
        }

        /// <summary>
        /// Called when the user touches the screen on a real device.
        /// </summary>
        private void HandleFingerDown(Finger finger)
        {
            if (finger.index != 0)
                return;

            Debug.Log(
                "[ARPlacementManager] Touch: "
                + finger.screenPosition
            );

            HandlePlacement(finger.screenPosition);
        }

        /// <summary>
        /// Common placement method used by both mouse and touch.
        /// </summary>
        private void HandlePlacement(Vector2 screenPosition)
        {
            if (_placementLocked && lockAfterFirstPlacement)
            {
                Debug.Log(
                    "[ARPlacementManager] Placement is locked."
                );

                return;
            }

            if (_selectedScenarioPrefab == null)
            {
                Debug.LogError(
                    "[ARPlacementManager] No scenario prefab selected!"
                );

                return;
            }

            if (_raycastManager.Raycast(
                screenPosition,
                _hits,
                TrackableType.PlaneWithinPolygon))
            {
                Debug.Log(
                    "[ARPlacementManager] PLANE RAYCAST HIT!"
                );

                Pose hitPose = _hits[0].pose;

                PlaceScenario(hitPose);
            }
            else
            {
                Debug.Log(
                    "[ARPlacementManager] NO PLANE RAYCAST HIT."
                );
            }
        }

        /// <summary>
        /// Creates or moves the selected scenario to the detected plane.
        /// </summary>
        private void PlaceScenario(Pose pose)
        {
            if (_placedInstance == null)
            {
                _placedInstance = Instantiate(
                    _selectedScenarioPrefab,
                    pose.position,
                    pose.rotation
                );

                Debug.Log(
                    "[ARPlacementManager] Scenario instantiated: "
                    + _selectedScenarioPrefab.name
                );
            }
            else
            {
                _placedInstance.transform.SetPositionAndRotation(
                    pose.position,
                    pose.rotation
                );

                _placedInstance.SetActive(true);

                Debug.Log(
                    "[ARPlacementManager] Scenario repositioned."
                );
            }

            _placementLocked = true;

            if (PlaneDetectionManager.Instance != null)
            {
                PlaneDetectionManager.Instance.FreezeAndHidePlanes();
            }

            OnScenarioPlaced?.Invoke(_placedInstance);
        }

        /// <summary>
        /// Allows the user to place the scenario again.
        /// </summary>
        public void AllowRePlacement()
        {
            Debug.Log(
                "[ARPlacementManager] Re-placement enabled."
            );

            _placementLocked = false;

            if (_placedInstance != null)
            {
                _placedInstance.SetActive(false);
            }

            if (PlaneDetectionManager.Instance != null)
            {
                PlaneDetectionManager.Instance.ResumeDetection();
            }
        }

        /// <summary>
        /// Prevents placement if the touch/mouse position
        /// is currently over a UI element.
        /// </summary>
        private static bool IsPointerOverUI(
            Vector2 screenPosition)
        {
            if (EventSystem.current == null)
                return false;

            var eventData =
                new PointerEventData(EventSystem.current)
                {
                    position = screenPosition
                };

            var results =
                new List<RaycastResult>();

            EventSystem.current.RaycastAll(
                eventData,
                results
            );

            return results.Count > 0;
        }
    }
}



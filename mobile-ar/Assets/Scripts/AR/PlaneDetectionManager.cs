using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;

namespace SIH26041.AR
{
    /// <summary>
    /// Wraps ARPlaneManager to expose simple "has a usable surface been found yet"
    /// state, and to toggle plane visualization on/off (planes should disappear
    /// once the user has placed their scenario, to reduce visual clutter).
    /// </summary>
    [RequireComponent(typeof(ARPlaneManager))]
    public class PlaneDetectionManager : MonoBehaviour
    {
        public static PlaneDetectionManager Instance { get; private set; }

        [Tooltip("Minimum plane area (m^2) before we consider it usable for placement.")]
        [SerializeField] private float minUsablePlaneArea = 0.25f; // ~0.5m x 0.5m

        public event Action<bool> OnUsablePlaneFoundChanged;
        public bool HasUsablePlane { get; private set; }

        private ARPlaneManager _planeManager;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            _planeManager = GetComponent<ARPlaneManager>();
        }

        private void OnEnable()
        {
            _planeManager.trackablesChanged.AddListener(OnPlanesChanged);
        }

        private void OnDisable()
        {
            _planeManager.trackablesChanged.RemoveListener(OnPlanesChanged);
        }

        private void OnPlanesChanged(ARTrackablesChangedEventArgs<ARPlane> args)
        {
            EvaluateUsablePlanes();
        }

      
       private void EvaluateUsablePlanes()
        {
            bool found = false;

            foreach (var plane in _planeManager.trackables)
            {
                float area = plane.size.x * plane.size.y;

                Debug.Log(
                    $"PLANE: size={plane.size}, " +
                    $"area={area}, " +
                    $"state={plane.trackingState}"
                );

                if (plane.trackingState ==
                        UnityEngine.XR.ARSubsystems.TrackingState.Tracking
                    && area >= minUsablePlaneArea)
                {
                    found = true;
                    break;
                }
            }

            Debug.Log("USABLE PLANE FOUND = " + found);

            if (found != HasUsablePlane)
            {
                HasUsablePlane = found;
                OnUsablePlaneFoundChanged?.Invoke(found);
            }
        }

        private void Start()
        {
            EvaluateUsablePlanes();
        }

        /// <summary>
        /// Hides plane visualizations and stops further plane detection.
        /// Call this once the scenario has been placed so the AR view is clean.
        /// </summary>
        public void FreezeAndHidePlanes()
        {
            foreach (var plane in _planeManager.trackables)
            {
                plane.gameObject.SetActive(false);
            }
            _planeManager.enabled = false;
        }

        /// <summary>
        /// Re-enables plane detection (e.g. user chose "Retry placement").
        /// </summary>
        public void ResumeDetection()
        {
            _planeManager.enabled = true;
            foreach (var plane in _planeManager.trackables)
            {
                plane.gameObject.SetActive(true);
            }
        }
    }
}

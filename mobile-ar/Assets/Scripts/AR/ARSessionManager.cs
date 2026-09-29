using System;
using System.Collections;
using UnityEngine;
using UnityEngine.XR.ARFoundation;

namespace SIH26041.AR
{
    /// <summary>
    /// Owns the AR session lifecycle: checks device/ARCore availability,
    /// requests install if needed, and reports state changes to the rest
    /// of the app via events (no other script should touch ARSession directly).
    /// </summary>
    [RequireComponent(typeof(ARSession))]
    public class ARSessionManager : MonoBehaviour
    {
        public static ARSessionManager Instance { get; private set; }

        public enum ARInitState
        {
            CheckingAvailability,
            Unsupported,
            InstallingArCore,
            Ready,
            SessionError
        }

        public event Action<ARInitState> OnStateChanged;
        public ARInitState CurrentState { get; private set; } = ARInitState.CheckingAvailability;

        private ARSession _arSession;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            _arSession = GetComponent<ARSession>();
        }

        private void Start()
        {
            StartCoroutine(InitializeAR());
        }

        private IEnumerator InitializeAR()
        {
            SetState(ARInitState.CheckingAvailability);

            // ARSession.CheckAvailability() queries whether this device supports
            // ARCore at all (hardware + OS). This is distinct from whether the
            // ARCore *app* (Google Play Services for AR) is installed.
            yield return ARSession.CheckAvailability();

            if (ARSession.state == ARSessionState.Unsupported)
            {
                SetState(ARInitState.Unsupported);
                Debug.LogError("[ARSessionManager] Device does not support ARCore.");
                yield break;
            }

            if (ARSession.state == ARSessionState.NeedsInstall)
            {
                SetState(ARInitState.InstallingArCore);
                yield return ARSession.Install();

                if (ARSession.state != ARSessionState.Ready)
                {
                    SetState(ARInitState.SessionError);
                    Debug.LogError("[ARSessionManager] ARCore install failed or was declined.");
                    yield break;
                }
            }

            // Session is ready. Enable it (it may have been disabled while
            // we performed the availability check to avoid wasted camera init).
            _arSession.enabled = true;
            SetState(ARInitState.Ready);
        }

        private void SetState(ARInitState newState)
        {
            CurrentState = newState;
            OnStateChanged?.Invoke(newState);
        }

        /// <summary>
        /// Call this to fully reset tracking (e.g. "Restart Scan" button).
        /// Clears all detected planes/anchors and starts tracking from scratch.
        /// </summary>
        public void ResetSession()
        {
            _arSession.Reset();
        }
    }
}

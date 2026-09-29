using UnityEngine;
using TMPro;
using SIH26041.AR;
using SIH26041.Localization;

namespace SIH26041.UI
{
    public class ARScanUIController : MonoBehaviour
    {
        [SerializeField] private GameObject scanPromptPanel;
        [SerializeField] private GameObject tapToPlacePanel;
        [SerializeField] private GameObject placedConfirmPanel;
        [SerializeField] private TMP_Text statusText;

        private ARPlacementManager _placement;

        // Remember the current AR UI state
        private bool _hasUsablePlane = false;

        private void Start()
        {
            Debug.Log("ARScanUIController STARTED");

            _placement = FindFirstObjectByType<ARPlacementManager>();

            if (_placement != null)
            {
                _placement.OnScenarioPlaced += HandleScenarioPlaced;
            }

            // Listen for plane detection
            if (PlaneDetectionManager.Instance != null)
            {
                PlaneDetectionManager.Instance.OnUsablePlaneFoundChanged
                    += HandlePlaneFoundChanged;

                HandlePlaneFoundChanged(
                    PlaneDetectionManager.Instance.HasUsablePlane
                );
            }
            else
            {
                Debug.LogError(
                    "ARScanUIController: PlaneDetectionManager.Instance is NULL"
                );

                ShowScanPrompt();
            }

            // Listen for language changes
            if (LocalizationManager.Instance != null)
            {
                LocalizationManager.Instance.OnLanguageChanged
                    += HandleLanguageChanged;

                Debug.Log(
                    "ARScanUIController subscribed to language changes"
                );
            }
            else
            {
                Debug.LogError(
                    "ARScanUIController: LocalizationManager.Instance is NULL"
                );
            }
        }

        private void OnDestroy()
        {
            if (PlaneDetectionManager.Instance != null)
            {
                PlaneDetectionManager.Instance.OnUsablePlaneFoundChanged
                    -= HandlePlaneFoundChanged;
            }

            if (_placement != null)
            {
                _placement.OnScenarioPlaced -= HandleScenarioPlaced;
            }

            if (LocalizationManager.Instance != null)
            {
                LocalizationManager.Instance.OnLanguageChanged
                    -= HandleLanguageChanged;
            }
        }

        private void HandleLanguageChanged(string languageCode)
        {
            Debug.Log(
                "ARScanUIController LANGUAGE CHANGED: " + languageCode
            );

            // Refresh the currently visible message
            if (_hasUsablePlane)
            {
                ShowTapToPlace();
            }
            else
            {
                ShowScanPrompt();
            }
        }

        private void HandlePlaneFoundChanged(bool found)
        {
            Debug.Log("UI RECEIVED PLANE EVENT: " + found);

            _hasUsablePlane = found;

            if (found)
            {
                ShowTapToPlace();
            }
            else
            {
                ShowScanPrompt();
            }
        }

        private void ShowScanPrompt()
        {
            Debug.Log("SHOW SCAN PROMPT CALLED");

            if (scanPromptPanel != null)
                scanPromptPanel.SetActive(true);

            if (tapToPlacePanel != null)
                tapToPlacePanel.SetActive(false);

            if (placedConfirmPanel != null)
                placedConfirmPanel.SetActive(false);

            if (statusText != null)
            {
                if (LocalizationManager.Instance != null)
                {
                    string localizedMessage =
     LocalizationManager.Instance.Get("scan_prompt");

                    Debug.LogError(
                        "🔥 SCAN PROMPT LOCALIZED VALUE = [" +
                        localizedMessage + "]"
                    );

                    statusText.text = localizedMessage;
                }
                else
                {
                    statusText.text =
                        "Move your phone slowly to scan the floor or a table";
                }
            }
        }

        private void ShowTapToPlace()
        {
            Debug.Log("SHOW TAP TO PLACE CALLED");

            if (scanPromptPanel != null)
                scanPromptPanel.SetActive(false);

            if (tapToPlacePanel != null)
                tapToPlacePanel.SetActive(true);

            if (placedConfirmPanel != null)
                placedConfirmPanel.SetActive(false);

            if (statusText != null)
            {
                if (LocalizationManager.Instance != null)
                {
                    string localizedMessage =
             LocalizationManager.Instance.Get("tap_to_place");

                    Debug.LogError(
                        "🔥 TAP TO PLACE VALUE = [" + localizedMessage + "]"
                    );

                    statusText.text = localizedMessage;
                }
                else
                {
                    statusText.text =
                        "Tap the highlighted surface to place the training scenario";
                }
            }
        }

        private void HandleScenarioPlaced(GameObject placed)
        {
            if (scanPromptPanel != null)
                scanPromptPanel.SetActive(false);

            if (tapToPlacePanel != null)
                tapToPlacePanel.SetActive(false);

            if (placedConfirmPanel != null)
                placedConfirmPanel.SetActive(true);

            CancelInvoke(nameof(HidePlacedConfirm));
            Invoke(nameof(HidePlacedConfirm), 1.5f);
        }

        private void HidePlacedConfirm()
        {
            if (placedConfirmPanel != null)
                placedConfirmPanel.SetActive(false);
        }
    }
}
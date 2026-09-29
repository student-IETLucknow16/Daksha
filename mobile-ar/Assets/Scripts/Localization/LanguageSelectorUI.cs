using UnityEngine;
using UnityEngine.UI;

namespace SIH26041.Localization
{
    /// <summary>
    /// The language-selection screen. Just wires three buttons to
    /// LocalizationManager.SetLanguage() — everything else (persistence,
    /// applying the change to on-screen text) is LocalizationManager's job.
    /// </summary>
    public class LanguageSelectorUI : MonoBehaviour
    {
        [SerializeField] private Button englishButton;
        [SerializeField] private Button hindiButton;
        [SerializeField] private Button santaliButton;

        [Tooltip("Called after a language is chosen — wire this to move on to the next screen (e.g. Worker Dashboard).")]
        [SerializeField] private GameObject nextScreenPanel;
        [SerializeField] private GameObject thisPanel;

        private void Awake()
        {
            englishButton?.onClick.AddListener(() => SelectLanguage(LocalizationManager.English));
            hindiButton?.onClick.AddListener(() => SelectLanguage(LocalizationManager.Hindi));
            santaliButton?.onClick.AddListener(() => SelectLanguage(LocalizationManager.Santali));
        }

        private void SelectLanguage(string languageCode)
        {
            LocalizationManager.Instance?.SetLanguage(languageCode);
            thisPanel?.SetActive(false);
            nextScreenPanel?.SetActive(true);
        }
    }
}

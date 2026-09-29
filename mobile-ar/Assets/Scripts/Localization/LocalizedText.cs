
using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace SIH26041.Localization
{
    public class LocalizedText : MonoBehaviour
    {
        [Header("Localization")]
        [SerializeField] private string key;

        [Header("Language Fonts")]
        [SerializeField] private TMP_FontAsset englishFont;
        [SerializeField] private TMP_FontAsset hindiFont;
        [SerializeField] private TMP_FontAsset santaliFont;

        private Text _legacyText;
        private TMP_Text _tmpText;

        private void Awake()
        {
            _legacyText = GetComponent<Text>();
            _tmpText = GetComponent<TMP_Text>();
        }

        private void Start()
        {
            Debug.Log("[LocalizedText] STARTED on " + gameObject.name);

            Apply();

            if (LocalizationManager.Instance != null)
            {
                LocalizationManager.Instance.OnLanguageChanged
                    += HandleLanguageChanged;

                Debug.Log(
                    "[LocalizedText] SUBSCRIBED on " + gameObject.name
                );
            }
            else
            {
                Debug.LogError(
                    "[LocalizedText] LocalizationManager.Instance is NULL"
                );
            }
        }

        private void OnDestroy()
        {
            if (LocalizationManager.Instance != null)
            {
                LocalizationManager.Instance.OnLanguageChanged
                    -= HandleLanguageChanged;
            }
        }

        private void HandleLanguageChanged(string languageCode)
        {
            Debug.Log(
                "[LocalizedText] LANGUAGE CHANGED: "
                + languageCode
            );

            Apply();
        }

        private void Apply()
        {
            Debug.Log("[LocalizedText] APPLY CALLED");

            if (LocalizationManager.Instance == null)
            {
                Debug.LogError(
                    "[LocalizedText] Manager is NULL"
                );
                return;
            }

            if (string.IsNullOrEmpty(key))
            {
                Debug.LogWarning(
                    "[LocalizedText] Key is EMPTY on "
                    + gameObject.name
                );
                return;
            }

            string value =
                LocalizationManager.Instance.Get(key);

            Debug.Log(
                "[LocalizedText] Applying key = "
                + key
                + " | value = "
                + value
            );

            // Set localized text
            if (_legacyText != null)
            {
                _legacyText.text = value;
            }

            if (_tmpText != null)
            {
                _tmpText.text = value;

                // Set the correct font for the current language
                ApplyCurrentFont();
            }
        }

        private void ApplyCurrentFont()
        {
            if (_tmpText == null)
                return;

            string language =
                LocalizationManager.Instance.CurrentLanguage;

            TMP_FontAsset selectedFont = englishFont;

            if (language == LocalizationManager.Hindi)
            {
                selectedFont = hindiFont;
            }
            else if (language == LocalizationManager.Santali)
            {
                selectedFont = santaliFont;
            }

            if (selectedFont != null)
            {
                _tmpText.font = selectedFont;

                Debug.Log(
                    "[LocalizedText] FONT APPLIED on "
                    + gameObject.name
                    + " | Language = "
                    + language
                    + " | Font = "
                    + selectedFont.name
                );
            }
            else
            {
                Debug.LogWarning(
                    "[LocalizedText] No font assigned for language: "
                    + language
                    + " on "
                    + gameObject.name
                );
            }
        }

        public void SetKey(string newKey)
        {
            key = newKey;
            Apply();
        }
    }
}


using System;
using System.Collections.Generic;
using UnityEngine;

namespace SIH26041.Localization
{
    [Serializable]
    public class LocalizationEntry
    {
        public string key;
        public string value;
    }

    /// <summary>
    /// Wire format for a language file. Not a plain JSON object of
    /// {"key": "value"} pairs — JsonUtility cannot deserialize a
    /// Dictionary&lt;string,string&gt; at all, so the file is an array of
    /// {key, value} pairs instead, converted to a Dictionary at load time.
    /// </summary>
    [Serializable]
    public class LocalizationFile
    {
        public string languageCode;
        public LocalizationEntry[] entries;
    }

    /// <summary>
    /// Loads one language's strings from Resources/Localization/{code}.json
    /// and serves them by key. English is always loaded as a silent fallback
    /// (a missing key in Hindi/Santali shows the English text rather than
    /// the raw key string, which is a better failure mode for a live demo).
    /// Persists the chosen language across sessions via PlayerPrefs.
    /// </summary>
    public class LocalizationManager : MonoBehaviour
    {
        public static LocalizationManager Instance { get; private set; }

        public const string English = "en";
        public const string Hindi = "hi";
        public const string Santali = "sat";

        private const string LanguagePrefKey = "sih26041_language";

        public event Action<string /*newLanguageCode*/> OnLanguageChanged;
        public string CurrentLanguage { get; private set; } = English;

        private Dictionary<string, string> _currentStrings = new Dictionary<string, string>();
        private Dictionary<string, string> _fallbackStrings = new Dictionary<string, string>();

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);

            _fallbackStrings = LoadLanguageFile(English);

            string savedLanguage = PlayerPrefs.GetString(LanguagePrefKey, English);
            SetLanguage(savedLanguage, notify: false);
        }

        public void SetLanguage(string languageCode)
        {
            SetLanguage(languageCode, notify: true);
        }

        private void SetLanguage(string languageCode, bool notify)
        {
            _currentStrings = languageCode == English ? _fallbackStrings : LoadLanguageFile(languageCode);
            CurrentLanguage = languageCode;

            PlayerPrefs.SetString(LanguagePrefKey, languageCode);
            PlayerPrefs.Save();

            if (notify) OnLanguageChanged?.Invoke(languageCode);
        }

        /// <summary>
        /// Returns the localized string for a key. Falls back to English if
        /// the key is missing in the current language, and to the raw key
        /// itself (wrapped so it's obviously a missing-translation, not real
        /// content) if it's missing from English too — that should only ever
        /// happen for a typo'd key during development.
        /// </summary>
        public string Get(string key)
        {
            if (string.IsNullOrEmpty(key)) return string.Empty;

            if (_currentStrings.TryGetValue(key, out string value)) return value;
            if (_fallbackStrings.TryGetValue(key, out string fallbackValue)) return fallbackValue;

            Debug.LogWarning($"[LocalizationManager] Missing localization key: '{key}'");
            return $"[{key}]";
        }

        private Dictionary<string, string> LoadLanguageFile(string languageCode)
        {
            var result = new Dictionary<string, string>();
            TextAsset asset = Resources.Load<TextAsset>($"Localization/{languageCode}");
            if (asset == null)
            {
                Debug.LogError($"[LocalizationManager] No language file found for '{languageCode}' at Resources/Localization/{languageCode}.json");
                return result;
            }

            LocalizationFile file;
            try
            {
                file = JsonUtility.FromJson<LocalizationFile>(asset.text);
            }
            catch (Exception e)
            {
                Debug.LogError($"[LocalizationManager] Failed to parse language file '{languageCode}': {e.Message}");
                return result;
            }

            if (file?.entries != null)
            {
                foreach (var entry in file.entries)
                {
                    if (!string.IsNullOrEmpty(entry.key)) result[entry.key] = entry.value;
                }
            }
            return result;
        }
    }
}

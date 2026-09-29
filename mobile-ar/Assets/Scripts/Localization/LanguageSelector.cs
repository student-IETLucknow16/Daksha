using UnityEngine;

namespace SIH26041.Localization
{
    public class LanguageSelector : MonoBehaviour
    {
        public void SetEnglish()
        {
            Debug.LogError("🔥 ENGLISH BUTTON FUNCTION CALLED");

            if (LocalizationManager.Instance == null)
            {
                Debug.LogError("❌ LocalizationManager is NULL");
                return;
            }

            LocalizationManager.Instance.SetLanguage("en");

            Debug.LogError(
                "🔥 Language AFTER = "
                + LocalizationManager.Instance.CurrentLanguage
            );
        }

        public void SetHindi()
        {
            Debug.LogError("🔥🔥 HINDI BUTTON FUNCTION CALLED");

            if (LocalizationManager.Instance == null)
            {
                Debug.LogError("❌ LocalizationManager is NULL");
                return;
            }

            Debug.LogError(
                "🔥 Language BEFORE = "
                + LocalizationManager.Instance.CurrentLanguage
            );

            LocalizationManager.Instance.SetLanguage("hi");

            Debug.LogError(
                "🔥 Language AFTER = "
                + LocalizationManager.Instance.CurrentLanguage
            );
        }

        public void SetSantali()
        {
            Debug.LogError("🔥 SANTALI BUTTON FUNCTION CALLED");

            if (LocalizationManager.Instance == null)
            {
                Debug.LogError("❌ LocalizationManager is NULL");
                return;
            }

            LocalizationManager.Instance.SetLanguage("sat");

            Debug.LogError(
                "🔥 Language AFTER = "
                + LocalizationManager.Instance.CurrentLanguage
            );
        }
    }
}
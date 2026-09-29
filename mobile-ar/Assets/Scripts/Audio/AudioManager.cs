using System.Collections.Generic;
using UnityEngine;

namespace SIH26041.Audio
{
    /// <summary>
    /// Minimal one-shot SFX player. Not mandatory for the Phase 2 prototype —
    /// scenario logic never depends on audio actually playing. Clips are
    /// registered by a simple string key so future localization (Phase 7) can
    /// swap in Hindi/Santali voice-instruction clips without touching this class.
    /// </summary>
    public class AudioManager : MonoBehaviour
    {
        public static AudioManager Instance { get; private set; }

        [System.Serializable]
        public class NamedClip
        {
            public string key;
            public AudioClip clip;
        }

        [SerializeField] private List<NamedClip> clips = new List<NamedClip>();
        [SerializeField] private AudioSource sfxSource;

        private Dictionary<string, AudioClip> _lookup;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;

            _lookup = new Dictionary<string, AudioClip>();
            foreach (var entry in clips)
            {
                if (!string.IsNullOrEmpty(entry.key) && entry.clip != null)
                {
                    _lookup[entry.key] = entry.clip;
                }
            }
        }

        public void PlaySfx(string key)
        {
            if (sfxSource == null) return;
            if (_lookup != null && _lookup.TryGetValue(key, out var clip) && clip != null)
            {
                sfxSource.PlayOneShot(clip);
            }
            else
            {
                Debug.LogWarning($"[AudioManager] No clip registered for key '{key}' — skipping (audio is optional).");
            }
        }
    }
}

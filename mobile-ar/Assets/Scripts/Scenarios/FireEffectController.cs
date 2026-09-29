using UnityEngine;
using SIH26041.Scenarios;

namespace SIH26041.Scenarios.Fire
{
    /// <summary>
    /// Module-1-specific: owns the fire/smoke particle systems and alarm
    /// state, and reacts to scenario step completion to animate the fire
    /// being extinguished. Kept separate from ScenarioManager (which knows
    /// nothing about fire) — this is the only fire-specific script that
    /// talks to the particle systems.
    /// </summary>
    public class FireEffectController : MonoBehaviour
    {
        [Header("Effects")]
        [SerializeField] private ParticleSystem fireParticles;
        [SerializeField] private ParticleSystem smokeParticles;
        [SerializeField] private Light fireGlow;

        [Header("Alarm")]
        [SerializeField] private GameObject alarmLightObject;   // flashing light, enabled on activate_alarm
        [SerializeField] private AudioSource alarmAudioSource;

        [Header("Fire audio loop")]
        [SerializeField] private AudioSource fireAudioSource;

        [Header("Step wiring")]
        [Tooltip("stepId that triggers alarm activation visuals (should match raise_alarm step's correctAction handling).")]
        [SerializeField] private string alarmStepId = "raise_alarm";

        [Tooltip("stepId whose successful completion extinguishes the fire.")]
        [SerializeField] private string extinguishStepId = "extinguish_fire";

        [SerializeField] private float extinguishFadeSeconds = 2f;

        private void OnEnable()
        {
            StartFire();
            if (ScenarioManager.Instance != null)
            {
                ScenarioManager.Instance.OnStepCompleted += HandleStepCompleted;
            }
        }

        private void OnDisable()
        {
            if (ScenarioManager.Instance != null)
            {
                ScenarioManager.Instance.OnStepCompleted -= HandleStepCompleted;
            }
        }

        private void StartFire()
        {
            fireParticles?.Play();
            smokeParticles?.Play();
            if (fireGlow != null) fireGlow.enabled = true;
            if (fireAudioSource != null)
            {
                fireAudioSource.loop = true;
                fireAudioSource.Play();
            }
        }

        private void HandleStepCompleted(ScenarioStepData step, bool wasCorrect, string feedback)
        {
            if (!wasCorrect) return;

            if (step.stepId == alarmStepId)
            {
                ActivateAlarm();
            }
            else if (step.stepId == extinguishStepId)
            {
                StartCoroutine(ExtinguishFire());
            }
        }

        private void ActivateAlarm()
        {
            if (alarmLightObject != null) alarmLightObject.SetActive(true);
            alarmAudioSource?.Play();
        }

        private System.Collections.IEnumerator ExtinguishFire()
        {
            fireParticles?.Stop(true, ParticleSystemStopBehavior.StopEmitting);
            smokeParticles?.Stop(true, ParticleSystemStopBehavior.StopEmitting);

            float elapsed = 0f;
            float startVolume = fireAudioSource != null ? fireAudioSource.volume : 0f;
            float startIntensity = fireGlow != null ? fireGlow.intensity : 0f;

            while (elapsed < extinguishFadeSeconds)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / extinguishFadeSeconds;

                if (fireAudioSource != null) fireAudioSource.volume = Mathf.Lerp(startVolume, 0f, t);
                if (fireGlow != null) fireGlow.intensity = Mathf.Lerp(startIntensity, 0f, t);

                yield return null;
            }

            fireAudioSource?.Stop();
            if (fireGlow != null) fireGlow.enabled = false;
            if (alarmLightObject != null) alarmLightObject.SetActive(false);
            alarmAudioSource?.Stop();
        }
    }
}

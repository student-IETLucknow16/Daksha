
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using SIH26041.Assessment;
using OrbitalNine.QRCode;

namespace SIH26041.Certificate
{
    public class CertificateManager : MonoBehaviour
    {
        [SerializeField] private GameObject certificatePanel;

        private TMP_Text certificateText;
        private RawImage qrImage;

        private void Start()
        {
            if (certificatePanel != null)
                certificatePanel.SetActive(false);

            if (AssessmentManager.Instance != null)
                AssessmentManager.Instance.OnAssessmentEnded += HandleAssessmentEnded;
        }

        private void OnDestroy()
        {
            if (AssessmentManager.Instance != null)
                AssessmentManager.Instance.OnAssessmentEnded -= HandleAssessmentEnded;
        }

        private void HandleAssessmentEnded(
            int arScore,
            int safetyScore,
            int quizScore,
            int finalScore,
            AssessmentResult result)
        {
            if (result != AssessmentResult.Passed)
                return;

            ShowCertificate(finalScore);
        }

        private void ShowCertificate(int score)
        {
            if (certificatePanel == null)
            {
                CreateCertificatePanel();
            }

            if (certificatePanel == null)
                return;

            certificatePanel.SetActive(true);

            string certificateId =
                "SIH-FIRE-" + Random.Range(10000, 99999);

            if (certificateText != null)
            {
                certificateText.text =
                    "TRAINING CERTIFICATE\n\n" +
                    "Industrial Safety Training\n\n" +
                    "Module: Fire & Explosion Emergency\n\n" +
                    $"Final Score: {score}%\n\n" +
                    "STATUS: PASSED\n\n" +
                    $"Certificate ID: {certificateId}";
            }

            CreateQRCode(certificateId);
        }

        private void CreateCertificatePanel()
        {
            Canvas canvas = FindFirstObjectByType<Canvas>();

            if (canvas == null)
            {
                Debug.LogError(
                    "[CertificateManager] Canvas not found."
                );
                return;
            }

            certificatePanel = new GameObject("CertificatePanel");

            certificatePanel.transform.SetParent(
                canvas.transform,
                false
            );

            RectTransform panelRect =
                certificatePanel.AddComponent<RectTransform>();

            panelRect.anchorMin = Vector2.zero;
            panelRect.anchorMax = Vector2.one;
            panelRect.offsetMin = Vector2.zero;
            panelRect.offsetMax = Vector2.zero;

            Image background =
                certificatePanel.AddComponent<Image>();

            background.color =
                new Color(0.95f, 0.95f, 0.95f, 1f);

            // Certificate text
            GameObject textObject =
                new GameObject("CertificateText");

            textObject.transform.SetParent(
                certificatePanel.transform,
                false
            );

            RectTransform textRect =
                textObject.AddComponent<RectTransform>();

            textRect.anchorMin =
                new Vector2(0.08f, 0.35f);

            textRect.anchorMax =
                new Vector2(0.92f, 0.92f);

            textRect.offsetMin = Vector2.zero;
            textRect.offsetMax = Vector2.zero;

            certificateText =
                textObject.AddComponent<TextMeshProUGUI>();

            certificateText.alignment =
                TextAlignmentOptions.Center;

            certificateText.fontSize = 32;

            certificateText.color = Color.black;

            // QR RawImage
            GameObject qrObject =
                new GameObject("QRVerificationCode");

            qrObject.transform.SetParent(
                certificatePanel.transform,
                false
            );

            RectTransform qrRect =
                qrObject.AddComponent<RectTransform>();

            qrRect.anchorMin =
                new Vector2(0.35f, 0.03f);

            qrRect.anchorMax =
                new Vector2(0.65f, 0.30f);

            qrRect.offsetMin = Vector2.zero;
            qrRect.offsetMax = Vector2.zero;

            qrImage =
                qrObject.AddComponent<RawImage>();

            // QRCodeGenerator must be on the same
            // GameObject as the RawImage.
            qrObject.AddComponent<QRCodeGenerator>();
        }

        private void CreateQRCode(string certificateId)
        {
            if (qrImage == null)
            {
                Debug.LogError(
                    "[CertificateManager] QR RawImage not found."
                );
                return;
            }

            QRCodeGenerator generator =
                qrImage.GetComponent<QRCodeGenerator>();

            if (generator == null)
            {
                generator =
                    qrImage.gameObject.AddComponent<QRCodeGenerator>();
            }

            // Demo verification payload.
            string verificationData =
                "SIH26041|CERTIFICATE|" + certificateId;

            generator.GenerateQRCode(verificationData);

            Debug.Log(
                "[CertificateManager] QR generated for: "
                + certificateId
            );
        }
    }
}


document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-wipe");
  const statusText = document.getElementById("status-text");
  const progressWrap = document.querySelector(".progress-wrap");
  const progressFill = document.querySelector(".progress-fill");
  const statusLog = document.getElementById("status-log");
  const certificateArea = document.getElementById("certificate-area");
  const downloadCertBtn = document.getElementById("download-cert");
  const deviceSelect = document.getElementById("device-select");
  const methodSelect = document.getElementById("method-select");

  startBtn.addEventListener("click", async () => {
    const device = deviceSelect.value;
    const method = methodSelect.value;

    await runWipeSimulation(device, method);
  });

  async function runWipeSimulation(device, method) {
    // Reset UI
    statusText.textContent = "Starting wipe...";
    progressWrap.hidden = false;
    progressFill.style.width = "0%";
    statusLog.innerHTML = "";
    certificateArea.hidden = true;

    const steps = [
      "Initializing wipe environment",
      "Verifying device and partition table",
      method === "nist"
        ? "Executing NIST SP 800-88 Purge..."
        : method === "cryptographic"
        ? "Performing cryptographic key destruction..."
        : "Performing quick overwrite...",
      "Verifying overwrite completeness",
      "Generating tamper-evident certificate",
      "Finalizing",
    ];

    const durations = [800, 1000, 2000, 1200, 1500, 800];

    const logStep = (msg) => {
      const li = document.createElement("li");
      li.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
      statusLog.prepend(li);
      statusText.textContent = msg;
    };

    // Iterate steps sequentially
    for (let i = 0; i < steps.length; i++) {
      logStep(steps[i]);
      const progress = Math.min(95, Math.round(((i + 1) / steps.length) * 100));
      progressFill.style.width = progress + "%";
      await new Promise((r) => setTimeout(r, durations[i]));
    }

    // Finish wipe
    progressFill.style.width = "100%";
    statusText.textContent = "Wipe complete — verification successful.";
    logStep("Wipe complete — verification successful.");

    // Generate signed certificate
    const certObj = await generateSignedCertificate(device, method);

    // Show PDF download button
    certificateArea.hidden = false;
    setupPDFDownload(certObj);
  }

  async function generateSignedCertificate(device, method) {
    const cert = {
      product: "SecureWipe",
      version: "1.0",
      device,
      method,
      success: true,
      issuedAt: new Date().toISOString(),
    };

    const enc = new TextEncoder();
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["sign", "verify"]
    );

    const signatureBuffer = await crypto.subtle.sign(
      { name: "RSASSA-PKCS1-v1_5" },
      keyPair.privateKey,
      enc.encode(JSON.stringify(cert))
    );

    const signature = btoa(
      String.fromCharCode(...new Uint8Array(signatureBuffer))
    );
    return { ...cert, signature };
  }

  function setupPDFDownload(certObj) {
    downloadCertBtn.onclick = () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("SecureWipe Certificate", 20, 20);

      doc.setFontSize(12);
      let y = 35;
      for (const [key, value] of Object.entries(certObj)) {
        const lines = doc.splitTextToSize(`${key}: ${value}`, 170);
        doc.text(lines, 20, y);
        y += lines.length * 7;
      }

      doc.save(`SecureWipe_${certObj.issuedAt.replace(/[:.]/g, "-")}.pdf`);
    };
  }
});

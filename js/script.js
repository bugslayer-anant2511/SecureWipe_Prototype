document.addEventListener("DOMContentLoaded", () => {
  const openWipeBtn = document.getElementById("open-wipe");
  const startWipeBtn = document.getElementById("start-wipe");
  const confirmModal = document.getElementById("confirm-modal");
  const modalConfirm = document.getElementById("modal-confirm");
  const modalCancel = document.getElementById("modal-cancel");
  const statusText = document.getElementById("status-text");
  const progressWrap = document.querySelector(".progress-wrap");
  const progressBar = document.getElementById("progress");
  const progressFill = document.querySelector(".progress-fill");
  const statusLog = document.getElementById("status-log");
  const certificateArea = document.getElementById("certificate-area");
  const certJson = document.getElementById("certificate-json");
  const downloadCertBtn = document.getElementById("download-cert");
  const copyCertBtn = document.getElementById("copy-cert");
  const deviceSelect = document.getElementById("device-select");
  const methodSelect = document.getElementById("method-select");

  openWipeBtn?.addEventListener("click", () => {
    document.querySelector("#wipe")?.scrollIntoView({ behavior: "smooth" });
    // optional focus
    deviceSelect.focus();
  });

  startWipeBtn.addEventListener("click", () => {
    // show confirmation modal
    const device = deviceSelect.options[deviceSelect.selectedIndex].text;
    const method = methodSelect.options[methodSelect.selectedIndex].text;
    document.getElementById(
      "confirm-desc"
    ).textContent = `You are about to run "${method}" on ${device}. This action is irreversible. Continue?`;
    confirmModal.setAttribute("aria-hidden", "false");
  });

  modalCancel.addEventListener("click", () => {
    confirmModal.setAttribute("aria-hidden", "true");
  });

  modalConfirm.addEventListener("click", () => {
    confirmModal.setAttribute("aria-hidden", "true");
    runWipeSimulation();
  });

  // Cancel if user clicks outside modal
  confirmModal.addEventListener("click", (e) => {
    if (e.target === confirmModal)
      confirmModal.setAttribute("aria-hidden", "true");
  });

  function runWipeSimulation() {
    // Reset UI
    statusText.textContent = "Starting wipe...";
    progressWrap.hidden = false;
    progressFill.style.width = "0%";
    statusLog.innerHTML = "";
    certificateArea.hidden = true;

    const device = deviceSelect.value;
    const method = methodSelect.value;

    // steps simulate different durations
    const steps = [
      "Initializing wipe environment",
      "Verifying target device and partition table",
      method === "nist"
        ? "Executing NIST SP 800-88 Purge..."
        : method === "cryptographic"
        ? "Performing cryptographic key destruction..."
        : "Performing quick overwrite...",
      "Verifying overwrite completeness",
      "Generating tamper-evident certificate",
      "Finalizing",
    ];

    let progress = 0;
    let stepIndex = 0;
    const stepDuration = 1200; 
    function logStep(msg) {
      const li = document.createElement("li");
      li.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
      statusLog.prepend(li);
    }

    // iterate steps
    const interval = setInterval(() => {
      // advance step
      if (stepIndex < steps.length) {
        const msg = steps[stepIndex];
        logStep(msg);
        statusText.textContent = msg;
        progress = Math.min(
          95,
          Math.round(((stepIndex + 1) / steps.length) * 100)
        );
        progressFill.style.width = progress + "%";
        progressBar.setAttribute("aria-valuenow", progress);
        stepIndex++;
      } else {
        // finish
        clearInterval(interval);
        // small final animation
        setTimeout(() => {
          progressFill.style.width = "100%";
          progressBar.setAttribute("aria-valuenow", 100);
          statusText.textContent = "Wipe complete — verification successful.";
          logStep("Wipe complete — verification successful.");
          // show certificate
          const certificate = generateCertificate(device, method, true);
          showCertificate(certificate);
        }, 800);
      }
    }, stepDuration);
  }

  function generateCertificate(device, method, success = true) {
    // simple certificate object — in production, server or secure HW key must sign it.
    const id = "SW-" + Math.random().toString(16).slice(2, 14).toUpperCase();
    const ts = new Date().toISOString();
    // simulated verification hash
    const verifyHash = btoa(id + "|" + ts).slice(0, 24);

    const cert = {
      certificateId: id,
      product: "SecureWipe",
      productVersion: "1.0",
      device: device,
      method: method,
      success: success,
      issuedAt: ts,
      verifier: "SecureWipe Offline Verifier",
      verificationHash: verifyHash,
      notes:
        "This is a client-side simulated certificate. Real deployment must produce cryptographically-signed certificates.",
    };
    return cert;
  }

  function showCertificate(certObj) {
    certificateArea.hidden = false;
    const pretty = JSON.stringify(certObj, null, 2);
    certJson.textContent = pretty;
    // attach download handler
    downloadCertBtn.onclick = () =>
      downloadCertificate(pretty, `${certObj.certificateId}.json`);
    copyCertBtn.onclick = () => {
      navigator.clipboard
        ?.writeText(pretty)
        .then(() => {
          copyCertBtn.textContent = "Copied!";
          setTimeout(() => (copyCertBtn.textContent = "Copy"), 1500);
        })
        .catch(() => alert("Copy failed — please copy manually."));
    };
  }

  function downloadCertificate(content, filename) {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // ======== Multi-Step Modal Flow ========
  const startWipeBtn = document.getElementById("start-wipe-btn");

  // Step 1: ISO
  const isoSection = document.getElementById("iso-section");
  const downloadIsoBtn = document.getElementById("download-iso");
  const isoMsg = document.getElementById("iso-msg");
  const isoNextBtn = document.getElementById("iso-next");
  const isoBackBtn = document.getElementById("iso-back-btn");
  const isoCloseBtn = document.getElementById("iso-close-btn");

  // Step 2: Ventoy
  const ventoySection = document.getElementById("ventoy-section");
  const downloadVentoyBtn = document.getElementById("download-ventoy");
  const ventoyMsg = document.getElementById("ventoy-msg");
  const ventoyNextBtn = document.getElementById("ventoy-next");
  const ventoyBackBtn = document.getElementById("ventoy-back-btn");
  const ventoyCloseBtn = document.getElementById("ventoy-close-btn");

  // Step 3: USB Insert
  const usbInsertSection = document.getElementById("usb-insert-section");
  const usbInsertBtn = document.getElementById("usb-insert-btn");
  const usbInsertMsg = document.getElementById("usb-insert-msg");
  const usbInsertBackBtn = document.getElementById("usb-insert-back-btn");
  const usbInsertCloseBtn = document.getElementById("usb-insert-close-btn");

  // Step 4: Prep USB
  const prepSection = document.getElementById("prep-section");
  const prepBackBtn = document.getElementById("prep-back-btn");
  const prepCloseBtn = document.getElementById("prep-close-btn");
  const copyUsbBtn = document.getElementById("copy-usb-btn");
  const prepMsg = document.getElementById("prep-msg");
  const prepNextBtn = document.getElementById("prep-next");

  // ========= Start Wipe → ISO =========
  startWipeBtn.addEventListener("click", () => {
    startWipeBtn.hidden = true;
    isoSection.hidden = false;
  });

  // ISO download
  downloadIsoBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = "SecureWipe.iso";
    link.download = "SecureWipe.iso";
    document.body.appendChild(link);
    link.click();
    link.remove();

    isoMsg.style.display = "block";
    isoNextBtn.hidden = false;
  });

  // ISO next → Ventoy
  isoNextBtn.addEventListener("click", () => {
    isoSection.hidden = true;
    ventoySection.hidden = false;
  });

  // ISO nav
  isoBackBtn.addEventListener("click", () => {
    isoSection.hidden = true;
    startWipeBtn.hidden = false;
  });
  isoCloseBtn.addEventListener("click", () => {
    isoSection.hidden = true;
    startWipeBtn.hidden = false;
  });

  // ========= Ventoy =========
  downloadVentoyBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = "Ventoy.zip";
    link.download = "Ventoy.zip";
    document.body.appendChild(link);
    link.click();
    link.remove();

    ventoyMsg.style.display = "block";
    ventoyNextBtn.hidden = false; // ✅ Show next button
  });

  ventoyNextBtn.addEventListener("click", () => {
    ventoySection.hidden = true;
    usbInsertSection.hidden = false; // go to USB insert step
  });

  // Ventoy nav
  ventoyBackBtn.addEventListener("click", () => {
    ventoySection.hidden = true;
    isoSection.hidden = false;
  });
  ventoyCloseBtn.addEventListener("click", () => {
    ventoySection.hidden = true;
    startWipeBtn.hidden = false;
  });

  // ========= USB Insert =========
  usbInsertBtn.addEventListener("click", () => {
    usbInsertMsg.style.display = "block";
    setTimeout(() => {
      usbInsertSection.hidden = true;
      prepSection.hidden = false;
    }, 800); // show success message briefly
  });
  // USB Insert nav
  usbInsertBackBtn.addEventListener("click", () => {
    usbInsertSection.hidden = true;
    ventoySection.hidden = false;
  });
  usbInsertCloseBtn.addEventListener("click", () => {
    usbInsertSection.hidden = true;
    startWipeBtn.hidden = false;
  });

  // ========= Prep USB =========
  prepBackBtn.addEventListener("click", () => {
    prepSection.hidden = true;
    usbInsertSection.hidden = false;
  });
  prepCloseBtn.addEventListener("click", () => {
    prepSection.hidden = true;
    startWipeBtn.hidden = false;
  });
  copyUsbBtn.addEventListener("click", () => {
    prepMsg.style.display = "block";
    prepMsg.textContent = "Copying Ventoy to USB...";

    // Simulate Ventoy copy
    setTimeout(() => {
      prepMsg.textContent = "Ventoy copied successfully.";

      // Simulate ISO copy
      setTimeout(() => {
        prepMsg.textContent = "ISO copied successfully.";

        // Show reboot instructions
        setTimeout(() => {
          prepMsg.style.display = "none";
          document.getElementById("reboot-msg").style.display = "block";
          prepNextBtn.hidden = false;
        }, 1200);
      }, 1500);
    }, 1500);
  });

  // ========= Wipe Simulation Flow =========
  const startBtn = document.getElementById("start-wipe");
  const statusText = document.getElementById("status-text");
  const progressWrap = document.querySelector(".progress-wrap");
  const progressFill = document.querySelector(".progress-fill");
  const statusLog = document.getElementById("status-log");
  const certificateArea = document.getElementById("certificate-area");
  const downloadCertBtn = document.getElementById("download-cert");
  const deviceSelect = document.getElementById("device-select");
  const methodSelect = document.getElementById("method-select");

  startBtn?.addEventListener("click", async () => {
    const device = deviceSelect.value;
    const method = methodSelect.value;
    await runWipeSimulation(device, method);
  });

  async function runWipeSimulation(device, method) {
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

    for (let i = 0; i < steps.length; i++) {
      const li = document.createElement("li");
      li.textContent = `[${new Date().toLocaleTimeString()}] ${steps[i]}`;
      statusLog.prepend(li);
      statusText.textContent = steps[i];
      progressFill.style.width =
        Math.min(95, Math.round(((i + 1) / steps.length) * 100)) + "%";
      await new Promise((r) => setTimeout(r, durations[i]));
    }

    progressFill.style.width = "100%";
    statusText.textContent = "Wipe complete — verification successful.";
    const li = document.createElement("li");
    li.textContent = `[${new Date().toLocaleTimeString()}] Wipe complete — verification successful.`;
    statusLog.prepend(li);

    const certObj = await generateSignedCertificate(device, method);
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

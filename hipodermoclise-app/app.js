const embeddedMode = new URLSearchParams(window.location.search).get("embedded") === "1";
if (embeddedMode) {
  document.body.classList.add("embedded-mode");
}

const tabs = Array.from(document.querySelectorAll(".tab-trigger"));
const panels = Array.from(document.querySelectorAll(".tab-panel"));
const appShell = document.querySelector(".app");
const accessGate = document.querySelector("#accessGate");
const accessGateTitle = document.querySelector("#accessGateTitle");
const confirmHealthProfessionalButton = document.querySelector("#confirmHealthProfessional");
const denyHealthProfessionalButton = document.querySelector("#denyHealthProfessional");
const checklistItems = Array.from(document.querySelectorAll("#visitChecklist input[type='checkbox']"));
const checklistCount = document.querySelector("#checklistCount");
const checklistProgress = document.querySelector("#checklistProgress");
const materialChecklistItems = Array.from(
  document.querySelectorAll("#materialChecklist input[type='checkbox']"),
);
const materialChecklistCount = document.querySelector("#materialChecklistCount");
const materialChecklistProgress = document.querySelector("#materialChecklistProgress");
const clearMaterialChecklistButton = document.querySelector("#clearMaterialChecklist");
const materialSubtabs = Array.from(document.querySelectorAll(".material-subtab"));
const materialSubtabPanels = Array.from(document.querySelectorAll("[data-material-panel]"));
const materialListSubtabs = Array.from(document.querySelectorAll(".material-list-subtab"));
const materialListSubtabPanels = Array.from(document.querySelectorAll("[data-material-list-panel]"));
const techniqueSubtabs = Array.from(document.querySelectorAll(".technique-subtab"));
const techniqueSubtabPanels = Array.from(document.querySelectorAll("[data-technique-panel]"));
const dropSubtabs = Array.from(document.querySelectorAll(".drop-subtab"));
const dropSubtabPanels = Array.from(document.querySelectorAll("[data-drop-panel]"));
const managerSubtabs = Array.from(document.querySelectorAll(".manager-subtab"));
const managerSubtabPanels = Array.from(document.querySelectorAll("[data-manager-panel]"));
const compatItemA = document.querySelector("#compatItemA");
const compatItemB = document.querySelector("#compatItemB");
const compatInteractiveResult = document.querySelector("#compatInteractiveResult");
const prescriptionItemsContainer = document.querySelector("#prescriptionItems");
const addPrescriptionItemButton = document.querySelector("#addPrescriptionItem");
let prescriptionItemControls = Array.from(document.querySelectorAll(".prescription-item"));
const punctureHighlight = document.querySelector("#punctureHighlight");
const punctureGroups = document.querySelector("#punctureGroups");
const dropCameraPreview = document.querySelector("#dropCameraPreview");
const dropCameraPlaceholder = document.querySelector("#dropCameraPlaceholder");
const startDropCameraButton = document.querySelector("#startDropCamera");
const stopDropCameraButton = document.querySelector("#stopDropCamera");
const startAutoDropCounterButton = document.querySelector("#startAutoDropCounter");
const stopAutoDropCounterButton = document.querySelector("#stopAutoDropCounter");
const resetAutoDropCounterButton = document.querySelector("#resetAutoDropCounter");
const dropCameraStatus = document.querySelector("#dropCameraStatus");
const recordDropButton = document.querySelector("#recordDrop");
const resetDropCounterButton = document.querySelector("#resetDropCounter");
const dropCount = document.querySelector("#dropCount");
const dropElapsed = document.querySelector("#dropElapsed");
const dropPerMinute = document.querySelector("#dropPerMinute");
const dropMlHour = document.querySelector("#dropMlHour");
const manualDropsMinute = document.querySelector("#manualDropsMinute");
const manualMlHour = document.querySelector("#manualMlHour");
const contactForm = document.querySelector("#contactForm");
const contactResult = document.querySelector("#contactResult");
const techniqueVideo = document.querySelector("#techniqueVideo");
const techniqueVideoFallback = document.querySelector("#techniqueVideoFallback");
const visitCounter = document.querySelector("#visitCounter");
const documentNoteTrigger = document.querySelector("#documentNoteTrigger");
const documentNotePanel = document.querySelector("#documentNote");
const closeDocumentNoteButton = document.querySelector("#closeDocumentNote");
const documentMaterialTrigger = document.querySelector("#documentMaterialTrigger");
const documentMaterialPanel = document.querySelector("#materialChecklistPanel");
const closeMaterialChecklistPanelButton = document.querySelector("#closeMaterialChecklist");
const documentChecklistTrigger = document.querySelector("#documentChecklistTrigger");
const documentChecklistPanel = document.querySelector("#checklist");
const closeChecklistButton = document.querySelector("#closeChecklist");
const languageButtons = Array.from(document.querySelectorAll("[data-language]"));
const contactEmail = "icarehipodermoclise@gmail.com";
const accessStorageKey = "icare-health-professional-access";
const languageStorageKey = "icare-selected-language";
const storageKey = "icare-model-checklist";
const materialStorageKey = "icare-material-checklist";
const visitCounterUrl = "https://abacus.jasoncameron.dev/hit/icare-hipodermoclise2/visitas";
let dropCameraStream = null;
let dropTimestamps = [];
let dropTimer = null;
let manualConversionLock = false;
let autoDropActive = false;
let autoDropFrame = null;
let previousDropBrightness = null;
let baselineDropBrightness = null;
let smoothedDropDifference = 0;
let autoDropCalibration = [];
let lastAutoDropAt = 0;
const dropDetectionCanvas = document.createElement("canvas");
const dropDetectionContext = dropDetectionCanvas.getContext("2d", { willReadFrequently: true });

function setCookie(name, value, maxAge = 31536000) {
  document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
}

function clearCookie(name) {
  document.cookie = `${name}=;path=/;max-age=0;SameSite=Lax`;
}

function currentLanguage() {
  try {
    const storedLanguage = localStorage.getItem(languageStorageKey);
    if (storedLanguage) return storedLanguage;
  } catch {
    // Local storage can be unavailable in restrictive browser modes.
  }
  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/pt\/([^;]+)/);
  return match?.[1] || "pt";
}

function rememberLanguage(language) {
  try {
    localStorage.setItem(languageStorageKey, language);
  } catch {
    // Local storage can be unavailable in restrictive browser modes.
  }
}

function markActiveLanguage(language) {
  languageButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.language === language);
    button.setAttribute("aria-pressed", String(button.dataset.language === language));
  });
}

function applyGoogleTranslateLanguage(language) {
  const translateSelect = document.querySelector(".goog-te-combo");
  if (!translateSelect) return false;
  translateSelect.value = language === "pt" ? "" : language;
  translateSelect.dispatchEvent(new Event("change"));
  return true;
}

function changeLanguage(language) {
  rememberLanguage(language);
  if (language === "pt") {
    clearCookie("googtrans");
  } else {
    setCookie("googtrans", `/pt/${language}`);
  }
  markActiveLanguage(language);
  loadTechniqueVideo();
  if (applyGoogleTranslateLanguage(language)) return;
  window.location.reload();
}

window.googleTranslateElementInit = function googleTranslateElementInit() {
  if (!window.google?.translate?.TranslateElement) return;
  new window.google.translate.TranslateElement(
    {
      pageLanguage: "pt",
      includedLanguages: "pt,en,es,fr",
      autoDisplay: false,
    },
    "google_translate_element",
  );
  markActiveLanguage(currentLanguage());
};

function rememberProfessionalAccess() {
  try {
    sessionStorage.setItem(accessStorageKey, "yes");
  } catch {
    // Session storage can be unavailable in restrictive browser modes.
  }
}

function hasProfessionalAccess() {
  try {
    return sessionStorage.getItem(accessStorageKey) === "yes";
  } catch {
    return false;
  }
}

function allowProfessionalAccess() {
  rememberProfessionalAccess();
  document.body.classList.remove("access-pending", "access-denied");
  if (accessGate) accessGate.hidden = true;
  if (appShell) appShell.removeAttribute("aria-hidden");
  scrollToActivePanel({ behavior: "auto" });
}

function denyProfessionalAccess() {
  document.body.classList.remove("access-pending");
  document.body.classList.add("access-denied");
  if (appShell) appShell.setAttribute("aria-hidden", "true");
  if (accessGateTitle) accessGateTitle.textContent = "Acesso bloqueado";
  const accessGateText = accessGate?.querySelector("p");
  if (accessGateText) {
    accessGateText.textContent =
      "Este conteúdo é destinado exclusivamente a profissionais de saúde.";
  }
  if (confirmHealthProfessionalButton) confirmHealthProfessionalButton.hidden = true;
  if (denyHealthProfessionalButton) denyHealthProfessionalButton.hidden = true;
}

function initializeAccessGate() {
  if (!accessGate || !appShell) return;

  if (hasProfessionalAccess()) {
    allowProfessionalAccess();
    return;
  }

  confirmHealthProfessionalButton.addEventListener("click", allowProfessionalAccess);
  denyHealthProfessionalButton.addEventListener("click", denyProfessionalAccess);
  confirmHealthProfessionalButton.focus({ preventScroll: true });
}

if (accessGate) {
  initializeAccessGate();
} else {
  document.body.classList.remove("access-pending", "access-denied");
  if (appShell) appShell.removeAttribute("aria-hidden");
}

async function updateVisitCounter() {
  if (!visitCounter) return;
  try {
    const response = await fetch(visitCounterUrl, { cache: "no-store" });
    const data = await response.json();
    visitCounter.textContent = String(data.value);
  } catch {
    visitCounter.textContent = "--";
  }
}

function shouldScrollToPanel() {
  return window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(max-width: 820px)").matches;
}

function scrollToPanel(panel, { behavior = "smooth" } = {}) {
  if (!shouldScrollToPanel() || document.body.classList.contains("access-pending")) return;
  if (!panel) return;

  const moveToPanel = () => {
    const top = panel.getBoundingClientRect().top + window.scrollY - 12;
    window.scrollTo({ top: Math.max(top, 0), behavior });
  };

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(moveToPanel);
    window.setTimeout(moveToPanel, 180);
  });
}

function scrollToActivePanel({ behavior = "smooth" } = {}) {
  const activePanel = panels.find((panel) => panel.classList.contains("active"));
  scrollToPanel(activePanel, { behavior });
}

function activateTab(tab, { scrollToPanel: shouldMoveToPanel = false } = {}) {
  const targetId = tab.dataset.tab;

  tabs.forEach((item) => {
    item.setAttribute("aria-selected", String(item === tab));
  });

  let activePanel = null;
  panels.forEach((panel) => {
    const isActive = panel.id === targetId;
    panel.classList.toggle("active", isActive);
    if (isActive) activePanel = panel;
  });

  if (targetId === "tecnica") {
    loadTechniqueVideo();
  }

  if (targetId !== "contador-gotas") {
    stopDropCamera();
  }

  history.replaceState(null, "", `#${targetId}`);

  if (shouldMoveToPanel) {
    if (activePanel) {
      activePanel.setAttribute("tabindex", "-1");
      activePanel.focus({ preventScroll: true });
    }
    scrollToPanel(activePanel);
  }
}

function loadTechniqueVideo() {
  if (!techniqueVideo) return;
  const isTranslatedVersion = currentLanguage() !== "pt";
  const videoSource = isTranslatedVersion
    ? techniqueVideo.dataset.translatedSrc || techniqueVideo.dataset.src
    : techniqueVideo.dataset.src;
  const fallbackSource = isTranslatedVersion
    ? techniqueVideo.dataset.translatedFallbackUrl || techniqueVideo.dataset.fallbackUrl
    : techniqueVideo.dataset.fallbackUrl;

  if (techniqueVideo.getAttribute("src") !== videoSource) {
    techniqueVideo.src = videoSource;
  }

  if (techniqueVideoFallback && fallbackSource) {
    techniqueVideoFallback.href = fallbackSource;
  }
}

function dropFactorValue() {
  return 20;
}

function formatDecimal(value, maximumFractionDigits = 1) {
  if (!Number.isFinite(value)) return "--";
  return value.toLocaleString("pt-BR", {
    maximumFractionDigits,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
  });
}

function formatInputDecimal(value) {
  if (!Number.isFinite(value)) return "";
  return Number(value.toFixed(1)).toString();
}

function formatElapsed(milliseconds) {
  if (!milliseconds || milliseconds < 1000) return "0s";
  const totalSeconds = Math.round(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes ? `${minutes}min ${String(seconds).padStart(2, "0")}s` : `${seconds}s`;
}

function calculatedDropsPerMinute() {
  if (dropTimestamps.length < 2) return null;
  const elapsedMinutes = (dropTimestamps[dropTimestamps.length - 1] - dropTimestamps[0]) / 60000;
  if (elapsedMinutes <= 0) return null;
  return (dropTimestamps.length - 1) / elapsedMinutes;
}

function updateDropCounterResults() {
  if (!dropCount || !dropElapsed || !dropPerMinute || !dropMlHour) return;

  const now = Date.now();
  const elapsed = dropTimestamps.length ? now - dropTimestamps[0] : 0;
  const dropsMinute = calculatedDropsPerMinute();
  const mlHour = dropsMinute === null ? null : (dropsMinute * 60) / dropFactorValue();

  dropCount.textContent = String(dropTimestamps.length);
  dropElapsed.textContent = formatElapsed(elapsed);
  dropPerMinute.textContent = dropsMinute === null ? "--" : formatDecimal(dropsMinute, 1);
  dropMlHour.textContent = mlHour === null ? "--" : formatDecimal(mlHour, 1);
}

function startDropTimer() {
  if (dropTimer) return;
  dropTimer = window.setInterval(updateDropCounterResults, 1000);
}

function stopDropTimer() {
  if (!dropTimer) return;
  window.clearInterval(dropTimer);
  dropTimer = null;
}

function recordDrop() {
  dropTimestamps.push(Date.now());
  startDropTimer();
  updateDropCounterResults();
}

function resetDropCounter() {
  dropTimestamps = [];
  stopDropTimer();
  updateDropCounterResults();
}

function setDropCameraStatus(message, className = "") {
  if (!dropCameraStatus) return;
  dropCameraStatus.textContent = message;
  dropCameraStatus.className = `drop-counter-status ${className}`.trim();
}

function canRequestCamera() {
  return Boolean(dropCameraPreview && navigator.mediaDevices?.getUserMedia);
}

function cameraBlockedByContext() {
  return !window.isSecureContext && !["localhost", "127.0.0.1"].includes(window.location.hostname);
}

function initializeDropCameraAccess() {
  if (!startDropCameraButton || !dropCameraStatus) return;

  if (cameraBlockedByContext()) {
    startDropCameraButton.disabled = true;
    setDropCameraStatus(
      "Para acessar a câmera no celular, abra o site por HTTPS, como no GitHub Pages.",
      "warning",
    );
    return;
  }

  if (!canRequestCamera()) {
    startDropCameraButton.disabled = true;
    setDropCameraStatus("Câmera indisponível neste navegador.", "warning");
  }
}

async function startDropCamera() {
  if (cameraBlockedByContext()) {
    setDropCameraStatus(
      "Para acessar a câmera no celular, abra o site por HTTPS, como no GitHub Pages.",
      "warning",
    );
    return;
  }

  if (!canRequestCamera()) {
    setDropCameraStatus("Câmera indisponível neste navegador.", "warning");
    return;
  }

  try {
    const mobileCameraLayout =
      window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(max-width: 620px)").matches;
    const cameraSize = mobileCameraLayout
      ? { width: { ideal: 720 }, height: { ideal: 1280 } }
      : { width: { ideal: 1280 }, height: { ideal: 720 } };

    try {
      dropCameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: "environment" },
          ...cameraSize,
        },
        audio: false,
      });
    } catch {
      dropCameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          ...cameraSize,
        },
        audio: false,
      });
    }
    dropCameraPreview.srcObject = dropCameraStream;
    await dropCameraPreview.play();
    dropCameraPreview.classList.add("active");
    if (dropCameraPlaceholder) dropCameraPlaceholder.hidden = true;
    if (startDropCameraButton) startDropCameraButton.disabled = true;
    if (stopDropCameraButton) stopDropCameraButton.disabled = false;
    setDropCameraStatus("Câmera ativa. Centralize a câmara de gotejamento antes de iniciar a contagem.", "success");
  } catch {
    setDropCameraStatus(
      "Não foi possível acessar a câmera. Verifique a permissão do navegador e tente novamente.",
      "warning",
    );
  }
}

function stopDropCamera() {
  stopAutoDropCounter();
  if (!dropCameraStream) return;
  dropCameraStream.getTracks().forEach((track) => track.stop());
  dropCameraStream = null;
  if (dropCameraPreview) {
    dropCameraPreview.pause();
    dropCameraPreview.srcObject = null;
    dropCameraPreview.classList.remove("active");
  }
  if (dropCameraPlaceholder) dropCameraPlaceholder.hidden = false;
  if (startDropCameraButton) startDropCameraButton.disabled = false;
  if (stopDropCameraButton) stopDropCameraButton.disabled = true;
  setDropCameraStatus("Câmera parada.", "");
}

function readDropDetectionSignal() {
  if (!dropCameraPreview || !dropDetectionContext || dropCameraPreview.readyState < 2) return null;

  const videoWidth = dropCameraPreview.videoWidth;
  const videoHeight = dropCameraPreview.videoHeight;
  if (!videoWidth || !videoHeight) return null;

  const sampleWidth = Math.max(28, Math.round(videoWidth * 0.18));
  const sampleHeight = Math.max(42, Math.round(videoHeight * 0.46));
  const sampleX = Math.round((videoWidth - sampleWidth) / 2);
  const sampleY = Math.round((videoHeight - sampleHeight) / 2);

  dropDetectionCanvas.width = 48;
  dropDetectionCanvas.height = 96;
  dropDetectionContext.drawImage(
    dropCameraPreview,
    sampleX,
    sampleY,
    sampleWidth,
    sampleHeight,
    0,
    0,
    dropDetectionCanvas.width,
    dropDetectionCanvas.height,
  );

  const { data } = dropDetectionContext.getImageData(
    0,
    0,
    dropDetectionCanvas.width,
    dropDetectionCanvas.height,
  );
  let brightnessSum = 0;
  let contrastSum = 0;
  let darkPixelCount = 0;
  const pixelCount = data.length / 4;

  for (let index = 0; index < data.length; index += 4) {
    const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
    brightnessSum += brightness;
    contrastSum += Math.abs(data[index] - data[index + 2]);
    if (brightness < 95) darkPixelCount += 1;
  }

  return {
    brightness: brightnessSum / pixelCount,
    contrast: contrastSum / pixelCount,
    darkRatio: darkPixelCount / pixelCount,
  };
}

function resetAutoDropDetection() {
  previousDropBrightness = null;
  baselineDropBrightness = null;
  smoothedDropDifference = 0;
  autoDropCalibration = [];
  lastAutoDropAt = 0;
}

function detectDropFrame() {
  if (!autoDropActive) return;

  const signal = readDropDetectionSignal();
  const now = Date.now();

  if (signal) {
    if (autoDropCalibration.length < 24) {
      autoDropCalibration.push(signal.brightness);
      baselineDropBrightness =
        autoDropCalibration.reduce((sum, value) => sum + value, 0) / autoDropCalibration.length;
      setDropCameraStatus(
        "Calibrando a imagem. Mantenha a câmara de gotejamento centralizada e iluminada.",
        "success",
      );
    } else {
      const brightnessDifference = Math.max(0, (baselineDropBrightness || signal.brightness) - signal.brightness);
      const motionDifference =
        previousDropBrightness === null ? 0 : Math.max(0, previousDropBrightness - signal.brightness);
      const signalStrength =
        brightnessDifference * 0.55 + motionDifference * 0.85 + signal.darkRatio * 32 + signal.contrast * 0.08;
      smoothedDropDifference = smoothedDropDifference * 0.72 + signalStrength * 0.28;
      const threshold = Math.max(6.5, Math.min(18, Math.abs(baselineDropBrightness - signal.brightness) * 0.65 + 6));

      if (smoothedDropDifference > threshold && now - lastAutoDropAt > 900) {
        lastAutoDropAt = now;
        smoothedDropDifference = 0;
        baselineDropBrightness = baselineDropBrightness * 0.88 + signal.brightness * 0.12;
        recordDrop();
      } else if (now - lastAutoDropAt > 1200) {
        baselineDropBrightness = baselineDropBrightness * 0.96 + signal.brightness * 0.04;
      }
    }

    previousDropBrightness = signal.brightness;
  }

  autoDropFrame = window.requestAnimationFrame(detectDropFrame);
}

async function startAutoDropCounter() {
  if (!dropCameraStream) {
    await startDropCamera();
  }
  if (!dropCameraStream || autoDropActive) return;

  autoDropActive = true;
  resetAutoDropDetection();
  if (startAutoDropCounterButton) startAutoDropCounterButton.disabled = true;
  if (stopAutoDropCounterButton) stopAutoDropCounterButton.disabled = false;
  setDropCameraStatus(
    "Calibrando a imagem. Mantenha a câmara de gotejamento centralizada e com boa iluminação.",
    "success",
  );
  detectDropFrame();
}

function stopAutoDropCounter() {
  if (!autoDropActive && !autoDropFrame) return;
  autoDropActive = false;
  resetAutoDropDetection();
  if (autoDropFrame) {
    window.cancelAnimationFrame(autoDropFrame);
    autoDropFrame = null;
  }
  if (startAutoDropCounterButton) startAutoDropCounterButton.disabled = false;
  if (stopAutoDropCounterButton) stopAutoDropCounterButton.disabled = true;
  if (dropCameraStream) {
    setDropCameraStatus("Contagem automática parada. A câmera continua disponível para contagem manual.", "");
  }
}

function syncManualFromDropsMinute() {
  if (!manualDropsMinute || !manualMlHour || manualConversionLock) return;
  manualConversionLock = true;
  const dropsMinute = Number(manualDropsMinute.value.replace(",", "."));
  manualMlHour.value = Number.isFinite(dropsMinute) && manualDropsMinute.value
    ? formatInputDecimal((dropsMinute * 60) / dropFactorValue())
    : "";
  manualConversionLock = false;
}

function syncManualFromMlHour() {
  if (!manualDropsMinute || !manualMlHour || manualConversionLock) return;
  manualConversionLock = true;
  const mlHour = Number(manualMlHour.value.replace(",", "."));
  manualDropsMinute.value = Number.isFinite(mlHour) && manualMlHour.value
    ? formatInputDecimal((mlHour * dropFactorValue()) / 60)
    : "";
  manualConversionLock = false;
}

function refreshDropFactorCalculations() {
  updateDropCounterResults();
  if (manualDropsMinute?.value) {
    syncManualFromDropsMinute();
  } else if (manualMlHour?.value) {
    syncManualFromMlHour();
  }
}

function activateMaterialSubtab(trigger) {
  const target = trigger.dataset.materialSubtab;

  materialSubtabs.forEach((item) => {
    item.setAttribute("aria-selected", String(item === trigger));
  });

  materialSubtabPanels.forEach((panel) => {
    const isActive = panel.dataset.materialPanel === target;
    panel.hidden = !isActive;
    panel.classList.toggle("active", isActive);
  });
}

function activateMaterialListSubtab(trigger) {
  const target = trigger.dataset.materialListSubtab;

  materialListSubtabs.forEach((item) => {
    const isActive = item === trigger;
    item.setAttribute("aria-selected", String(isActive));
    item.setAttribute("tabindex", isActive ? "0" : "-1");
  });

  materialListSubtabPanels.forEach((panel) => {
    const isActive = panel.dataset.materialListPanel === target;
    panel.hidden = !isActive;
    panel.classList.toggle("active", isActive);
  });
}

function moveMaterialListSubtabFocus(currentTrigger, direction) {
  const currentIndex = materialListSubtabs.indexOf(currentTrigger);
  if (currentIndex < 0) return;

  const nextIndex = (currentIndex + direction + materialListSubtabs.length) % materialListSubtabs.length;
  const nextTrigger = materialListSubtabs[nextIndex];
  activateMaterialListSubtab(nextTrigger);
  nextTrigger.focus();
}

function activateTechniqueSubtab(trigger) {
  const target = trigger.dataset.techniqueSubtab;

  techniqueSubtabs.forEach((item) => {
    const isActive = item === trigger;
    item.setAttribute("aria-selected", String(isActive));
    item.setAttribute("tabindex", isActive ? "0" : "-1");
  });

  techniqueSubtabPanels.forEach((panel) => {
    const isActive = panel.dataset.techniquePanel === target;
    panel.hidden = !isActive;
    panel.classList.toggle("active", isActive);
  });
}

function moveTechniqueSubtabFocus(currentTrigger, direction) {
  const currentIndex = techniqueSubtabs.indexOf(currentTrigger);
  if (currentIndex < 0) return;

  const nextIndex = (currentIndex + direction + techniqueSubtabs.length) % techniqueSubtabs.length;
  const nextTrigger = techniqueSubtabs[nextIndex];
  activateTechniqueSubtab(nextTrigger);
  nextTrigger.focus();
}

function activateDropSubtab(trigger) {
  const target = trigger.dataset.dropSubtab;

  dropSubtabs.forEach((item) => {
    const isActive = item === trigger;
    item.setAttribute("aria-selected", String(isActive));
    item.setAttribute("tabindex", isActive ? "0" : "-1");
  });

  dropSubtabPanels.forEach((panel) => {
    const isActive = panel.dataset.dropPanel === target;
    panel.hidden = !isActive;
    panel.classList.toggle("active", isActive);
  });

  if (target === "manual") {
    stopDropCamera();
  }
}

function moveDropSubtabFocus(currentTrigger, direction) {
  const currentIndex = dropSubtabs.indexOf(currentTrigger);
  if (currentIndex < 0) return;

  const nextIndex = (currentIndex + direction + dropSubtabs.length) % dropSubtabs.length;
  const nextTrigger = dropSubtabs[nextIndex];
  activateDropSubtab(nextTrigger);
  nextTrigger.focus();
}

function toggleManagerSubtab(trigger) {
  const target = trigger.dataset.managerSubtab;
  const shouldOpen = trigger.getAttribute("aria-expanded") !== "true";

  managerSubtabs.forEach((item) => {
    const isTarget = item === trigger && shouldOpen;
    item.setAttribute("aria-selected", String(isTarget));
    item.setAttribute("aria-expanded", String(isTarget));
    item.setAttribute("tabindex", "0");
  });

  managerSubtabPanels.forEach((panel) => {
    const isTarget = panel.dataset.managerPanel === target && shouldOpen;
    panel.hidden = !isTarget;
    panel.classList.toggle("active", isTarget);
  });
}

function openDocumentChecklist() {
  if (!documentChecklistTrigger || !documentChecklistPanel) return;
  documentChecklistPanel.hidden = false;
  documentChecklistTrigger.setAttribute("aria-expanded", "true");
}

function closeDocumentChecklist() {
  if (!documentChecklistTrigger || !documentChecklistPanel) return;
  documentChecklistPanel.hidden = true;
  documentChecklistTrigger.setAttribute("aria-expanded", "false");
}

function toggleDocumentChecklist() {
  if (documentChecklistPanel?.hidden) {
    openDocumentChecklist();
  } else {
    closeDocumentChecklist();
  }
}

function openDocumentNote() {
  if (!documentNoteTrigger || !documentNotePanel) return;
  documentNotePanel.hidden = false;
  documentNoteTrigger.setAttribute("aria-expanded", "true");
}

function closeDocumentNote() {
  if (!documentNoteTrigger || !documentNotePanel) return;
  documentNotePanel.hidden = true;
  documentNoteTrigger.setAttribute("aria-expanded", "false");
}

function toggleDocumentNote() {
  if (documentNotePanel?.hidden) {
    openDocumentNote();
  } else {
    closeDocumentNote();
  }
}

function openMaterialChecklistPanel() {
  if (!documentMaterialTrigger || !documentMaterialPanel) return;
  documentMaterialPanel.hidden = false;
  documentMaterialTrigger.setAttribute("aria-expanded", "true");
}

function closeMaterialChecklistPanel() {
  if (!documentMaterialTrigger || !documentMaterialPanel) return;
  documentMaterialPanel.hidden = true;
  documentMaterialTrigger.setAttribute("aria-expanded", "false");
}

function toggleMaterialChecklistPanel() {
  if (documentMaterialPanel?.hidden) {
    openMaterialChecklistPanel();
  } else {
    closeMaterialChecklistPanel();
  }
}

function openHashTab() {
  const aliases = {
    "boas-vindas": "historia",
    avaliacao: "indicacoes",
    plano: "prescricao",
    checklist: "documentos",
    "material-checklist": "documentos",
    monitoramento: "documentos",
    cuidador: "orientacoes-cuidador",
    gestores: "para-gestores",
  };
  const rawHash = window.location.hash.replace("#", "");
  const targetElement = rawHash ? document.getElementById(rawHash) : null;
  const targetPanel = targetElement?.classList.contains("tab-panel")
    ? targetElement
    : targetElement?.closest(".tab-panel");

  if (targetPanel) {
    const nestedTab = tabs.find((item) => item.dataset.tab === targetPanel.id);
    if (nestedTab) {
      activateTab(nestedTab, { scrollToPanel: false });
      history.replaceState(null, "", `#${rawHash}`);
      window.requestAnimationFrame(() => {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }
  }

  const target = aliases[rawHash] || rawHash || "historia";
  const tab = tabs.find((item) => item.dataset.tab === target);
  if (tab) activateTab(tab, { scrollToPanel: Boolean(rawHash) });
  if (rawHash === "checklist") openDocumentChecklist();
  if (rawHash === "material-checklist") openMaterialChecklistPanel();
}

function readChecklist() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function saveChecklist() {
  localStorage.setItem(storageKey, JSON.stringify(checklistItems.map((item) => item.checked)));
}

function updateChecklistProgress() {
  const checked = checklistItems.filter((item) => item.checked).length;
  const total = checklistItems.length;
  const percent = total ? Math.round((checked / total) * 100) : 0;
  checklistCount.textContent = `${checked} de ${total} itens marcados`;
  checklistProgress.style.width = `${percent}%`;
}

function restoreChecklist() {
  const saved = readChecklist();
  checklistItems.forEach((item, index) => {
    item.checked = Boolean(saved[index]);
  });
  updateChecklistProgress();
}

function readMaterialChecklist() {
  try {
    return JSON.parse(localStorage.getItem(materialStorageKey)) || [];
  } catch {
    return [];
  }
}

function saveMaterialChecklist() {
  localStorage.setItem(
    materialStorageKey,
    JSON.stringify(materialChecklistItems.map((item) => item.checked)),
  );
}

function updateMaterialChecklistProgress() {
  if (!materialChecklistCount || !materialChecklistProgress) return;
  const checked = materialChecklistItems.filter((item) => item.checked).length;
  const total = materialChecklistItems.length;
  const percent = total ? Math.round((checked / total) * 100) : 0;
  materialChecklistCount.textContent = `${checked} de ${total} itens marcados`;
  materialChecklistProgress.style.width = `${percent}%`;
}

function restoreMaterialChecklist() {
  const saved = readMaterialChecklist();
  materialChecklistItems.forEach((item, index) => {
    item.checked = Boolean(saved[index]);
  });
  updateMaterialChecklistProgress();
}

const compatibilityLabels = {
  morfina: "Morfina",
  clorpromazina: "Clorpromazina",
  ceftriaxona: "Ceftriaxona",
  dipirona: "Dipirona",
  dexametasona: "Dexametasona",
  haloperidol: "Haloperidol",
  midazolam: "Midazolam",
  sf: "Soro fisiológico 0,9% (SF)",
  sg5: "Soro glicosado 5% (SG 5%)",
};

const compatibilityPairs = {
  "haloperidol::morfina": {
    status: "compatível",
    className: "success",
    source: "Compatibilidade refs. 3, 5",
    detail:
      'Combinação frequente; há dados parenterais em SF 0,9% sem precipitação.<sup class="ref-mark">3,5</sup>',
  },
  "midazolam::morfina": {
    status: "compatível",
    className: "success",
    source: "Compatibilidade refs. 4, 5",
    detail:
      'Combinação muito usada em infusão subcutânea contínua; há relato de boa tolerabilidade local.<sup class="ref-mark">4,5</sup>',
  },
  "haloperidol::midazolam": {
    status: "compatível",
    className: "success",
    source: "Compatibilidade refs. 3, 5",
    detail:
      'A combinação morfina + haloperidol + midazolam é descrita como frequente em CSCI em cuidados paliativos.<sup class="ref-mark">3,5</sup>',
  },
  "dipirona::morfina": {
    status: "compatível",
    className: "success",
    source: "OE",
    detail: 'Compatível para uso conforme orientação cadastrada na prescrição.<sup class="ref-mark">OE</sup>',
  },
  "morfina::sg5": {
    status: "compatível",
    className: "success",
    source: "Compatibilidade ref. 7",
    detail:
      'Solução de glicose 5% associada a SF 0,9% com morfina foi descrita como bem tolerada em hipodermóclise.<sup class="ref-mark">7</sup>',
  },
  "sf::sg5": {
    status: "compatível",
    className: "success",
    source: "Compatibilidade ref. 7",
    detail:
      'A associação 2/3 glicose 5% + 1/3 SF 0,9% foi descrita em hipodermóclise.<sup class="ref-mark">7</sup>',
  },
  "clorpromazina::morfina": {
    status: "dados insuficientes",
    className: "warning",
    source: "Compatibilidade ref. 3",
    detail:
      "Há dados em coquetéis parenterais, mas não dado SC direto para o par isolado.",
  },
  "clorpromazina::haloperidol": {
    status: "dados insuficientes",
    className: "warning",
    source: "Compatibilidade ref. 3",
    detail:
      "Sem precipitação em coquetel parenteral com morfina e haloperidol, mas não há dado SC direto para o par isolado.",
  },
  "clorpromazina::midazolam": {
    status: "dados insuficientes",
    className: "warning",
    source: "Dados insuficientes",
    detail:
      "Não há dado específico para via SC/hipodermóclise; a clorpromazina é descrita como potencialmente irritante por via subcutânea.",
  },
  "dexametasona::morfina": {
    status: "dados insuficientes",
    className: "warning",
    source: "Dados insuficientes",
    detail:
      "Combinação usada na prática, mas a fonte destaca falta de apoio laboratorial formal para muitas associações.",
  },
  "dexametasona::haloperidol": {
    status: "dados insuficientes",
    className: "warning",
    source: "Dados insuficientes",
    detail:
      "A dexametasona aparece como usada por via SC, mas não foi estudada nessas combinações específicas.",
  },
  "dexametasona::midazolam": {
    status: "dados insuficientes",
    className: "warning",
    source: "Dados insuficientes",
    detail:
      "A dexametasona aparece como usada por via SC, mas não há detalhamento de compatibilidade com midazolam nas misturas citadas.",
  },
};

const prescriptionData = {
  morfina: {
    dose: "Bolus SC: 2-3mg a cada 4 horas; infusão contínua: 10-20mg/dia, com ajuste individualizado",
    dilution:
      "Preferir soro fisiológico 0,9%; diluir a dose prescrita em SF 0,9% conforme volume planejado. É possível fazer sem diluição (OE)",
    time:
      "Bolus ou infusão contínua; velocidade usual entre 20-100mL/h, equivalente a aproximadamente 7-33 gotas/min em equipo de macrogotas",
    minVolume: "",
    comments:
      "Não existe dose máxima definida. Iniciar com doses menores em idosos, pacientes frágeis ou com doença renal, monitorando sedação, depressão respiratória, edema, irritação, hematoma ou infecção local. Preferir diluição da medicação que será infundida em 24h no lugar de solução 1:1 a fim de evitar desperdício de medicação (OE).",
    reference: "1, 2, 3, 5, OE",
  },
  clorpromazina: {
    dose: "12,5 a 50mg até de 6/6h (dose máxima 150mg/dia)",
    dilution: "SF 50mL (intermitente); SF 100mL (infusão contínua)",
    time: "30min ou infusão contínua",
    minVolume: "",
    comments: "Se infusão contínua, usar frasco sem PVC.",
    reference: "6, 7, 8",
  },
  ceftriaxona: {
    dose:
      "1 a 2g SC a cada 24h, conforme indicação clínica, prescrição e protocolo local. Em coorte com pacientes acima de 75 anos, a dose média foi próxima de 1g/dia",
    dilution: "Diluição em SF 0,9% 100 ml",
    time: "Infundir em 60min (OE)",
    minVolume: "",
    comments:
      "Evidências em adultos, especialmente idosos, descrevem uso SC como alternativa viável quando o acesso venoso é difícil. No estudo prospectivo em cuidados paliativos, não houve suspensão por intolerância local; quando houve irritação, foi manejada com troca do ponto de infusão. Reações locais, como edema, dor, induração, rubor ou irritação, devem ser monitoradas.",
    reference: "5, 16, 17, 18, 19, 20",
  },
  dipirona: {
    dose: "1 a 2g até 6/6h, conforme protocolo local",
    dilution: "Diluir em 50mL de SF (OE)",
    time: "Infundir em 30min (OE)",
    minVolume: "",
    comments:
      "As fontes revisadas não encontraram estudos com parâmetros específicos de volume, diluição ou taxa de infusão para metamizol/dipirona por hipodermóclise.",
    reference: "5, OE",
  },
  dexametasona: {
    dose: "2 a 16mg a cada 24h",
    dilution: "Diluir em 50mL de SF (OE)",
    time: "Infundir em 30min (OE)",
    minVolume: "",
    comments:
      "Geralmente utilizada em via exclusiva, porém é possível utilizar outras medicações no mesmo sítio desde que seja respeitado o intervalo de no mínimo 60min (OE). Estudos descrevem uso subcutâneo frequente em cuidados paliativos, mas não trazem volume, concentração ou taxa em mL/h específicos para dexametasona.",
    reference: "5, 9, 10, OE",
  },
  haloperidol: {
    dose: "Em CSCI, mediana aproximada de 2,5 a 3mg/24h; faixa observada de 0,5 a 10mg/24h",
    dilution:
      "Os estudos de CSCI não especificam receita padrão de diluição, volume final ou taxa em mL/h para haloperidol isolado",
    time: "Bolus lento ou infusão subcutânea contínua, geralmente em 24h",
    minVolume: "",
    comments: "",
    reference: "5, 10, 11, 12, 13, 14",
  },
  midazolam: {
    dose: "1 a 5mg em bolus ou infusão contínua, titulando conforme sintomas",
    dilution: "SF 0,9% 5mL para bolus; em CSCI, ajustar volume final conforme protocolo local e dispositivo disponível",
    time: "Bolus ou infusão subcutânea contínua, geralmente em 24h",
    minVolume: "",
    comments:
      "Pode causar irritação local. Velocidade de infusão de 0,5mL/h a 20mL/h, equivalente a aproximadamente 0,2-7 gotas/min em equipo de macrogotas.",
    reference: "5, 12, 13, 15",
  },
  sf: {
    dose: "Máximo de 1500mL em 24h conforme sítio de punção",
    dilution: "Solução pronta para infusão",
    time: "Infusão contínua conforme prescrição e tolerância local",
    minVolume: "",
    comments:
      "Atentar para tolerância volêmica de acordo com o tecido subcutâneo do paciente (OE). Volume de infusão máximo 62,5mL/h, equivalente a aproximadamente 21 gotas/min em equipo de macrogotas. Considerar o limite de volume conforme o sítio de punção escolhido.",
    reference: "5, 6, 7, OE",
  },
  sg5: {
    dose: "Máximo de 1500mL em 24h conforme sítio de punção",
    dilution: "Solução pronta para infusão; preferir uso associado à solução salina/isotônica quando indicado",
    time: "Infusão contínua conforme prescrição e tolerância local",
    minVolume: "",
    comments:
      "Atentar para tolerância volêmica de acordo com o tecido subcutâneo do paciente (OE). Volume de infusão máximo 62,5mL/h, equivalente a aproximadamente 21 gotas/min em equipo de macrogotas. Considerar o limite de volume conforme o sítio de punção escolhido.",
    reference: "5, 21",
  },
};

function compatibilityKey(first, second) {
  return [first, second].sort().join("::");
}

function syncCompatibilityOptions() {
  [compatItemA, compatItemB].forEach((control) => {
    const other = control === compatItemA ? compatItemB : compatItemA;
    Array.from(control.options).forEach((option) => {
      option.disabled = option.value !== control.value && option.value === other.value;
    });
  });
}

function renderCompatibilityResult() {
  if (compatItemA.value === compatItemB.value) {
    const fallback = Array.from(compatItemB.options).find(
      (option) => option.value && option.value !== compatItemA.value,
    );
    if (fallback) compatItemB.value = fallback.value;
  }

  syncCompatibilityOptions();

  const first = compatItemA.value;
  const second = compatItemB.value;
  let result;
  const explicitPair = compatibilityPairs[compatibilityKey(first, second)];

  if (explicitPair) {
    result = explicitPair;
  } else if (first === "sf" || second === "sf") {
    result = {
      status: "compatível",
      className: "success",
      source: "Compatibilidade refs. 1, 2, 3",
      detail: 'SF 0,9% é o diluente presente nas combinações com melhor suporte descritas na fonte.<sup class="ref-mark">1,2,3</sup>',
    };
  } else if (first === "sg5" || second === "sg5") {
    result = {
      status: "dados insuficientes",
      className: "warning",
      source: "Compatibilidade ref. 7",
      detail:
        'Não há dados diretos de compatibilidade físico-química ou segurança local para esta mistura em soro glicosado 5%, com ou sem SF 0,9%.<sup class="ref-mark">7</sup>',
    };
  } else if (first === "ceftriaxona" || second === "ceftriaxona") {
    result = {
      status: "dados insuficientes",
      className: "warning",
      source: "Compatibilidade refs. 2, 5, 6",
      detail:
        'Não há dado específico de mistura, na mesma seringa ou bomba subcutânea, envolvendo ceftriaxona com os demais medicamentos desta matriz.<sup class="ref-mark">2,5,6</sup>',
    };
  } else if (first === "dipirona" || second === "dipirona") {
    result = {
      status: "dados insuficientes",
      className: "warning",
      source: "Dados insuficientes",
      detail: "As fontes não apresentam dado direto de compatibilidade da dipirona nessas misturas.",
    };
  } else {
    result = {
      status: "dados insuficientes",
      className: "warning",
      detail: "Não há dado direto na fonte para este par. Priorize confirmação farmacêutica ou sítio separado.",
    };
  }

  compatInteractiveResult.className = `status-panel ${result.className}`;
  compatInteractiveResult.innerHTML = `
    <h2>${result.status}</h2>
    <p>${compatibilityLabels[first]} + ${compatibilityLabels[second]}: ${result.detail}</p>
  `;
}

function getCompatibility(first, second) {
  if (first === second) {
    return { status: "compatível", className: "success", source: "Mesmo item" };
  }
  const explicitPair = compatibilityPairs[compatibilityKey(first, second)];
  if (explicitPair) return explicitPair;
  if (first === "sf" || second === "sf") {
    return { status: "compatível", className: "success", source: "Compatibilidade refs. 1, 2, 3" };
  }
  if (first === "sg5" || second === "sg5") {
    return { status: "dados insuficientes", className: "warning", source: "Compatibilidade ref. 7" };
  }
  if (first === "ceftriaxona" || second === "ceftriaxona") {
    return { status: "dados insuficientes", className: "warning", source: "Compatibilidade refs. 2, 5, 6" };
  }
  if (first === "dipirona" || second === "dipirona") {
    return { status: "dados insuficientes", className: "warning", source: "Dados insuficientes" };
  }
  return (
    compatibilityPairs[compatibilityKey(first, second)] || {
      status: "dados insuficientes",
      className: "warning",
      source: "Dados insuficientes",
    }
  );
}

function canSharePuncture(item, group) {
  return group.every((existing) => getCompatibility(item, existing).status === "compatível");
}

function groupItemsByCompatibility(items) {
  const groups = [];
  items.forEach((item) => {
    const compatibleGroup = groups.find((group) => canSharePuncture(item, group));
    if (compatibleGroup) {
      compatibleGroup.push(item);
    } else {
      groups.push([item]);
    }
  });
  return groups;
}

function selectedPrescriptionItems() {
  return prescriptionItemControls.map((control) => control.value).filter(Boolean);
}

function syncPrescriptionOptions() {
  prescriptionItemControls = Array.from(document.querySelectorAll(".prescription-item"));
}

function updatePrescriptionOptionAvailability() {
  const selectedItems = selectedPrescriptionItems();
  prescriptionItemControls.forEach((control) => {
    Array.from(control.options).forEach((option) => {
      option.disabled =
        Boolean(option.value) &&
        option.value !== control.value &&
        selectedItems.includes(option.value);
    });
  });
}

function prescriptionOptionMarkup() {
  return `
    <option value="">Nenhum item</option>
    <option value="morfina">Morfina</option>
    <option value="clorpromazina">Clorpromazina</option>
    <option value="ceftriaxona">Ceftriaxona</option>
    <option value="dipirona">Dipirona</option>
    <option value="dexametasona">Dexametasona</option>
    <option value="haloperidol">Haloperidol</option>
    <option value="midazolam">Midazolam</option>
    <option value="sf">Soro fisiológico 0,9% (SF)</option>
    <option value="sg5">Soro glicosado 5% (SG 5%)</option>
  `;
}

function refreshPrescriptionItemLabels() {
  prescriptionItemControls.forEach((control, index) => {
    const label = control.closest(".form-row");
    const labelText = label?.querySelector("span");
    if (labelText) labelText.textContent = `Item ${index + 1}`;
  });
}

function bindPrescriptionItem(control) {
  control.addEventListener("change", () => {
    syncPrescriptionOptions();
    updatePrescriptionOptionAvailability();
    generatePrescription();
  });
}

function addPrescriptionItem() {
  if (!prescriptionItemsContainer) return;

  const label = document.createElement("label");
  label.className = "form-row";
  label.innerHTML = `
    <span>Item ${prescriptionItemControls.length + 1}</span>
    <select class="prescription-item">
      ${prescriptionOptionMarkup()}
    </select>
  `;

  prescriptionItemsContainer.append(label);
  const control = label.querySelector(".prescription-item");
  prescriptionItemControls.push(control);
  bindPrescriptionItem(control);
  refreshPrescriptionItemLabels();
  updatePrescriptionOptionAvailability();
  control.focus();
}

function prescriptionCompatibilityLines(items) {
  const lines = [];
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const first = items[i];
      const second = items[j];
      const result = getCompatibility(first, second);
      lines.push(
        `- ${compatibilityLabels[first]} + ${compatibilityLabels[second]}: ${result.status}`,
      );
    }
  }
  return lines.length ? lines : ["- Apenas um item selecionado; não há pares para comparar."];
}

function prescriptionItemLines(item) {
  const data = prescriptionData[item];
  const lines = [
    `  - ${compatibilityLabels[item]}: ${data.dose}; diluição: ${data.dilution}; tempo de infusão: ${data.time}.`,
  ];
  if (data.minVolume) lines.push(`    Menor volume: ${data.minVolume}`);
  if (data.comments) lines.push(`    Comentários: ${data.comments}`);
  lines.push(`    Referências da aba Medicamentos e soluções: ${data.reference}`);
  return lines;
}

function renderPunctureGroups(groups) {
  punctureGroups.innerHTML = groups
    .map(
      (group, index) => `
        <section class="puncture-card">
          <h3>Punção ${index + 1}</h3>
          <ul>
            ${group
              .map((item) => {
                const data = prescriptionData[item];
                return `
                  <li>
                    <strong>${compatibilityLabels[item]}</strong>
                    <span>Dose: ${data.dose}</span>
                    <span>Diluição: ${data.dilution}</span>
                    <span>Tempo: ${data.time}</span>
                  </li>
                `;
              })
              .join("")}
          </ul>
        </section>
      `,
    )
    .join("");
}

function generatePrescription() {
  const items = selectedPrescriptionItems();
  if (!items.length) {
    punctureHighlight.className = "status-panel prescription-highlight warning";
    punctureHighlight.innerHTML = `
      <h2>Quantidade de hipodermóclises sugerida:</h2>
      <p>Selecione pelo menos um item.</p>
    `;
    punctureGroups.innerHTML = "";
    return;
  }

  const groups = groupItemsByCompatibility(items);
  const punctureWord = groups.length === 1 ? "punção de hipodermóclise" : "punções de hipodermóclises";
  punctureHighlight.className = "status-panel prescription-highlight success";
  punctureHighlight.innerHTML = `
    <h2>Quantidade de hipodermóclises sugerida:</h2>
    <p>${groups.length} ${punctureWord} para ${items.length} item(ns) selecionado(s).</p>
  `;
  renderPunctureGroups(groups);
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => activateTab(tab, { scrollToPanel: true }));
});

window.addEventListener("hashchange", openHashTab);

if (documentChecklistTrigger) {
  documentChecklistTrigger.addEventListener("click", toggleDocumentChecklist);
}

if (documentNoteTrigger) {
  documentNoteTrigger.addEventListener("click", toggleDocumentNote);
}

if (documentMaterialTrigger) {
  documentMaterialTrigger.addEventListener("click", toggleMaterialChecklistPanel);
}

if (closeChecklistButton) {
  closeChecklistButton.addEventListener("click", closeDocumentChecklist);
}

if (closeDocumentNoteButton) {
  closeDocumentNoteButton.addEventListener("click", closeDocumentNote);
}

if (closeMaterialChecklistPanelButton) {
  closeMaterialChecklistPanelButton.addEventListener("click", closeMaterialChecklistPanel);
}

[compatItemA, compatItemB].forEach((control) => {
  control.addEventListener("change", renderCompatibilityResult);
});

prescriptionItemControls.forEach(bindPrescriptionItem);

if (addPrescriptionItemButton) {
  addPrescriptionItemButton.addEventListener("click", addPrescriptionItem);
}

document.querySelector("#clearPrescription").addEventListener("click", () => {
  prescriptionItemControls.forEach((control) => {
    control.value = "";
  });
  syncPrescriptionOptions();
  refreshPrescriptionItemLabels();
  punctureHighlight.className = "status-panel prescription-highlight";
  punctureHighlight.innerHTML = `
    <h2>Quantidade de hipodermóclises sugerida:</h2>
    <p>Selecione os itens para gerar a prescrição automaticamente.</p>
  `;
  punctureGroups.innerHTML = "";
});

if (startDropCameraButton) {
  startDropCameraButton.addEventListener("click", startDropCamera);
}

if (stopDropCameraButton) {
  stopDropCameraButton.addEventListener("click", stopDropCamera);
}

if (startAutoDropCounterButton) {
  startAutoDropCounterButton.addEventListener("click", startAutoDropCounter);
}

if (stopAutoDropCounterButton) {
  stopAutoDropCounterButton.addEventListener("click", stopAutoDropCounter);
}

if (recordDropButton) {
  recordDropButton.addEventListener("click", recordDrop);
}

if (resetDropCounterButton) {
  resetDropCounterButton.addEventListener("click", resetDropCounter);
}

if (resetAutoDropCounterButton) {
  resetAutoDropCounterButton.addEventListener("click", () => {
    resetDropCounter();
    resetAutoDropDetection();
    if (autoDropActive) {
      setDropCameraStatus(
        "Contagem zerada. Recalibrando a imagem para continuar a contagem automática.",
        "success",
      );
    }
  });
}

if (manualDropsMinute) {
  manualDropsMinute.addEventListener("input", syncManualFromDropsMinute);
}

if (manualMlHour) {
  manualMlHour.addEventListener("input", syncManualFromMlHour);
}

checklistItems.forEach((item) => {
  item.addEventListener("change", () => {
    saveChecklist();
    updateChecklistProgress();
  });
});

materialChecklistItems.forEach((item) => {
  item.addEventListener("change", () => {
    saveMaterialChecklist();
    updateMaterialChecklistProgress();
  });
});

materialSubtabs.forEach((trigger) => {
  trigger.addEventListener("click", () => activateMaterialSubtab(trigger));
});

materialListSubtabs.forEach((trigger) => {
  trigger.addEventListener("click", () => activateMaterialListSubtab(trigger));
  trigger.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      moveMaterialListSubtabFocus(trigger, 1);
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      moveMaterialListSubtabFocus(trigger, -1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      activateMaterialListSubtab(materialListSubtabs[0]);
      materialListSubtabs[0].focus();
    }

    if (event.key === "End") {
      event.preventDefault();
      const lastTrigger = materialListSubtabs[materialListSubtabs.length - 1];
      activateMaterialListSubtab(lastTrigger);
      lastTrigger.focus();
    }
  });
});

techniqueSubtabs.forEach((trigger) => {
  trigger.addEventListener("click", () => activateTechniqueSubtab(trigger));
  trigger.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      moveTechniqueSubtabFocus(trigger, 1);
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      moveTechniqueSubtabFocus(trigger, -1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      activateTechniqueSubtab(techniqueSubtabs[0]);
      techniqueSubtabs[0].focus();
    }

    if (event.key === "End") {
      event.preventDefault();
      const lastTrigger = techniqueSubtabs[techniqueSubtabs.length - 1];
      activateTechniqueSubtab(lastTrigger);
      lastTrigger.focus();
    }
  });
});

dropSubtabs.forEach((trigger) => {
  trigger.addEventListener("click", () => activateDropSubtab(trigger));
  trigger.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      moveDropSubtabFocus(trigger, 1);
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      moveDropSubtabFocus(trigger, -1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      activateDropSubtab(dropSubtabs[0]);
      dropSubtabs[0].focus();
    }

    if (event.key === "End") {
      event.preventDefault();
      const lastTrigger = dropSubtabs[dropSubtabs.length - 1];
      activateDropSubtab(lastTrigger);
      lastTrigger.focus();
    }
  });
});

managerSubtabs.forEach((trigger) => {
  trigger.addEventListener("click", () => toggleManagerSubtab(trigger));
  trigger.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleManagerSubtab(trigger);
    }
  });
});

document.querySelector("#clearChecklist").addEventListener("click", () => {
  checklistItems.forEach((item) => {
    item.checked = false;
  });
  saveChecklist();
  updateChecklistProgress();
});

if (clearMaterialChecklistButton) {
  clearMaterialChecklistButton.addEventListener("click", () => {
    materialChecklistItems.forEach((item) => {
      item.checked = false;
    });
    saveMaterialChecklist();
    updateMaterialChecklistProgress();
  });
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => changeLanguage(button.dataset.language));
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const body = [
    `Nome: ${formData.get("name") || ""}`,
    `E-mail: ${formData.get("email") || ""}`,
    `Perfil: ${formData.get("profile") || ""}`,
    "",
    "Sugestão:",
    formData.get("message") || "",
  ].join("\n");

  const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(
    "Sugestão de melhoria - iCare"
  )}&body=${encodeURIComponent(body)}`;

  window.location.href = mailto;
  contactResult.classList.add("show");
  contactForm.reset();
});

restoreChecklist();
restoreMaterialChecklist();
markActiveLanguage(currentLanguage());
renderCompatibilityResult();
syncPrescriptionOptions();
updatePrescriptionOptionAvailability();
updateVisitCounter();
initializeDropCameraAccess();
openHashTab();

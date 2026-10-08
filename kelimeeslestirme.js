"use strict";

const wordFileUrl = new URL("./kelimeler.txt", document.baseURI);
const villageStorageKey = "kelime-eslestirme.koy.agaclar";
const cityStorageKey = "kelime-eslestirme.sehir.ilerleme.v2";
const cityPlots = Array.from({ length: 20 }, (_, index) => ({
  x: [110, 305, 500, 695, 890][index % 5],
  y: [250, 335, 420, 505][Math.floor(index / 5)],
  scale: [0.76, 0.83, 0.9, 0.97][Math.floor(index / 5)]
}));
const cityMaximumProgress = cityPlots.length * 6;
const scoreMilestoneMessages = new Map([
  [100, "100 puan! Çok güzel gidiyorsun, böyle devam!"],
  [200, "200 puan! Her eşleşmede biraz daha ustalaşıyorsun."],
  [300, "300 puan! Kelime bilgin gerçekten güçleniyor."],
  [400, "400 puan! Azmin harika, seninle gurur duyuyoruz."],
  [500, "500 puan! Yarı yolu geçtin, müthiş bir iş çıkarıyorsun!"],
  [600, "600 puan! Bu istikrarınla her kelimeyi öğrenirsin."],
  [700, "700 puan! Emeğinin karşılığı parlıyor, devam et!"],
  [800, "800 puan! Neredeyse hedefte, harika bir oyuncusun."],
  [900, "900 puan! Bin puana sadece bir adım kaldı!"],
  [1000, "1000 puan! İnanılmazsın, bu başarı tamamen senin!"]
]);
const spaceStorageKey = "kelime-eslestirme.uzay.ilerleme";
const spacePlots = Array.from({ length: 20 }, (_, index) => ({
  x: [100, 300, 500, 700, 900][index % 5],
  y: [338, 378, 418, 458][Math.floor(index / 5)],
  scale: [0.58, 0.7, 0.82, 0.94][Math.floor(index / 5)]
}));
const spaceModuleTypes = ["habitat", "solar", "antenna", "greenhouse", "rover"];
const cityDialogues = [
  "Artık köye gitmek istiyorum.",
  "Geceleri bazen yalnız hissediyorum.",
  "Bugün gün batımı çok güzeldi.",
  "Bir fincan çay iyi giderdi.",
  "Yeni komşularımla tanışmayı bekliyorum.",
  "Balkona birkaç çiçek koymalıyım.",
  "Yağmur sesi burada çok huzurlu.",
  "Akşam yürüyüşüne çıkan var mı?",
  "Şehrimiz her gün biraz büyüyor.",
  "Fırından taze ekmek kokusu geliyor!",
  "Şu sokağa biraz daha ağaç lazım.",
  "Komşuya selam vermeyi unutmayayım.",
  "Bu manzara her gün başka güzel.",
  "Hafta sonu biraz dinlenmek istiyorum.",
  "Bir gün deniz kenarına taşınsam mı?"
];
const treeSpots = [
  { x: 44, y: 225, scale: 0.54 },
  { x: 93, y: 248, scale: 0.69 },
  { x: 146, y: 215, scale: 0.52 },
  { x: 197, y: 265, scale: 0.76 },
  { x: 246, y: 231, scale: 0.62 },
  { x: 294, y: 206, scale: 0.5 },
  { x: 342, y: 257, scale: 0.72 },
  { x: 391, y: 229, scale: 0.62 },
  { x: 438, y: 201, scale: 0.5 },
  { x: 481, y: 250, scale: 0.7 },
  { x: 526, y: 222, scale: 0.59 },
  { x: 566, y: 269, scale: 0.78 },
  { x: 620, y: 226, scale: 0.63 },
  { x: 656, y: 257, scale: 0.7 },
  { x: 694, y: 231, scale: 0.65 },
  { x: 729, y: 263, scale: 0.78 },
  { x: 752, y: 218, scale: 0.57 },
  { x: 790, y: 250, scale: 0.72 },
  { x: 817, y: 225, scale: 0.63 },
  { x: 850, y: 262, scale: 0.77 },
  { x: 875, y: 231, scale: 0.65 },
  { x: 908, y: 264, scale: 0.76 },
  { x: 941, y: 232, scale: 0.64 },
  { x: 973, y: 266, scale: 0.78 },
  { x: 122, y: 276, scale: 0.77 },
  { x: 274, y: 276, scale: 0.78 },
  { x: 421, y: 278, scale: 0.78 },
  { x: 612, y: 279, scale: 0.77 },
  { x: 802, y: 278, scale: 0.78 },
  { x: 951, y: 280, scale: 0.77 }
];
const svgNamespace = "http://www.w3.org/2000/svg";

const elements = {
  gameCard: document.querySelector(".game-card"),
  englishList: document.querySelector("#english-list"),
  turkishList: document.querySelector("#turkish-list"),
  englishCount: document.querySelector("#english-count"),
  turkishCount: document.querySelector("#turkish-count"),
  timer: document.querySelector("#timer"),
  score: document.querySelector("#score"),
  progressText: document.querySelector("#progress-text"),
  progressTrack: document.querySelector("#progress-track"),
  progressFill: document.querySelector("#progress-fill"),
  progressEncouragement: document.querySelector("#progress-encouragement"),
  gameMessage: document.querySelector("#game-message"),
  restartButton: document.querySelector("#restart-button"),
  milestoneToast: document.querySelector("#milestone-toast"),
  examplePanel: document.querySelector("#example-panel"),
  exampleType: document.querySelector("#example-type"),
  exampleEnglish: document.querySelector("#example-english"),
  exampleTurkish: document.querySelector("#example-turkish"),
  treeCount: document.querySelector("#tree-count"),
  treeSpots: document.querySelector("#tree-spots"),
  plantedTrees: document.querySelector("#planted-trees"),
  treeTemplate: document.querySelector("#village-tree-template"),
  villagePanel: document.querySelector(".village-panel"),
  villageStatus: document.querySelector("#village-status"),
  cityPanel: document.querySelector("#city-panel"),
  houseCount: document.querySelector("#house-count"),
  apartmentCount: document.querySelector("#apartment-count"),
  cityProgressText: document.querySelector("#city-progress-text"),
  cityProgressTrack: document.querySelector("#city-progress-track"),
  cityProgressFill: document.querySelector("#city-progress-fill"),
  cityPlots: document.querySelector("#city-plots"),
  cityBuildings: document.querySelector("#city-buildings"),
  cityDialogue: document.querySelector("#city-dialogue"),
  cityStatus: document.querySelector("#city-status"),
  spacePanel: document.querySelector("#space-panel"),
  spaceModuleCount: document.querySelector("#space-module-count"),
  spaceLevel: document.querySelector("#space-level"),
  spaceProgressText: document.querySelector("#space-progress-text"),
  spaceNextMilestone: document.querySelector("#space-next-milestone"),
  spacePlots: document.querySelector("#space-plots"),
  spaceInstallations: document.querySelector("#space-installations"),
  spaceSatellites: document.querySelector("#space-satellites"),
  spaceStatus: document.querySelector("#space-status")
};

let plantedTreeCount = loadPlantedTreeCount();
let cityProgress = loadCityProgress();
let spaceProgress = loadSpaceProgress();
let cityAnswersToDialogue = randomDialogueInterval();
let cityDialogueTimeout = null;
let previousCityDialogue = "";
let wordBank = [];
let currentWords = [];
let selectedEnglish = null;
let selectedTurkish = null;
let matchedIds = new Set();
let score = 0;
let highestAnnouncedMilestone = 0;
let elapsedSeconds = 0;
let timerInterval = null;
let mismatchTimeout = null;
let nextRoundTimeout = null;
let milestoneToastTimeout = null;
let inputLocked = false;
let gameFinished = false;
let dragState = null;
let suppressNextClick = false;

function shuffle(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function parseWordFile(contents) {
  const words = [];
  const invalidLines = [];
  const seenIds = new Set();
  const recordPattern = /^\{\s*id:\s*(\d+)\s*,\s*word:\s*("(?:\\.|[^"\\])*")\s*,\s*type:\s*("(?:\\.|[^"\\])*")\s*,\s*meaning:\s*("(?:\\.|[^"\\])*")\s*,\s*example:\s*("(?:\\.|[^"\\])*")\s*,\s*exampleTr:\s*("(?:\\.|[^"\\])*")\s*\},?\s*$/;

  contents.split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      return;
    }

    const match = line.match(recordPattern);
    if (!match) {
      invalidLines.push(index + 1);
      return;
    }

    try {
      const id = Number(match[1]);
      const [word, type, meaning, example, exampleTr] = match.slice(2).map((value) => JSON.parse(value));
      if (
        !Number.isSafeInteger(id) ||
        seenIds.has(id) ||
        !word.trim() ||
        !type.trim() ||
        !meaning.trim() ||
        !example.trim() ||
        !exampleTr.trim()
      ) {
        invalidLines.push(index + 1);
        return;
      }

      seenIds.add(id);
      words.push({ id, en: word, tr: meaning, type, example, exampleTr });
    } catch (error) {
      invalidLines.push(index + 1);
      console.error(`Kelime dosyasının ${index + 1}. satırı okunamadı.`, error);
    }
  });

  return { words, invalidLines };
}

async function loadWordBank() {
  const response = await fetch(wordFileUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`kelimeler.txt dosyası okunamadı (HTTP ${response.status}).`);
  }

  const { words, invalidLines } = parseWordFile(await response.text());
  if (invalidLines.length > 0) {
    console.warn(`kelimeler.txt dosyasında geçersiz satırlar atlandı: ${invalidLines.join(", ")}`);
  }
  if (words.length === 0) {
    throw new Error("kelimeler.txt dosyasında kullanılabilir kelime bulunamadı.");
  }

  return words;
}

function loadPlantedTreeCount() {
  try {
    const savedCount = Number(window.localStorage.getItem(villageStorageKey));
    return Number.isSafeInteger(savedCount) && savedCount > 0 ? savedCount : 0;
  } catch (error) {
    console.error("Köy ilerlemesi okunamadı; ağaçlar bu oturumda saklanır.", error);
    return 0;
  }
}

function loadCityProgress() {
  try {
    const savedProgress = Number(window.localStorage.getItem(cityStorageKey));
    return Number.isSafeInteger(savedProgress) && savedProgress > 0
      ? Math.min(savedProgress, cityMaximumProgress)
      : 0;
  } catch (error) {
    console.error("Şehir ilerlemesi okunamadı; şehir bu oturumda saklanır.", error);
    return 0;
  }
}

function loadSpaceProgress() {
  try {
    const savedProgress = Number(window.localStorage.getItem(spaceStorageKey));
    return Number.isSafeInteger(savedProgress) && savedProgress > 0 ? savedProgress : 0;
  } catch (error) {
    console.error("Uzay kolonisi ilerlemesi okunamadı; bu oturumda saklanır.", error);
    return 0;
  }
}

function savePlantedTreeCount() {
  try {
    window.localStorage.setItem(villageStorageKey, plantedTreeCount.toString());
  } catch (error) {
    console.error("Köy ilerlemesi kaydedilemedi; dikilen ağaçlar sayfayı yenileyince sıfırlanabilir.", error);
  }
}

function saveCityProgress() {
  try {
    window.localStorage.setItem(cityStorageKey, cityProgress.toString());
  } catch (error) {
    console.error("Şehir ilerlemesi kaydedilemedi; şehir sayfayı yenileyince sıfırlanabilir.", error);
  }
}

function saveSpaceProgress() {
  try {
    window.localStorage.setItem(spaceStorageKey, spaceProgress.toString());
  } catch (error) {
    console.error("Uzay kolonisi ilerlemesi kaydedilemedi; sayfa yenilenince sıfırlanabilir.", error);
  }
}

function randomDialogueInterval() {
  return 2 + Math.floor(Math.random() * 2);
}

function migrateVillageProgress() {
  if (plantedTreeCount <= treeSpots.length) {
    return;
  }

  plantedTreeCount = treeSpots.length;
  savePlantedTreeCount();
}

function updateMissionPanelVisibility() {
  const villageComplete = plantedTreeCount >= treeSpots.length;
  const cityComplete = cityProgress >= cityMaximumProgress;
  elements.villagePanel.hidden = villageComplete;
  elements.cityPanel.hidden = !villageComplete || cityComplete;
  elements.spacePanel.hidden = !villageComplete || !cityComplete;
}

function renderVillage(animateNewestTree = false) {
  const visibleTreeCount = Math.min(plantedTreeCount, treeSpots.length);
  const fragment = document.createDocumentFragment();
  elements.treeSpots.replaceChildren();
  const orderedSpots = treeSpots
    .map((spot, index) => ({ ...spot, index }))
    .sort((first, second) => first.y - second.y);

  orderedSpots.forEach((spot) => {
    if (spot.index >= visibleTreeCount && spot.index < visibleTreeCount + 5) {
      const plot = document.createElementNS(svgNamespace, "ellipse");
      plot.setAttribute("class", "planting-plot");
      plot.setAttribute("cx", spot.x.toString());
      plot.setAttribute("cy", (spot.y + 1).toString());
      plot.setAttribute("rx", (8 * spot.scale).toString());
      plot.setAttribute("ry", (3 * spot.scale).toString());
      plot.setAttribute("aria-hidden", "true");
      elements.treeSpots.append(plot);
    }

    if (spot.index >= visibleTreeCount) {
      return;
    }

    const tree = elements.treeTemplate.cloneNode(true);
    tree.removeAttribute("id");
    tree.setAttribute("class", "planted-tree");
    tree.setAttribute("transform", `translate(${spot.x} ${spot.y}) scale(${spot.scale * 1.35})`);
    tree.setAttribute("aria-hidden", "true");
    if (animateNewestTree && spot.index === plantedTreeCount - 1) {
      tree.classList.add("is-growing");
    }
    fragment.append(tree);
  });

  elements.plantedTrees.replaceChildren(fragment);
  elements.treeCount.textContent = plantedTreeCount.toLocaleString("tr-TR");
  updateMissionPanelVisibility();

  if (plantedTreeCount === 0) {
    elements.villageStatus.textContent = "Doğru cevaplarla köyüne ilk fidanı dik.";
  } else if (plantedTreeCount === 1) {
    elements.villageStatus.textContent = "İlk fidanın köyünde büyümeye başladı.";
  } else if (plantedTreeCount < 5) {
    elements.villageStatus.textContent = "Güzel gidiyorsun. Köyün yeşillenmeye başladı.";
  } else if (plantedTreeCount < treeSpots.length) {
    elements.villageStatus.textContent = "Köyün büyüyor; her doğru cevap yeni bir ağaca dönüşüyor.";
  } else {
    elements.villageStatus.textContent = "Köyün çevresinde yemyeşil bir koru büyüttün.";
  }
}

function createCityBuilding(index, apartment, animate) {
  const plot = cityPlots[index];
  const group = document.createElementNS(svgNamespace, "g");
  group.setAttribute("class", `city-building${apartment ? " is-apartment" : " is-house"}${animate ? " is-constructing" : ""}`);
  group.setAttribute("transform", `translate(${plot.x} ${plot.y}) scale(${plot.scale})`);
  group.setAttribute("aria-hidden", "true");

  const appendShape = (tag, attributes) => {
    const shape = document.createElementNS(svgNamespace, tag);
    Object.entries(attributes).forEach(([name, value]) => shape.setAttribute(name, value.toString()));
    group.append(shape);
    return shape;
  };

  appendShape("ellipse", { cx: 0, cy: 3, rx: apartment ? 34 : 31, ry: 7, class: "city-building-shadow" });

  if (apartment) {
    const wallColors = ["#c98f76", "#b98d73", "#c1a078", "#ad8792"];
    const wallColor = wallColors[index % wallColors.length];
    appendShape("rect", { x: -25, y: -72, width: 50, height: 72, rx: 2, fill: wallColor, class: "apartment-wall" });
    appendShape("rect", { x: -29, y: -75, width: 58, height: 6, rx: 1, fill: "#5a5559" });
    appendShape("path", { d: "M-25-49h50M-25-25h50", stroke: "#805f59", "stroke-width": 2, opacity: ".65" });
    [-61, -39, -15].forEach((y) => {
      [-15, 0, 15].forEach((x) => {
        appendShape("rect", { x: x - 4, y, width: 8, height: 10, rx: 1, class: "apartment-window" });
      });
    });
    appendShape("rect", { x: -5, y: -14, width: 10, height: 14, rx: 1, fill: "#594744" });
    appendShape("rect", { x: -28, y: -3, width: 56, height: 3, fill: "#d7b89b" });
  } else {
    const wallColors = ["#d6bd91", "#c99d82", "#c4c7a1", "#d6b4a3", "#b8c6bd"];
    const wallColor = wallColors[index % wallColors.length];
    appendShape("rect", { x: -27, y: -34, width: 54, height: 34, rx: 2, fill: wallColor });
    appendShape("path", { d: "M-34-33 0-57 34-33Z", fill: "#765a52" });
    appendShape("path", { d: "M-31-32 0-53 30-32", fill: "none", stroke: "#a87d68", "stroke-width": 2 });
    appendShape("rect", { x: -20, y: -25, width: 11, height: 11, rx: 1, class: "house-window" });
    appendShape("rect", { x: 9, y: -25, width: 11, height: 11, rx: 1, class: "house-window" });
    appendShape("rect", { x: -4, y: -17, width: 9, height: 17, rx: 1, fill: "#735647" });
    appendShape("circle", { cx: 2, cy: -9, r: 0.8, fill: "#e6ca8a" });
    appendShape("rect", { x: 20, y: -53, width: 6, height: 15, fill: "#765a52" });
    appendShape("rect", { x: -30, y: -3, width: 60, height: 3, fill: "#d4c1a0" });
  }

  return group;
}

function renderCity(animateBuildingIndex = -1) {
  const builtCount = Math.min(cityProgress, cityPlots.length);
  const apartmentCount = Math.min(
    Math.floor(Math.max(0, cityProgress - cityPlots.length) / 5),
    cityPlots.length
  );
  const plotFragment = document.createDocumentFragment();
  const buildingFragment = document.createDocumentFragment();

  cityPlots.forEach((plot, index) => {
    const pad = document.createElementNS(svgNamespace, "rect");
    pad.setAttribute("class", "city-plot");
    pad.setAttribute("x", (plot.x - 48).toString());
    pad.setAttribute("y", (plot.y - 62).toString());
    pad.setAttribute("width", "96");
    pad.setAttribute("height", "70");
    pad.setAttribute("rx", "3");
    pad.setAttribute("aria-hidden", "true");
    plotFragment.append(pad);

    if (index < builtCount) {
      buildingFragment.append(createCityBuilding(index, index < apartmentCount, index === animateBuildingIndex));
    }
  });

  elements.cityPlots.replaceChildren(plotFragment);
  elements.cityBuildings.replaceChildren(buildingFragment);
  const cityComplete = cityProgress >= cityMaximumProgress;
  updateMissionPanelVisibility();
  if (cityComplete) {
    window.clearTimeout(cityDialogueTimeout);
    elements.cityDialogue.replaceChildren();
  }
  elements.houseCount.textContent = (builtCount - apartmentCount).toLocaleString("tr-TR");
  elements.apartmentCount.textContent = apartmentCount.toLocaleString("tr-TR");
  elements.cityProgressText.textContent = `${cityProgress.toLocaleString("tr-TR")} / ${cityMaximumProgress.toLocaleString("tr-TR")} doğru cevap`;
  elements.cityProgressTrack.setAttribute("aria-valuenow", cityProgress.toString());
  elements.cityProgressFill.style.width = `${(cityProgress / cityMaximumProgress) * 100}%`;

  if (cityProgress >= cityMaximumProgress) {
    elements.cityStatus.textContent = "Şehrindeki bütün evler apartmana dönüştü. Şimdi uzay kolonisi zamanı!";
  } else if (cityProgress === 0) {
    elements.cityStatus.textContent = "Şehir arazin hazır. İlk doğru cevabınla bir ev inşa et.";
  } else if (cityProgress < cityPlots.length) {
    elements.cityStatus.textContent = `${cityPlots.length - builtCount} boş arsada daha müstakil ev bekliyor.`;
  } else if (apartmentCount === 0) {
    elements.cityStatus.textContent = "Evlerin tamam. Her 5 doğru cevapta bir ev apartmana dönüşecek.";
  } else {
    elements.cityStatus.textContent = `Şehrin büyüyor: ${apartmentCount} apartman yükseldi, ${builtCount - apartmentCount} müstakil ev kaldı.`;
  }
}

function appendSpaceShape(group, tag, attributes) {
  const shape = document.createElementNS(svgNamespace, tag);
  Object.entries(attributes).forEach(([name, value]) => shape.setAttribute(name, value.toString()));
  group.append(shape);
  return shape;
}

function createSpaceInstallation(index, upgraded, animate) {
  const plot = spacePlots[index];
  const type = spaceModuleTypes[index % spaceModuleTypes.length];
  const group = document.createElementNS(svgNamespace, "g");
  group.setAttribute(
    "class",
    `space-installation is-${type}${upgraded ? " is-upgraded" : ""}${animate ? " is-constructing" : ""}`
  );
  group.setAttribute("transform", `translate(${plot.x} ${plot.y}) scale(${plot.scale})`);
  group.setAttribute("aria-hidden", "true");
  appendSpaceShape(group, "ellipse", { cx: 0, cy: 3, rx: 37, ry: 5, class: "space-installation-shadow" });

  if (type === "habitat") {
    appendSpaceShape(group, "path", { d: "M-25 0v-20a25 20 0 0 1 50 0V0Z", fill: "url(#space-module)", stroke: "#536c86", "stroke-width": 2 });
    appendSpaceShape(group, "path", { d: "M-12-20a12 11 0 0 1 24 0v11h-24Z", fill: "#84b9d2", stroke: "#d6e7ec", "stroke-width": 1.5 });
    appendSpaceShape(group, "rect", { x: -6, y: -12, width: 12, height: 12, rx: 2, fill: "#617184" });
    appendSpaceShape(group, "path", { d: "M-33 0h66", stroke: "#e2b875", "stroke-width": 3 });
  } else if (type === "solar") {
    appendSpaceShape(group, "path", { d: "M0 0v-26m0-12v12", stroke: "#cbd3dc", "stroke-width": 3 });
    [-1, 1].forEach((direction) => {
      appendSpaceShape(group, "path", { d: `M${direction * 3}-30l${direction * 27}-13`, stroke: "#cbd3dc", "stroke-width": 2 });
      appendSpaceShape(group, "rect", {
        x: direction < 0 ? -56 : 30,
        y: -50,
        width: 27,
        height: 17,
        rx: 1,
        fill: upgraded ? "#69c4dc" : "#44759e",
        stroke: "#b0d9e5",
        "stroke-width": 1
      });
      appendSpaceShape(group, "path", { d: `M${direction < 0 ? -47 : 39}-50v17m9-17v17`, stroke: "#b6d9e5", "stroke-width": 1, opacity: ".75" });
    });
  } else if (type === "antenna") {
    appendSpaceShape(group, "path", { d: "M-13 0 0-37 13 0Zm-20 0h66", fill: "#9daab8", stroke: "#586d84", "stroke-width": 2 });
    appendSpaceShape(group, "path", { d: "M-3-35a18 18 0 0 1 26-9m-22 17a10 10 0 0 1 14-5", fill: "none", stroke: "#dce2e8", "stroke-width": 2, "stroke-linecap": "round" });
    appendSpaceShape(group, "circle", { cx: 0, cy: -37, r: 4, fill: "#f0d28a" });
  } else if (type === "greenhouse") {
    appendSpaceShape(group, "path", { d: "M-34 0v-18a34 24 0 0 1 68 0V0Z", fill: "#8ab7bc", "fill-opacity": ".74", stroke: "#d4e1dd", "stroke-width": 2 });
    appendSpaceShape(group, "path", { d: "M0-40v40m-22-32 11 32m33-32L11 0", stroke: "#d4e1dd", "stroke-width": 1.5, opacity: ".85" });
    [-18, 0, 18].forEach((x) => {
      appendSpaceShape(group, "path", { d: `M${x} 0v-12m0 5-5-5m5 8 5-6`, stroke: "#88bd8d", "stroke-width": 2, "stroke-linecap": "round" });
    });
  } else {
    appendSpaceShape(group, "rect", { x: -27, y: -22, width: 48, height: 19, rx: 6, fill: "#d5dbe0", stroke: "#5b6e82", "stroke-width": 2 });
    appendSpaceShape(group, "path", { d: "M-14-22v-10h17l9 10", fill: "#a8c9d4", stroke: "#5b6e82", "stroke-width": 2 });
    [-17, 12].forEach((x) => {
      appendSpaceShape(group, "circle", { cx: x, cy: -2, r: 7, fill: "#343c4c", stroke: "#d0b779", "stroke-width": 2 });
    });
    appendSpaceShape(group, "path", { d: "M-42-12h13m42 0h16", stroke: upgraded ? "#f1d58e" : "#81c9df", "stroke-width": 4 });
    appendSpaceShape(group, "circle", { cx: 31, cy: -26, r: 2, fill: "#f1d58e" });
  }

  return group;
}

function createOrbitalSatellite(index) {
  const orbitPositions = [
    { x: 151, y: 100, rotation: -12 },
    { x: 312, y: 186, rotation: 18 },
    { x: 472, y: 86, rotation: -8 },
    { x: 647, y: 161, rotation: 14 },
    { x: 761, y: 45, rotation: -16 },
    { x: 902, y: 216, rotation: 9 }
  ];
  const position = orbitPositions[index % orbitPositions.length];
  const group = document.createElementNS(svgNamespace, "g");
  group.setAttribute("class", "space-orbital-satellite");
  group.setAttribute("transform", `translate(${position.x} ${position.y}) rotate(${position.rotation})`);
  group.setAttribute("aria-hidden", "true");
  appendSpaceShape(group, "rect", { x: -5, y: -5, width: 10, height: 10, rx: 2, fill: "#e2d5ad", stroke: "#fff0c7", "stroke-width": 1.2 });
  appendSpaceShape(group, "path", { d: "M-5-2h-17v-7h17m10 7h17v-7H5", fill: "#5388b0", stroke: "#b4d9e6", "stroke-width": 1.2 });
  appendSpaceShape(group, "circle", { cx: 0, cy: 0, r: 2, fill: "#e7ab70" });
  return group;
}

function renderSpace(animateInstallationIndex = -1) {
  const moduleCount = Math.min(spaceProgress, spacePlots.length);
  const colonyLevel = Math.floor(spaceProgress / 5) + 1;
  const satelliteCount = Math.min(6, Math.max(0, Math.floor((spaceProgress - spacePlots.length) / 5)));
  const plotFragment = document.createDocumentFragment();
  const installationFragment = document.createDocumentFragment();
  const satelliteFragment = document.createDocumentFragment();

  spacePlots.forEach((plot, index) => {
    const pad = document.createElementNS(svgNamespace, "ellipse");
    pad.setAttribute("class", "space-site");
    pad.setAttribute("cx", plot.x.toString());
    pad.setAttribute("cy", (plot.y + 2).toString());
    pad.setAttribute("rx", (39 * plot.scale).toString());
    pad.setAttribute("ry", (5 * plot.scale).toString());
    pad.setAttribute("aria-hidden", "true");
    plotFragment.append(pad);

    if (index < moduleCount) {
      installationFragment.append(
        createSpaceInstallation(index, colonyLevel >= 5, index === animateInstallationIndex)
      );
    }
  });
  for (let index = 0; index < satelliteCount; index += 1) {
    satelliteFragment.append(createOrbitalSatellite(index));
  }

  elements.spacePlots.replaceChildren(plotFragment);
  elements.spaceInstallations.replaceChildren(installationFragment);
  elements.spaceSatellites.replaceChildren(satelliteFragment);
  elements.spaceModuleCount.textContent = moduleCount.toLocaleString("tr-TR");
  elements.spaceLevel.textContent = colonyLevel.toLocaleString("tr-TR");
  elements.spaceProgressText.textContent = `${spaceProgress.toLocaleString("tr-TR")} doğru cevap`;

  if (spaceProgress < spacePlots.length) {
    elements.spaceNextMilestone.textContent = `${spacePlots.length - spaceProgress} modül kaldı`;
    elements.spaceStatus.textContent = spaceProgress === 0
      ? "Uzay arazin hazır. İlk doğru cevabınla Ay üssünün temellerini at."
      : `Ay üssün büyüyor: ${moduleCount} / ${spacePlots.length} yapı kuruldu.`;
  } else {
    const answersToSatellite = 5 - ((spaceProgress - spacePlots.length) % 5);
    elements.spaceNextMilestone.textContent = `${answersToSatellite} doğru cevapta yeni uydu`;
    elements.spaceStatus.textContent = satelliteCount > 0
      ? `Ay üssün tamamlandı. Yörüngede ${satelliteCount} uydu görev yapıyor; yeni cevaplarla koloni seviyen yükseliyor.`
      : "Ay üssün tamamlandı. Yörüngeye ilk uyduyu göndermek için 5 doğru cevap daha!";
  }
}

function wrapCityDialogue(text, maxCharacters = 27) {
  const lines = [];
  let line = "";

  text.split(/\s+/).forEach((word) => {
    const nextLine = line ? `${line} ${word}` : word;
    if (nextLine.length > maxCharacters && line) {
      lines.push(line);
      line = word;
    } else {
      line = nextLine;
    }
  });
  if (line) {
    lines.push(line);
  }
  return lines;
}

function showCityDialogue() {
  const builtCount = Math.min(cityProgress, cityPlots.length);
  if (builtCount === 0) {
    return;
  }

  window.clearTimeout(cityDialogueTimeout);
  const availableLines = cityDialogues.filter((line) => line !== previousCityDialogue);
  const dialogue = availableLines[Math.floor(Math.random() * availableLines.length)];
  previousCityDialogue = dialogue;
  const buildingIndex = Math.floor(Math.random() * builtCount);
  const plot = cityPlots[buildingIndex];
  const isApartment = buildingIndex < Math.floor(cityProgress / 5);
  const roofY = plot.y - (isApartment ? 75 : 57) * plot.scale;
  const x = Math.max(120, Math.min(880, plot.x));
  const lines = wrapCityDialogue(dialogue);
  const bubbleWidth = 224;
  const bubbleHeight = lines.length * 17 + 16;
  const group = document.createElementNS(svgNamespace, "g");
  group.setAttribute("class", "city-speech-bubble is-appearing");
  group.setAttribute("transform", `translate(${x} ${roofY - 5})`);
  group.setAttribute("role", "status");
  group.setAttribute("aria-label", dialogue);
  group.setAttribute("aria-hidden", "false");

  const bubble = document.createElementNS(svgNamespace, "rect");
  bubble.setAttribute("class", "city-speech-shape");
  bubble.setAttribute("x", (-bubbleWidth / 2).toString());
  bubble.setAttribute("y", (-bubbleHeight - 12).toString());
  bubble.setAttribute("width", bubbleWidth.toString());
  bubble.setAttribute("height", bubbleHeight.toString());
  bubble.setAttribute("rx", "11");
  group.append(bubble);

  const tail = document.createElementNS(svgNamespace, "path");
  tail.setAttribute("class", "city-speech-tail");
  tail.setAttribute("d", "M-9-14 0-3 9-14Z");
  group.append(tail);

  lines.forEach((line, index) => {
    const text = document.createElementNS(svgNamespace, "text");
    text.setAttribute("class", "city-speech-text");
    text.setAttribute("x", "0");
    text.setAttribute("y", (-bubbleHeight + 12 + index * 17).toString());
    text.textContent = line;
    group.append(text);
  });

  elements.cityDialogue.replaceChildren(group);
  cityDialogueTimeout = window.setTimeout(() => {
    if (group.isConnected) {
      group.classList.add("is-leaving");
      window.setTimeout(() => group.remove(), 220);
    }
  }, 3600);
}

function plantVillageTree() {
  if (plantedTreeCount < treeSpots.length) {
    plantedTreeCount += 1;
    savePlantedTreeCount();
    renderVillage(true);
    return;
  }

  if (cityProgress < cityMaximumProgress) {
    cityProgress += 1;
    saveCityProgress();
    const newestBuildingIndex = cityProgress % 5 === 0
      ? Math.min(Math.floor(cityProgress / 5) - 1, cityPlots.length - 1)
      : Math.min(cityProgress - 1, cityPlots.length - 1);
    renderCity(newestBuildingIndex);
    if (cityProgress < cityMaximumProgress) {
      cityAnswersToDialogue -= 1;
      if (cityAnswersToDialogue === 0) {
        showCityDialogue();
        cityAnswersToDialogue = randomDialogueInterval();
      }
    }
    return;
  }

  spaceProgress += 1;
  saveSpaceProgress();
  renderSpace(spaceProgress <= spacePlots.length ? spaceProgress - 1 : -1);
}

function selectRoundWords(words) {
  const roundSize = Math.min(5, words.length);
  return shuffle(words).slice(0, roundSize);
}

function updateStats() {
  elements.timer.value = formatTime(elapsedSeconds);
  elements.score.value = score.toString();

  const total = currentWords.length;
  const matched = matchedIds.size;
  const progress = total === 0 ? 0 : Math.round((matched / total) * 100);
  elements.progressText.textContent = `${matched} / ${total} eşleşme`;
  elements.progressTrack.setAttribute("aria-valuemax", total.toString());
  elements.progressTrack.setAttribute("aria-valuenow", matched.toString());
  elements.progressFill.style.width = `${progress}%`;
  elements.englishCount.textContent = `${total - matched}`;
  elements.turkishCount.textContent = `${total - matched}`;

  if (matched === 0) {
    elements.progressEncouragement.textContent = "Haydi başlayalım!";
  } else if (matched === total) {
    elements.progressEncouragement.textContent = "Muhteşem!";
  } else if (matched >= Math.ceil(total * 0.6)) {
    elements.progressEncouragement.textContent = "Harika gidiyorsun!";
  } else {
    elements.progressEncouragement.textContent = "Güzel gidiyorsun!";
  }
}

function setMessage(message, type = "") {
  elements.gameMessage.textContent = message;
  elements.gameMessage.classList.toggle("is-error", type === "error");
  elements.gameMessage.classList.toggle("is-success", type === "success");
}

function announceScoreMilestone() {
  const milestone = Math.min(1000, Math.floor(score / 100) * 100);
  if (milestone <= highestAnnouncedMilestone) {
    return;
  }

  const message = scoreMilestoneMessages.get(milestone);
  if (!message) {
    return;
  }

  highestAnnouncedMilestone = milestone;
  window.clearTimeout(milestoneToastTimeout);
  elements.milestoneToast.textContent = message;
  elements.milestoneToast.hidden = false;
  elements.milestoneToast.classList.remove("is-visible");
  window.requestAnimationFrame(() => elements.milestoneToast.classList.add("is-visible"));
  milestoneToastTimeout = window.setTimeout(() => {
    elements.milestoneToast.classList.remove("is-visible");
    window.setTimeout(() => {
      elements.milestoneToast.hidden = true;
    }, 220);
  }, 3600);
}

function showExample(word) {
  elements.exampleType.textContent = word.type.toLocaleUpperCase("tr-TR");
  elements.exampleEnglish.textContent = word.example;
  elements.exampleTurkish.textContent = word.exampleTr;
  elements.examplePanel.hidden = false;
}

function createWordCard(word, language) {
  const card = document.createElement("button");
  card.className = "word-card";
  card.type = "button";
  card.dataset.wordId = word.id.toString();
  card.dataset.language = language;
  card.textContent = language === "en" ? word.en : word.tr;
  card.setAttribute(
    "aria-label",
    language === "en" ? `İngilizce ${word.type}: ${word.en}` : `Türkçe: ${word.tr}`
  );
  if (language === "en") {
    card.addEventListener("pointerdown", onDragStart);
    card.addEventListener("click", onWordCardClick);
  } else {
    card.addEventListener("click", onWordCardClick);
    card.addEventListener("pointerenter", () => {
      if (dragState) {
        card.classList.add("is-drop-target");
      }
    });
    card.addEventListener("pointerleave", () => card.classList.remove("is-drop-target"));
  }
  return card;
}

function renderCards() {
  const englishFragment = document.createDocumentFragment();
  const turkishFragment = document.createDocumentFragment();

  currentWords.forEach((word) => englishFragment.append(createWordCard(word, "en")));
  shuffle(currentWords).forEach((word) => turkishFragment.append(createWordCard(word, "tr")));

  elements.englishList.replaceChildren(englishFragment);
  elements.turkishList.replaceChildren(turkishFragment);
}

function startTimer() {
  window.clearInterval(timerInterval);
  timerInterval = window.setInterval(() => {
    elapsedSeconds += 1;
    elements.timer.value = formatTime(elapsedSeconds);
  }, 1000);
}

function startGame(words = wordBank) {
  window.clearInterval(timerInterval);
  window.clearTimeout(mismatchTimeout);
  window.clearTimeout(nextRoundTimeout);
  endDrag();
  timerInterval = null;
  mismatchTimeout = null;
  inputLocked = false;
  gameFinished = false;
  selectedEnglish = null;
  selectedTurkish = null;
  matchedIds = new Set();
  elapsedSeconds = 0;
  elements.examplePanel.hidden = true;
  currentWords = selectRoundWords(words);
  elements.gameCard.classList.remove("is-locked");
  renderCards();
  updateStats();

  if (currentWords.length === 0) {
    setMessage("Oynanabilecek kelime bulunamadı. Başka bir liste yükleyebilirsin.", "error");
    return;
  }

  setMessage("İngilizce kartı Türkçe karşılığının üzerine sürükle.");
  startTimer();
}

function onWordCardClick(event) {
  if (suppressNextClick) {
    suppressNextClick = false;
    return;
  }

  if (inputLocked || gameFinished) {
    return;
  }

  const card = event.currentTarget;
  if (!(card instanceof HTMLButtonElement) || card.disabled) {
    return;
  }

  const language = card.dataset.language;
  if (language !== "en" && language !== "tr") {
    return;
  }

  if (language === "en") {
    if (selectedEnglish === card) {
      selectedEnglish = null;
      card.classList.remove("is-selected");
      setMessage("İngilizce kartı Türkçe karşılığının üzerine sürükle.");
      return;
    }

    selectedEnglish?.classList.remove("is-selected");
    selectedEnglish = card;
    card.classList.add("is-selected");
    setMessage("Şimdi doğru Türkçe kartı seç veya İngilizce kartı üzerine sürükle.");
    return;
  }

  if (language === "tr" && selectedEnglish) {
    selectedTurkish = card;
    resolveSelection();
  }
}

function onDragStart(event) {
  const card = event.currentTarget;
  if (
    inputLocked ||
    gameFinished ||
    !(card instanceof HTMLButtonElement) ||
    card.disabled ||
    event.button !== 0
  ) {
    return;
  }

  event.preventDefault();
  card.setPointerCapture(event.pointerId);
  dragState = {
    card,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    offsetX: event.clientX - card.getBoundingClientRect().left,
    offsetY: event.clientY - card.getBoundingClientRect().top,
    ghost: null,
    lastStarX: event.clientX,
    lastStarY: event.clientY
  };
  card.addEventListener("pointermove", onDragMove);
  card.addEventListener("pointerup", onDragEnd, { once: true });
  card.addEventListener("pointercancel", onDragCancel, { once: true });
}

function createDragGhost(state) {
  const rect = state.card.getBoundingClientRect();
  const ghost = state.card.cloneNode(true);
  ghost.classList.remove("is-selected");
  ghost.classList.add("drag-ghost");
  ghost.style.width = `${rect.width}px`;
  ghost.style.height = `${rect.height}px`;
  document.body.append(ghost);
  state.card.classList.add("is-dragging");
  state.ghost = ghost;
}

function showStar(x, y) {
  const star = document.createElement("span");
  star.className = "drag-star";
  star.setAttribute("aria-hidden", "true");
  star.textContent = ["✦", "★", "✧"][Math.floor(Math.random() * 3)];
  star.style.left = `${x + (Math.random() - 0.5) * 24}px`;
  star.style.top = `${y + (Math.random() - 0.5) * 24}px`;
  document.body.append(star);
  window.setTimeout(() => star.remove(), 680);
}

function onDragMove(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) {
    return;
  }

  const deltaX = event.clientX - dragState.startX;
  const deltaY = event.clientY - dragState.startY;
  if (!dragState.ghost && Math.hypot(deltaX, deltaY) >= 5) {
    createDragGhost(dragState);
  }

  if (!dragState.ghost) {
    return;
  }

  event.preventDefault();
  dragState.ghost.style.left = `${event.clientX - dragState.offsetX}px`;
  dragState.ghost.style.top = `${event.clientY - dragState.offsetY}px`;

  if (Math.hypot(event.clientX - dragState.lastStarX, event.clientY - dragState.lastStarY) >= 15) {
    showStar(event.clientX, event.clientY);
    dragState.lastStarX = event.clientX;
    dragState.lastStarY = event.clientY;
  }

  document.querySelectorAll(".word-card.is-drop-target").forEach((target) => {
    target.classList.remove("is-drop-target");
  });
  document.elementFromPoint(event.clientX, event.clientY)
    ?.closest('.word-card[data-language="tr"]:not(:disabled)')
    ?.classList.add("is-drop-target");
}

function onDragEnd(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) {
    return;
  }

  if (dragState.ghost) {
    const target = document.elementFromPoint(event.clientX, event.clientY)
      ?.closest('.word-card[data-language="tr"]:not(:disabled)');
    suppressNextClick = true;
    window.setTimeout(() => {
      suppressNextClick = false;
    }, 0);
    if (target instanceof HTMLButtonElement && !target.disabled) {
      selectedEnglish = dragState.card;
      selectedTurkish = target;
      resolveSelection();
    } else {
      setMessage("Kartı Türkçe kelimelerden birinin üzerine bırak.", "error");
    }
  }

  endDrag();
}

function onDragCancel() {
  endDrag();
}

function endDrag() {
  if (!dragState) {
    return;
  }

  dragState.card.classList.remove("is-dragging");
  dragState.card.removeEventListener("pointermove", onDragMove);
  dragState.card.removeEventListener("pointerup", onDragEnd);
  dragState.card.removeEventListener("pointercancel", onDragCancel);
  dragState.ghost?.remove();
  document.querySelectorAll(".word-card.is-drop-target").forEach((target) => {
    target.classList.remove("is-drop-target");
  });
  dragState = null;
}

function resolveSelection() {
  if (!selectedEnglish || !selectedTurkish) {
    return;
  }

  const englishCard = selectedEnglish;
  const turkishCard = selectedTurkish;
  const isMatch = englishCard.dataset.wordId === turkishCard.dataset.wordId;

  if (isMatch) {
    const matchedId = Number(englishCard.dataset.wordId);
    matchedIds.add(matchedId);
    score += 10;
    announceScoreMilestone();
    plantVillageTree();
    const matchedWord = currentWords.find((word) => word.id === matchedId);
    if (matchedWord) {
      showExample(matchedWord);
    }
    englishCard.classList.remove("is-selected");
    turkishCard.classList.remove("is-selected", "is-drop-target");
    englishCard.classList.add("is-matched");
    turkishCard.classList.add("is-matched");
    englishCard.disabled = true;
    turkishCard.disabled = true;
    selectedEnglish = null;
    selectedTurkish = null;
    updateStats();

    if (matchedIds.size === currentWords.length) {
      finishGame();
    } else {
      setMessage("Doğru eşleşme! +10 puan, böyle devam et.", "success");
    }
    return;
  }

  inputLocked = true;
  elements.gameCard.classList.add("is-locked");
  englishCard.classList.add("is-wrong");
  turkishCard.classList.add("is-wrong");
  score -= 20;
  updateStats();
  setMessage("Yanlış eşleşme! -20 puan. Tekrar dene.", "error");
  mismatchTimeout = window.setTimeout(() => {
    englishCard.classList.remove("is-selected", "is-wrong");
    turkishCard.classList.remove("is-selected", "is-wrong", "is-drop-target");
    selectedEnglish = null;
    selectedTurkish = null;
    inputLocked = false;
    elements.gameCard.classList.remove("is-locked");
    setMessage("İngilizce kartı Türkçe karşılığının üzerine sürükle.");
  }, 500);
}

function finishGame() {
  gameFinished = true;
  window.clearInterval(timerInterval);
  timerInterval = null;
  setMessage("Tur tamamlandı! Yeni kelimeler geliyor...", "success");
  nextRoundTimeout = window.setTimeout(() => {
    startGame();
  }, 700);
}

elements.restartButton.addEventListener("click", () => {
  if (wordBank.length === 0) {
    initializeGame();
    return;
  }

  startGame();
});

async function initializeGame() {
  elements.restartButton.disabled = true;
  setMessage("Kelime listesi yükleniyor...");

  try {
    wordBank = await loadWordBank();
    elements.restartButton.disabled = false;
    startGame();
  } catch (error) {
    console.error("Kelime listesi yüklenemedi.", error);
    elements.restartButton.disabled = false;
    setMessage(`${error.message} Oyunu start-game.bat dosyasını çalıştırarak aç.`, "error");
  }
}

migrateVillageProgress();
renderCity();
renderSpace();
renderVillage();
initializeGame();

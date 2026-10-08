"use strict";

const sentenceFileUrl = new URL("./kelimeler.txt", document.baseURI);
const sentenceMilestones = [
  "100 puan! Cümleleri harika çözüyorsun!",
  "200 puan! İngilizcen her turda güçleniyor.",
  "300 puan! Çok iyi gidiyorsun, devam et!",
  "400 puan! Bu başarı tamamen emeğinin sonucu.",
  "500 puan! Yarı yolu geçtin, harikasın!",
  "600 puan! İstikrarın gerçekten etkileyici.",
  "700 puan! Her cümlede biraz daha ustalaşıyorsun.",
  "800 puan! Hedefe çok yaklaştın!",
  "900 puan! Bin puana sadece bir tur kaldı!",
  "1000 puan! Muhteşem başarı, tebrikler!"
];

const sentenceElements = {
  englishList: document.querySelector("#english-sentences"),
  turkishList: document.querySelector("#turkish-sentences"),
  timer: document.querySelector("#sentence-timer"),
  score: document.querySelector("#sentence-score"),
  progressText: document.querySelector("#sentence-progress-text"),
  progressTrack: document.querySelector(".sentence-progress-track"),
  progressFill: document.querySelector("#sentence-progress-fill"),
  encouragement: document.querySelector("#sentence-progress-encouragement"),
  englishCount: document.querySelector("#english-sentence-count"),
  turkishCount: document.querySelector("#turkish-sentence-count"),
  message: document.querySelector("#sentence-message"),
  restart: document.querySelector("#sentence-restart"),
  milestoneToast: document.querySelector("#sentence-milestone-toast")
};

let sentenceBank = [];
let currentSentences = [];
let matchedSentenceIds = new Set();
let selectedEnglishCard = null;
let selectedTurkishCard = null;
let score = 0;
let highestMilestoneShown = 0;
let elapsedSeconds = 0;
let timerInterval = null;
let mismatchTimeout = null;
let nextRoundTimeout = null;
let milestoneTimeout = null;
let inputLocked = false;

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function parseSentenceFile(contents) {
  const records = [];
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
      const [word, example, exampleTr] = [
        JSON.parse(match[2]),
        JSON.parse(match[5]),
        JSON.parse(match[6])
      ];
      if (
        !Number.isSafeInteger(id) ||
        seenIds.has(id) ||
        !word.trim() ||
        !example.trim() ||
        !exampleTr.trim()
      ) {
        invalidLines.push(index + 1);
        return;
      }

      seenIds.add(id);
      records.push({ id, word, example, exampleTr });
    } catch (error) {
      invalidLines.push(index + 1);
      console.error(`kelimeler.txt dosyasının ${index + 1}. satırı okunamadı.`, error);
    }
  });

  if (invalidLines.length > 0) {
    console.warn(`kelimeler.txt dosyasında geçersiz satırlar atlandı: ${invalidLines.join(", ")}`);
  }
  return records;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function showMilestone() {
  const milestone = Math.min(1000, Math.floor(score / 100) * 100);
  if (milestone <= highestMilestoneShown) {
    return;
  }

  highestMilestoneShown = milestone;
  const message = sentenceMilestones[milestone / 100 - 1];
  window.clearTimeout(milestoneTimeout);
  sentenceElements.milestoneToast.textContent = message;
  sentenceElements.milestoneToast.hidden = false;
  sentenceElements.milestoneToast.classList.remove("is-visible");
  window.requestAnimationFrame(() => sentenceElements.milestoneToast.classList.add("is-visible"));
  milestoneTimeout = window.setTimeout(() => {
    sentenceElements.milestoneToast.classList.remove("is-visible");
    window.setTimeout(() => {
      sentenceElements.milestoneToast.hidden = true;
    }, 220);
  }, 3600);
}

function updateStats() {
  const matched = matchedSentenceIds.size;
  const total = currentSentences.length;
  const percent = total === 0 ? 0 : Math.round((matched / total) * 100);

  sentenceElements.score.value = score.toString();
  sentenceElements.timer.value = formatTime(elapsedSeconds);
  sentenceElements.progressText.textContent = `${matched} / ${total} eşleşme`;
  sentenceElements.progressTrack.setAttribute("aria-valuemax", total.toString());
  sentenceElements.progressTrack.setAttribute("aria-valuenow", matched.toString());
  sentenceElements.progressFill.style.width = `${percent}%`;
  sentenceElements.englishCount.textContent = (total - matched).toString();
  sentenceElements.turkishCount.textContent = (total - matched).toString();
  sentenceElements.encouragement.textContent = matched === total
    ? "Muhteşem!"
    : matched >= 3
      ? "Harika gidiyorsun!"
      : matched > 0
        ? "Güzel gidiyorsun!"
        : "Haydi başlayalım!";
}

function setMessage(text, type = "") {
  sentenceElements.message.textContent = text;
  sentenceElements.message.classList.toggle("is-error", type === "error");
  sentenceElements.message.classList.toggle("is-success", type === "success");
}

function createSentenceCard(sentence, language) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "sentence-card";
  card.dataset.sentenceId = sentence.id.toString();
  card.dataset.language = language;

  const number = document.createElement("span");
  number.className = "sentence-card-number";
  number.setAttribute("aria-hidden", "true");
  number.textContent = (currentSentences.indexOf(sentence) + 1).toString().padStart(2, "0");

  const content = document.createElement("span");
  content.className = "sentence-card-content";
  const label = document.createElement("span");
  label.className = "sentence-card-label";
  label.textContent = language === "en" ? "İNGİLİZCE CÜMLE" : "TÜRKÇE ÇEVİRİ";
  const text = document.createElement("span");
  text.className = "sentence-card-text";
  text.textContent = language === "en" ? sentence.example : sentence.exampleTr;
  content.append(label, text);
  card.append(number, content);
  card.setAttribute(
    "aria-label",
    language === "en" ? `İngilizce cümle: ${sentence.example}` : `Türkçe çeviri: ${sentence.exampleTr}`
  );
  card.addEventListener("click", onSentenceCardClick);
  return card;
}

function renderSentenceCards() {
  const englishCards = document.createDocumentFragment();
  const turkishCards = document.createDocumentFragment();
  currentSentences.forEach((sentence) => {
    englishCards.append(createSentenceCard(sentence, "en"));
  });
  shuffle(currentSentences).forEach((sentence) => {
    turkishCards.append(createSentenceCard(sentence, "tr"));
  });
  sentenceElements.englishList.replaceChildren(englishCards);
  sentenceElements.turkishList.replaceChildren(turkishCards);
}

function clearSelection() {
  selectedEnglishCard?.classList.remove("is-selected");
  selectedTurkishCard?.classList.remove("is-selected");
  selectedEnglishCard = null;
  selectedTurkishCard = null;
}

function resolveSentenceSelection() {
  if (!selectedEnglishCard || !selectedTurkishCard || inputLocked) {
    return;
  }

  const englishCard = selectedEnglishCard;
  const turkishCard = selectedTurkishCard;
  if (englishCard.dataset.sentenceId === turkishCard.dataset.sentenceId) {
    matchedSentenceIds.add(Number(englishCard.dataset.sentenceId));
    englishCard.classList.remove("is-selected");
    turkishCard.classList.remove("is-selected");
    englishCard.classList.add("is-matched");
    turkishCard.classList.add("is-matched");
    englishCard.disabled = true;
    turkishCard.disabled = true;
    selectedEnglishCard = null;
    selectedTurkishCard = null;
    score += 10;
    showMilestone();
    updateStats();
    setMessage("Doğru eşleşme! +10 puan.", "success");

    if (matchedSentenceIds.size === currentSentences.length) {
      window.clearInterval(timerInterval);
      timerInterval = null;
      setMessage("Tur tamamlandı! Yeni cümleler geliyor...", "success");
      nextRoundTimeout = window.setTimeout(() => startRound(), 700);
    }
    return;
  }

  inputLocked = true;
  sentenceElements.englishList.closest(".sentence-game-card").classList.add("is-locked");
  englishCard.classList.add("is-wrong");
  turkishCard.classList.add("is-wrong");
  score -= 20;
  updateStats();
  setMessage("Yanlış eşleşme! -20 puan. Tekrar dene.", "error");
  mismatchTimeout = window.setTimeout(() => {
    englishCard.classList.remove("is-selected", "is-wrong");
    turkishCard.classList.remove("is-selected", "is-wrong");
    selectedEnglishCard = null;
    selectedTurkishCard = null;
    inputLocked = false;
    sentenceElements.englishList.closest(".sentence-game-card").classList.remove("is-locked");
    setMessage("Cümle listesinden bir İngilizce kart ve Türkçe çevirisini seç.");
  }, 500);
}

function onSentenceCardClick(event) {
  if (inputLocked) {
    return;
  }
  const card = event.currentTarget;
  const isEnglish = card.dataset.language === "en";
  const selectedCard = isEnglish ? selectedEnglishCard : selectedTurkishCard;
  if (selectedCard === card) {
    card.classList.remove("is-selected");
    if (isEnglish) {
      selectedEnglishCard = null;
    } else {
      selectedTurkishCard = null;
    }
    return;
  }

  selectedCard?.classList.remove("is-selected");
  card.classList.add("is-selected");
  if (isEnglish) {
    selectedEnglishCard = card;
  } else {
    selectedTurkishCard = card;
  }
  resolveSentenceSelection();
}

function startRound() {
  window.clearInterval(timerInterval);
  window.clearTimeout(mismatchTimeout);
  window.clearTimeout(nextRoundTimeout);
  mismatchTimeout = null;
  nextRoundTimeout = null;
  inputLocked = false;
  clearSelection();
  matchedSentenceIds = new Set();
  elapsedSeconds = 0;
  currentSentences = shuffle(sentenceBank).slice(0, Math.min(5, sentenceBank.length));
  sentenceElements.englishList.closest(".sentence-game-card").classList.remove("is-locked");
  renderSentenceCards();
  updateStats();

  if (currentSentences.length === 0) {
    setMessage("Cümle dosyasında oynanabilecek kayıt bulunamadı.", "error");
    return;
  }

  setMessage("Cümle listesinden bir İngilizce kart ve Türkçe çevirisini seç.");
  timerInterval = window.setInterval(() => {
    elapsedSeconds += 1;
    sentenceElements.timer.value = formatTime(elapsedSeconds);
  }, 1000);
}

async function loadSentences() {
  try {
    const response = await fetch(sentenceFileUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`kelimeler.txt dosyası okunamadı (HTTP ${response.status}).`);
    }

    sentenceBank = parseSentenceFile(await response.text());
    if (sentenceBank.length === 0) {
      throw new Error("kelimeler.txt içinde cümlesi ve Türkçe çevirisi bulunan kayıt yok.");
    }
    sentenceElements.restart.disabled = false;
    startRound();
  } catch (error) {
    console.error("Cümle eşleştirme oyunu başlatılamadı.", error);
    sentenceElements.restart.disabled = true;
    setMessage(`Cümleler yüklenemedi: ${error.message}`, "error");
  }
}

sentenceElements.restart.addEventListener("click", () => startRound());
sentenceElements.restart.disabled = true;
loadSentences();

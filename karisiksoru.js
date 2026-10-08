"use strict";

const quizFileUrl = new URL("./english_tenses_quiz_game.txt", document.baseURI);
const quizMilestoneMessages = [
  "100 puan! Harika bir başlangıç!",
  "200 puan! Dil bilgisi gücün artıyor.",
  "300 puan! Soruları çok iyi çözüyorsun!",
  "400 puan! Böyle devam, doğru yoldasın.",
  "500 puan! Yarı yolu geçtin, süpersin!",
  "600 puan! Bilgin her soruda parlıyor.",
  "700 puan! İstikrarın takdire değer!",
  "800 puan! Büyük hedefe çok yaklaştın!",
  "900 puan! Bin puan kapıda!",
  "1000 puan! Müthiş başarı, tebrikler!"
];

const quizElements = {
  timer: document.querySelector("#quiz-timer"),
  score: document.querySelector("#quiz-score"),
  questionCount: document.querySelector("#quiz-question-count"),
  topic: document.querySelector("#quiz-topic"),
  question: document.querySelector("#quiz-question"),
  options: document.querySelector("#quiz-options"),
  feedback: document.querySelector("#quiz-feedback"),
  feedbackTitle: document.querySelector("#quiz-feedback-title"),
  explanation: document.querySelector("#quiz-explanation"),
  status: document.querySelector("#quiz-status"),
  nextButton: document.querySelector("#quiz-next"),
  milestoneToast: document.querySelector("#quiz-milestone-toast")
};

let questionBank = [];
let questionOrder = [];
let previousQuestionIndex = -1;
let currentQuestion = null;
let score = 0;
let highestMilestoneShown = 0;
let answeredQuestions = 0;
let elapsedSeconds = 0;
let timerInterval = null;
let milestoneTimeout = null;
let hasAnswered = false;

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function removeComments(source) {
  let result = "";
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const nextCharacter = source[index + 1];

    if (lineComment) {
      if (character === "\n") {
        lineComment = false;
        result += character;
      }
      continue;
    }
    if (blockComment) {
      if (character === "*" && nextCharacter === "/") {
        blockComment = false;
        index += 1;
      } else if (character === "\n") {
        result += character;
      }
      continue;
    }
    if (quote) {
      result += character;
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = "";
      }
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      result += character;
    } else if (character === "/" && nextCharacter === "/") {
      lineComment = true;
      index += 1;
    } else if (character === "/" && nextCharacter === "*") {
      blockComment = true;
      index += 1;
    } else {
      result += character;
    }
  }

  return result;
}

function quoteUnquotedKeys(source) {
  let result = "";
  let quote = "";
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      result += character;
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = "";
      }
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      result += character;
      continue;
    }

    if (/[A-Za-z_$]/.test(character)) {
      let end = index + 1;
      while (end < source.length && /[\w$]/.test(source[end])) {
        end += 1;
      }
      let previous = index - 1;
      while (previous >= 0 && /\s/.test(source[previous])) {
        previous -= 1;
      }
      let next = end;
      while (next < source.length && /\s/.test(source[next])) {
        next += 1;
      }
      const isPropertyKey = (source[previous] === "{" || source[previous] === ",") &&
        source[next] === ":";
      const identifier = source.slice(index, end);
      result += isPropertyKey ? `"${identifier}"` : identifier;
      index = end - 1;
      continue;
    }

    result += character;
  }
  return result;
}

function parseQuestionFile(contents) {
  const jsonCompatible = quoteUnquotedKeys(removeComments(contents))
    .replace(/,\s*([}\]])/g, "$1");
  const parsed = JSON.parse(jsonCompatible);
  if (!Array.isArray(parsed)) {
    throw new Error("Soru dosyasının en dış yapısı bir dizi olmalı.");
  }

  const questions = [];
  const invalidQuestions = [];
  const correctedQuestions = [];
  parsed.forEach((question, index) => {
    const structurallyValid = question !== null &&
      typeof question === "object" &&
      typeof question.tense === "string" &&
      question.tense.trim() !== "" &&
      typeof question.sentence === "string" &&
      question.sentence.trim() !== "" &&
      Array.isArray(question.options) &&
      question.options.length >= 2 &&
      question.options.every((option) => typeof option === "string" && option.trim() !== "") &&
      typeof question.correct === "string" &&
      typeof question.explanation === "string" &&
      question.explanation.trim() !== "";

    if (structurallyValid) {
      const options = [...new Set(question.options.map((option) => option.trim()))];
      const correct = question.correct.trim();
      if (!options.includes(correct)) {
        options.push(correct);
        correctedQuestions.push(index + 1);
      }
      questions.push({
        tense: question.tense.trim(),
        sentence: question.sentence.trim(),
        options,
        correct,
        explanation: question.explanation.trim()
      });
    } else {
      invalidQuestions.push(index + 1);
    }
  });

  if (invalidQuestions.length > 0) {
    console.warn(`Soru dosyasında geçersiz kayıtlar atlandı: ${invalidQuestions.join(", ")}`);
  }
  if (correctedQuestions.length > 0) {
    console.warn(`Doğru cevabı seçeneklerde bulunmayan sorulara cevap seçeneği eklendi: ${correctedQuestions.join(", ")}`);
  }
  if (questions.length === 0) {
    throw new Error("Soru dosyasında kullanılabilir soru bulunamadı.");
  }
  return questions;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function announceMilestone() {
  const milestone = Math.min(1000, Math.floor(score / 100) * 100);
  if (milestone <= highestMilestoneShown) {
    return;
  }

  highestMilestoneShown = milestone;
  quizElements.milestoneToast.textContent = quizMilestoneMessages[milestone / 100 - 1];
  window.clearTimeout(milestoneTimeout);
  quizElements.milestoneToast.hidden = false;
  quizElements.milestoneToast.classList.remove("is-visible");
  window.requestAnimationFrame(() => quizElements.milestoneToast.classList.add("is-visible"));
  milestoneTimeout = window.setTimeout(() => {
    quizElements.milestoneToast.classList.remove("is-visible");
    window.setTimeout(() => {
      quizElements.milestoneToast.hidden = true;
    }, 220);
  }, 3600);
}

function pickQuestionIndex() {
  if (questionOrder.length === 0) {
    questionOrder = shuffle(questionBank.map((_, index) => index));
    if (questionOrder.length > 1 && questionOrder[0] === previousQuestionIndex) {
      [questionOrder[0], questionOrder[1]] = [questionOrder[1], questionOrder[0]];
    }
  }
  return questionOrder.pop();
}

function renderQuestion() {
  const questionIndex = pickQuestionIndex();
  previousQuestionIndex = questionIndex;
  currentQuestion = questionBank[questionIndex];
  hasAnswered = false;

  quizElements.questionCount.textContent = `SORU ${answeredQuestions + 1}`;
  quizElements.topic.textContent = currentQuestion.tense.toLocaleUpperCase("tr-TR");
  quizElements.question.textContent = currentQuestion.sentence;
  quizElements.options.replaceChildren();
  quizElements.feedback.hidden = true;
  quizElements.nextButton.disabled = true;
  quizElements.nextButton.classList.remove("is-ready");
  quizElements.status.textContent = "En uygun cevabı seç.";

  shuffle(currentQuestion.options).forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiz-option";
    button.dataset.answer = option;

    const letter = document.createElement("span");
    letter.className = "quiz-option-letter";
    letter.setAttribute("aria-hidden", "true");
    letter.textContent = String.fromCharCode(65 + index);

    const text = document.createElement("span");
    text.className = "quiz-option-text";
    text.textContent = option;
    button.append(letter, text);
    button.addEventListener("click", () => submitAnswer(button, option));
    quizElements.options.append(button);
  });
}

function submitAnswer(selectedButton, answer) {
  if (hasAnswered) {
    return;
  }
  hasAnswered = true;
  answeredQuestions += 1;
  const isCorrect = answer === currentQuestion.correct;

  quizElements.options.querySelectorAll(".quiz-option").forEach((button) => {
    button.disabled = true;
    if (button.dataset.answer === currentQuestion.correct) {
      button.classList.add("is-correct");
    }
  });

  if (isCorrect) {
    score += 10;
    quizElements.status.textContent = "Doğru cevap! +10 puan.";
    quizElements.status.classList.add("is-correct");
    quizElements.feedbackTitle.textContent = "Harika, doğru cevap! +10";
    quizElements.feedbackTitle.className = "quiz-feedback-title is-correct";
    selectedButton.classList.add("is-selected-answer");
    announceMilestone();
  } else {
    score -= 20;
    quizElements.status.textContent = "Bu kez olmadı. Doğru cevap yeşil renkle gösterildi.";
    quizElements.status.classList.remove("is-correct");
    quizElements.feedbackTitle.textContent = "Yanlış cevap. 20 puan düştü.";
    quizElements.feedbackTitle.className = "quiz-feedback-title is-incorrect";
    selectedButton.classList.add("is-incorrect");
  }

  quizElements.score.value = score.toString();
  quizElements.explanation.textContent = currentQuestion.explanation;
  quizElements.feedback.hidden = false;
  quizElements.nextButton.disabled = false;
  quizElements.nextButton.classList.add("is-ready");
}

async function loadQuestionBank() {
  try {
    const response = await fetch(quizFileUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Soru dosyası okunamadı (HTTP ${response.status}).`);
    }
    questionBank = parseQuestionFile(await response.text());
    quizElements.status.textContent = `${questionBank.length} soruluk havuzdan rastgele seçildi.`;
    renderQuestion();
    timerInterval = window.setInterval(() => {
      elapsedSeconds += 1;
      quizElements.timer.value = formatTime(elapsedSeconds);
    }, 1000);
  } catch (error) {
    console.error("Karışık soru oyunu başlatılamadı.", error);
    quizElements.question.textContent = "Sorular yüklenemedi.";
    quizElements.status.textContent = error.message;
    quizElements.options.replaceChildren();
  }
}

quizElements.nextButton.addEventListener("click", () => {
  if (hasAnswered) {
    quizElements.status.classList.remove("is-correct");
    renderQuestion();
  }
});

loadQuestionBank();

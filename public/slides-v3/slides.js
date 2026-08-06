const scenes = [
  { time: "0:00 to 0:12", copy: "Start with the real idea. On letsgochristo.com, I want to replace the space traveler with video avatars that welcome visitors, introduce Christo as a new kind of builder, and invite people to explore. I need a repository or service that can make that experience real." },
  { time: "0:12 to 0:24", copy: "I enter the actual site, letsgochristo.com, and the outcome, an AI video avatar, then press Find repos. RepoFinder now has enough context to look beyond popularity and ask which options fit this specific website." },
  { time: "0:24 to 0:38", copy: "RepoFinder combines live GitHub signals with OpenAI reasoning. The first result, Duix-Avatar, has 14.3 thousand stars and offers full control, but the low ease score exposes the tradeoff: it needs GPU infrastructure." },
  { time: "0:38 to 0:52", copy: "I do not restart the search. I type a follow-up in the result chat: I like this idea, but ease of use matters more. Suggest easier options, even if I have to pay. That human preference is something a star count cannot know." },
  { time: "0:52 to 1:07", copy: "RepoFinder updates the recommendation around my taste. It points to HeyGen, Synthesia, and Captions, explains what each is good at, and brings the choice back to letsgochristo.com. For a fast, personable welcome, it says to try HeyGen first." },
  { time: "1:07 to 1:20", copy: "RepoFinder has not built or tested the avatar. Its value is narrowing the decision: for letsgochristo.com, start with HeyGen and prototype one welcome avatar on the home page before committing to a more complex real-time system." },
  { time: "1:20 to 1:33", copy: "The same request, letsgochristo.com plus video avatar, works in two places. A human uses the browser to inspect the evidence and refine by conversation. An agent calls the MCP tool, receives structured recommendations, and keeps moving in its own workflow." },
  { time: "1:33 to 1:45", copy: "RepoFinder turns a loose idea into a high-impact, lower-risk path to ROI: less tab hopping, fewer wrong-fit integrations, and a faster path to success. You leave with a recommendation shaped by your project, your task, and your taste." },
];

const slides = [...document.querySelectorAll(".slide")];
const currentLabel = document.querySelector("#current-slide");
const progressBar = document.querySelector("#progress-bar");
const scriptPanel = document.querySelector("#script-panel");
const scriptToggle = document.querySelector("#script-toggle");
const scriptClose = document.querySelector("#script-close");
const scriptTime = document.querySelector("#script-time");
const scriptCopy = document.querySelector("#script-copy");
const slideStage = document.querySelector(".slides");
let current = 0;

function render() {
  slides.forEach((slide, index) => {
    const active = index === current;
    slide.classList.toggle("active", active);
    slide.setAttribute("aria-hidden", String(!active));
  });
  currentLabel.textContent = String(current + 1).padStart(2, "0");
  progressBar.style.width = `${((current + 1) / slides.length) * 100}%`;
  scriptTime.textContent = scenes[current].time;
  scriptCopy.textContent = scenes[current].copy;
  document.title = `${String(current + 1).padStart(2, "0")} · RepoFinder demo V3`;
  history.replaceState(null, "", `#${current + 1}`);
}

function show(index) {
  current = (index + slides.length) % slides.length;
  render();
}

window.showSlide = (number) => show(Number(number) - 1);

function setScript(open) {
  scriptPanel.classList.toggle("open", open);
  scriptPanel.setAttribute("aria-hidden", String(!open));
  scriptToggle.setAttribute("aria-expanded", String(open));
}

document.querySelector("#previous").addEventListener("click", () => show(current - 1));
document.querySelector("#next").addEventListener("click", () => show(current + 1));
scriptToggle.addEventListener("click", () => setScript(!scriptPanel.classList.contains("open")));
scriptClose.addEventListener("click", () => setScript(false));
slideStage.addEventListener("click", (event) => {
  if (window.getSelection()?.toString()) return;
  if (!(event.target instanceof Element)) return;
  if (event.target.closest("a, button, input, textarea, select, summary, [role='button'], [contenteditable='true']")) return;
  show(current + 1);
});

document.addEventListener("keydown", (event) => {
  if (["ArrowRight", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    show(current + 1);
  }
  if (["ArrowLeft", "PageUp"].includes(event.key)) {
    event.preventDefault();
    show(current - 1);
  }
  if (event.key === "Home") show(0);
  if (event.key === "End") show(slides.length - 1);
  if (event.key === "Escape") setScript(false);
  const number = Number(event.key);
  if (number >= 1 && number <= 8) show(number - 1);
});

const hashSlide = Number(location.hash.replace("#", ""));
if (Number.isInteger(hashSlide) && hashSlide >= 1 && hashSlide <= slides.length) current = hashSlide - 1;
window.addEventListener("hashchange", () => {
  const number = Number(location.hash.replace("#", ""));
  if (Number.isInteger(number) && number >= 1 && number <= slides.length && number - 1 !== current) show(number - 1);
});
render();

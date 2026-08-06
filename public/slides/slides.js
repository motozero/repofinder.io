const scenes = [
  { time: "0:00 to 0:11", copy: "This is my portfolio. I want the space traveler to become a set of video avatars that welcome visitors, introduce Christo as a new kind of builder, and invite them to explore. I ask RepoFinder what can power that experience." },
  { time: "0:11 to 0:23", copy: "I give RepoFinder the live site and the outcome I want. That context matters. I am not searching for the most famous avatar project. I am asking what fits this website." },
  { time: "0:23 to 0:37", copy: "RepoFinder searches live GitHub data and uses OpenAI to rank the options. Duix-Avatar rises to the top with fourteen thousand stars and full control, but its low ease score reveals the catch: I would need GPU infrastructure." },
  { time: "0:37 to 0:50", copy: "That is where the demo becomes a decision tool. I open the result and add the constraint the rankings could not know: I care more about ease, and I am willing to pay." },
  { time: "0:50 to 1:06", copy: "The answer changes. RepoFinder recommends hosted choices, explains when HeyGen, Synthesia, and Captions fit, and brings the advice back to my actual site. It even asks the next useful question: polished videos, or a real-time avatar?" },
  { time: "1:06 to 1:18", copy: "Now I have a focused experiment. Start with HeyGen on one portfolio page, test whether visitors watch or engage, and only then decide whether real-time interaction is worth the added complexity." },
  { time: "1:18 to 1:30", copy: "A person can explore this in the browser and refine the answer through conversation. An agent can call the same recommendation engine through M C P and use structured results inside its own workflow." },
  { time: "1:30 to 1:40", copy: "That is the value of RepoFinder: less tab hopping, fewer wrong-fit integrations, and a faster path from an idea to a test you can actually run." },
];

const slides = [...document.querySelectorAll(".slide")];
const currentLabel = document.querySelector("#current-slide");
const progressBar = document.querySelector("#progress-bar");
const scriptPanel = document.querySelector("#script-panel");
const scriptToggle = document.querySelector("#script-toggle");
const scriptClose = document.querySelector("#script-close");
const scriptTime = document.querySelector("#script-time");
const scriptCopy = document.querySelector("#script-copy");
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

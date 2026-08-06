const scenes = [
  { time: "0:00 to 0:09", copy: "This is the moment RepoFinder becomes more useful than a list of popular repositories. I asked for something lighter, and it changed the recommendation." },
  { time: "0:09 to 0:17", copy: "GitHub stars tell me what is popular. They do not tell me what fits my project, my goal, or the way I want to work." },
  { time: "0:17 to 0:29", copy: "I start with a real project, the OpenAI Node SDK, and a concrete goal, production evaluations. One action sends both pieces of context to RepoFinder." },
  { time: "0:29 to 0:40", copy: "It searches live GitHub data, then OpenAI ranks the candidates for this task. The result is an evidence-backed starting point, not a generic popularity contest." },
  { time: "0:40 to 0:50", copy: "Each result explains what the repository does, why it fits, how I could use it, and the likely ease and impact. Current GitHub signals stay visible beside the reasoning." },
  { time: "0:50 to 1:00", copy: "The shortlist gets me oriented. The conversation helps me decide. I can open any result and ask how to test it in one afternoon." },
  { time: "1:00 to 1:11", copy: "RepoFinder turns the recommendation into a practical experiment, including what to try first, what to measure, and where the tradeoffs are." },
  { time: "1:11 to 1:22", copy: "Then I add the part a star count cannot know. I like the idea, but I want a lightweight TypeScript library that fits directly into openai-node." },
  { time: "1:22 to 1:35", copy: "It acknowledges that the original result is too heavy, offers lighter alternatives, and gives me a focused next step. My taste and constraints changed the answer." },
  { time: "1:35 to 1:47", copy: "A person can explore and refine recommendations in the browser. An agent can call the same recommendation capability through MCP and receive structured results it can use in its own workflow." },
  { time: "1:47 to 1:55", copy: "RepoFinder helps humans and agents move forward with evidence, context, and individual taste. Build better, focused, and faster." },
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
  document.title = `${String(current + 1).padStart(2, "0")} · RepoFinder product demo`;
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
  if (number >= 1 && number <= 9) show(number - 1);
});

const hashSlide = Number(location.hash.replace("#", ""));
if (Number.isInteger(hashSlide) && hashSlide >= 1 && hashSlide <= slides.length) current = hashSlide - 1;
window.addEventListener("hashchange", () => {
  const number = Number(location.hash.replace("#", ""));
  if (Number.isInteger(number) && number >= 1 && number <= slides.length && number - 1 !== current) show(number - 1);
});
render();

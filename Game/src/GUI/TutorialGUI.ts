import { Div, GUIRenderer } from "praccen-web-engine";

interface TutorialStep {
  text: string;
  video: string;
}

export default class TutorialGUI {
  private root: Div;
  private container: HTMLDivElement;

  private textEl: HTMLDivElement;
  private videoEl: HTMLVideoElement;
  private nextBtn: HTMLButtonElement;

  private steps: TutorialStep[];
  private currentStep = 0;
  private active = false;

  constructor(gui: GUIRenderer) {
    this.root = gui.getNewDiv();
    this.root.ignoreEngineModifiers = true;
    this.root.setHidden(true);

    const rootEl = this.root.getElement();
    rootEl.style.position = "absolute";
    rootEl.style.top = "0";
    rootEl.style.left = "0";
    rootEl.style.width = "100%";
    rootEl.style.height = "100%";
    rootEl.style.pointerEvents = "none"; // allow game interaction through
    rootEl.style.zIndex = "100";

    // --- MAIN CONTAINER ---
    this.container = document.createElement("div");
    this.container.style.position = "absolute";
    this.container.style.top = "0";
    this.container.style.left = "0";
    this.container.style.width = "100%";
    this.container.style.height = "100%";
    this.container.style.padding = "40px";
    rootEl.appendChild(this.container);

    // --- TEXT ---
    this.textEl = document.createElement("div");

    this.textEl.style.position = "absolute";
    this.textEl.style.left = "40px";
    this.textEl.style.top = "50%";
    this.textEl.style.transform = "translateY(-50%)";

    this.textEl.style.width = "30%";
    this.textEl.style.padding = "20px";

    this.textEl.style.color = "white";
    this.textEl.style.fontSize = "22px";
    this.textEl.style.lineHeight = "1.5";
    this.textEl.style.whiteSpace = "pre-wrap";

    // ✨ Styling
    this.textEl.style.background = "rgba(0, 0, 0, 0.6)";
    this.textEl.style.border = "2px solid #00ff88";
    this.textEl.style.borderRadius = "12px";
    this.textEl.style.boxShadow = "0 0 15px rgba(0,255,136,0.4)";
    this.textEl.style.backdropFilter = "blur(6px)";

    this.textEl.style.pointerEvents = "none"; // don't block gameplay

    this.container.appendChild(this.textEl);

    // --- VIDEO ---
    this.videoEl = document.createElement("video");
    this.videoEl.style.position = "absolute";
    this.videoEl.style.right = "40px";
    this.videoEl.style.top = "50%";
    this.videoEl.style.transform = "translateY(-50%)";

    this.videoEl.style.width = "30%";
    this.videoEl.style.borderRadius = "12px";
    this.videoEl.style.boxShadow = "0 0 25px black";

    this.videoEl.style.pointerEvents = "none"; // don't block gameplay
    this.videoEl.loop = true;
    rootEl.appendChild(this.videoEl);

    // --- SKIP BUTTON ---
    this.nextBtn = document.createElement("button");
    this.nextBtn.innerText = "Press [ENTER] to Skip Tutorial";

    this.nextBtn.style.position = "absolute";
    this.nextBtn.style.bottom = "30px";
    this.nextBtn.style.right = "40px";

    this.nextBtn.style.padding = "10px 18px";
    this.nextBtn.style.fontSize = "16px";

    this.nextBtn.style.borderRadius = "8px";
    this.nextBtn.style.border = "2px solid #00ff88";
    this.nextBtn.style.background = "rgba(0,0,0,0.6)";
    this.nextBtn.style.color = "#00ff88";

    rootEl.appendChild(this.nextBtn);

    // --- STEPS ---
    this.steps = [
      {
        text: "Move mouse to look around",
        video: "Assets/tutorial/look.mp4",
      },
      {
        text: "Press [E] to move to a new place (highlighted with a white box)",
        video: "Assets/tutorial/move.mp4",
      },
      {
        text: "Press [SPACE] to jump off the platform in the direction you are looking\n(Don't worry, the tether will pull you back)",
        video: "Assets/tutorial/jump.mp4",
      },
      {
        text: "When floating, hold SPACE to pull yourself towards your tether point",
        video: "Assets/tutorial/tether.mp4",
      },
      {
        text: "Press [Q] to scrap inventory\nThis extends your tether range",
        video: "Assets/tutorial/scrap.mp4",
      },
      {
        text: "Right Mouse = preview\nLeft Mouse = Add or remove block\n\nWatch the white box to see your target\n\nTry previewing, adding, and removing a block",
        video: "Assets/tutorial/build.mp4",
      },
      {
        text: "Find the 3 antenna pieces (green boxes)\n\nBuild the antenna on your platform to signal home.\n\nGood luck.",
        video: "Assets/tutorial/goal.mp4",
      },
    ];

    this.updateStep();

    // Optional: keyboard shortcut
    window.addEventListener("keydown", (e) => {
      if (!this.active) return;
      if (e.key === "Enter") this.finish();
    });
  }

  private updateStep() {
    const step = this.steps[this.currentStep];

    // Fade out
    this.videoEl.style.opacity = "0";

    setTimeout(() => {
      this.textEl.innerText =
        `[${this.currentStep + 1}/${this.steps.length}]\n\n` + step.text;

      this.videoEl.src = step.video;
      this.videoEl.currentTime = 0;
      this.videoEl.play();

      this.videoEl.style.opacity = "1";
    }, 150);
  }

  nextStep() {
    this.currentStep++;

    if (this.currentStep >= this.steps.length) {
      this.finish();
      return;
    }

    this.updateStep();
  }

  private finish() {
    this.currentStep = this.steps.length;
    this.root.setHidden(true);
    this.active = false;
  }

  start() {
    if (this.currentStep > 0) {
      return;
    }

    this.active = true;
    this.root.setHidden(false);
  }

  getStep(): number {
    return this.currentStep;
  }

  isActive() {
    return this.active;
  }
}

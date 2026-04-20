import { Howl } from "howler";

export default class EndScreen {
  theme: Howl = null;

  constructor() {
    this.theme = new Howl({
      src: ["Assets/Audio/237127__tyops__arcade-theme-01.wav"],
      autoplay: true,
      loop: true,
      volume: 0.5,
    });

    document.exitPointerLock();
    const el = document.getElementById("end-screen");
    if (el) {
      el.classList.remove("hidden");
    }
  }
}

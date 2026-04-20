import { Howl } from "howler";

export default class EndScreen {
  theme: Howl = null;

  constructor() {
    this.theme = new Howl({
      src: ["Assets/Audio/723702__tomentum__hope-in-dark-places.wav"],
      autoplay: true,
      loop: true,
      volume: 1.0,
    });

    document.exitPointerLock();
    const el = document.getElementById("end-screen");
    if (el) {
      el.classList.remove("hidden");
    }
  }
}

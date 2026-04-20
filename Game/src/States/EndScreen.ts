export default class EndScreen {
  constructor() {
    document.exitPointerLock();
    const el = document.getElementById("end-screen");
    if (el) {
      el.classList.remove("hidden");
    }
  }
}

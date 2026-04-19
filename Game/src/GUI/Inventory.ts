import { Div, GUIRenderer, TextObject2D } from "praccen-web-engine";
import { Input } from "../Input.js";
import GameGUI from "./GameGUI.js";
import { BlockType } from "../Platform.js";

type ItemType = BlockType;

interface ActionItem {
  type: ItemType;
  amount: number;
}

export default class ActionBar {
  private gui: GUIRenderer;
  private root: Div;

  private slots: (ActionItem | null)[] = new Array(10).fill(null);
  private slotDivs: Div[] = [];
  private slotTexts: TextObject2D[] = [];

  private selectedIndex: number = 0;

  constructor(gui: GUIRenderer, gameGUI: GameGUI) {
    this.gui = gui;

    // Root container (bottom center)
    this.root = gui.getNewDiv(gameGUI.inventoryDiv);
    this.root.ignoreEngineModifiers = true;
    const el = this.root.getElement();

    el.style.position = "absolute";
    el.style.bottom = "2%";
    el.style.left = "50%";
    el.style.transform = "translateX(-50%)";
    el.style.display = "flex";
    el.style.gap = "8px";
    el.style.padding = "8px";
    el.style.backgroundColor = "#00000080";
    el.style.borderRadius = "10px";

    // Create 10 slots
    for (let i = 0; i < 10; i++) {
      const slot = gui.getNewDiv(this.root);
      slot.ignoreEngineModifiers = true;
      const slotEl = slot.getElement();

      slotEl.style.width = "60px";
      slotEl.style.height = "60px";
      slotEl.style.backgroundColor = "#373737";
      slotEl.style.border = "2px solid #555";
      slotEl.style.display = "flex";
      slotEl.style.alignItems = "center";
      slotEl.style.justifyContent = "center";
      slotEl.style.position = "relative";

      const text = gui.getNew2DText(slot);
      text.size = 14;
      text.scaleWithWindow = false;
      text.getElement().style.color = "rgb(255, 213, 0)";

      this.slotDivs.push(slot);
      this.slotTexts.push(text);
    }

    this.updateUI();
  }

  // ---- Public API ----

  addItem(type: ItemType, amount: number = 1) {
    // Try stack first
    for (let i = 0; i < 10; i++) {
      if (this.slots[i]?.type === type) {
        this.slots[i]!.amount += amount;
        this.updateUI();
        return;
      }
    }

    // Otherwise find empty slot
    for (let i = 0; i < 10; i++) {
      if (!this.slots[i]) {
        this.slots[i] = { type, amount };
        this.updateUI();
        return;
      }
    }

    console.log("Action bar full");
  }

  useSelected(): ItemType | null {
    const item = this.slots[this.selectedIndex];
    if (!item) return null;

    item.amount--;

    if (item.amount <= 0) {
      this.slots[this.selectedIndex] = null;
    }

    this.updateUI();

    return item.type;
  }

  // ---- Update ----

  update() {
    // Number keys 1–0
    for (let i = 0; i < 10; i++) {
      if (Input.keys[i.toString()]) {
        this.selectedIndex = (i - 1 + 10) % 10;
        this.updateUI();
        break;
      }
    }
  }

  // ---- UI ----

  private updateUI() {
    for (let i = 0; i < 10; i++) {
      const slot = this.slots[i];
      const el = this.slotDivs[i].getElement();

      // Highlight selected
      el.style.border =
        i === this.selectedIndex ? "2px solid yellow" : "2px solid #555";

      if (slot) {
        this.slotTexts[i].textString = `${BlockType[slot.type]}\n${
          slot.amount
        }`;
      } else {
        this.slotTexts[i].textString = " ";
      }
    }
  }
}

import { Div, GUIRenderer, TextObject2D } from "praccen-web-engine";
import { Input } from "../Input.js";
import GameGUI from "./GameGUI.js";
import { BlockType } from "../Platform.js";

type ItemType = BlockType;

interface ActionItem {
  type: ItemType;
  amount: number;
}

const BlockTypeIcons: Record<BlockType, string> = {
  [BlockType.ANTENNA1]: "Assets/Textures/icons/spaceantenna1.png",
  [BlockType.ANTENNA2]: "Assets/Textures/icons/spaceantenna2.png",
  [BlockType.ANTENNA3]: "Assets/Textures/icons/spaceantenna3.png",
  [BlockType.BASE]: "Assets/Textures/icons/spacebox2.png",
  [BlockType.EMPTY]: "Assets/Textures/Lava1.png",
  [BlockType.FLOOR]: "Assets/Textures/icons/spacefloor.png",
  [BlockType.SOLARPANEL]: "Assets/Textures/icons/spacesolar.png",
};

export default class ActionBar {
  private gui: GUIRenderer;
  private root: Div;

  private slots: (ActionItem | null)[] = new Array(10).fill(null);
  private slotDivs: Div[] = [];
  private slotTexts: TextObject2D[] = [];
  private slotIcons: HTMLImageElement[] = [];

  private selectedIndex: number = 0;
  private tetherLengthText: TextObject2D;

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

      // --- SLOT NUMBER ---
      const keyText = gui.getNew2DText(slot);
      keyText.textString = i === 9 ? "0" : (i + 1).toString();
      keyText.size = 12;
      keyText.getElement().style.position = "absolute";
      keyText.getElement().style.color = "rgb(53, 160, 214)";
      keyText.getElement().style.top = "2px";
      keyText.getElement().style.left = "4px";
      keyText.getElement().style.opacity = "0.7";

      // --- ICON ---
      const img = document.createElement("img");
      img.style.width = "80%";
      img.style.height = "80%";
      img.style.objectFit = "contain";
      img.style.pointerEvents = "none"; // important so clicks pass through
      slotEl.appendChild(img);

      // --- AMOUNT TEXT ---
      const text = gui.getNew2DText(slot);
      text.ignoreEngineModifiers = true;
      text.size = 14;
      text.scaleWithWindow = false;
      text.getElement().style.color = "rgb(255, 213, 0)";
      text.getElement().style.position = "absolute";
      text.getElement().style.bottom = "2px";
      text.getElement().style.right = "4px";

      this.slotDivs.push(slot);
      this.slotTexts.push(text);
      this.slotIcons.push(img);
    }

    this.updateUI();

    // Tether label — lives inside the root flex bar, right of the slots
    const tetherDiv = gui.getNewDiv(this.root);
    tetherDiv.ignoreEngineModifiers = true;
    const tetherEl = tetherDiv.getElement();
    tetherEl.style.display = "flex";
    tetherEl.style.flexDirection = "column";
    tetherEl.style.alignItems = "center";
    tetherEl.style.justifyContent = "center";
    tetherEl.style.borderLeft = "1px solid #555";
    tetherEl.style.marginLeft = "185px";
    tetherEl.style.marginTop = "-20px";
    tetherEl.style.gap = "2px";
    tetherEl.style.textShadow =
      "-0.5px 0 black, 0 0.5px black, 0.5px 0 black, 0 -0.5px black";

    this.tetherLengthText = gui.getNew2DText(tetherDiv);
    this.tetherLengthText.ignoreEngineModifiers = true;
    this.tetherLengthText.scaleWithWindow = false;
    this.tetherLengthText.size = 14;
    this.tetherLengthText.getElement().style.color = "rgb(255, 213, 0)";
    this.tetherLengthText.getElement().style.whiteSpace = "nowrap";
    this.tetherLengthText.textString =
      "[Q] Extend tether with scraps.    Tether length: 5";
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

  convertSelectedScrapToTether(): boolean {
    const item = this.slots[this.selectedIndex];
    if (!item) return false;
    if (
      item.type === BlockType.ANTENNA1 ||
      item.type === BlockType.ANTENNA2 ||
      item.type === BlockType.ANTENNA3
    )
      return false;

    item.amount--;
    if (item.amount <= 0) {
      this.slots[this.selectedIndex] = null;
    }
    this.updateUI();
    return true;
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

  setTetherLength(length: number) {
    this.tetherLengthText.textString = `[Q] Extend tether with scraps.    Tether length: ${length}`;
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
      const icon = this.slotIcons[i];

      // Highlight selected
      el.style.border =
        i === this.selectedIndex ? "2px solid yellow" : "2px solid #555";
      el.style.transform =
        i === this.selectedIndex ? "scale(1.1)" : "scale(1.0)";

      if (slot) {
        // Set icon
        const iconPath = BlockTypeIcons[slot.type];
        icon.src = iconPath ?? "";
        icon.style.display = "block";

        // Set amount text only
        this.slotTexts[i].textString = `${slot.amount}`;
        // this.slotTexts[i].textString = `${BlockType[slot.type]}\n${
        //   slot.amount
        // }`;
      } else {
        icon.style.display = "none";
        this.slotTexts[i].textString = " ";
      }
    }
  }
}

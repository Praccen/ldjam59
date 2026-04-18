import { Div, GUIRenderer, Renderer3D, vec2 } from "praccen-web-engine";
import Game from "./Game.js";
import { Input } from "../Input.js";
import MetaGUI from "../GUI/MetaGUI.js";
import GameGUI from "../GUI/GameGUI.js";

export let sensitivity = 1.0;

export default class GameContext {
  private renderer: Renderer3D;
  guiRenderer: GUIRenderer;

  game: Game;
  metaGui: MetaGUI;
  gameGui: GameGUI;

  constructor() {
    // Create a renderer and attach it to the document body
    this.renderer = new Renderer3D();
    document.body.appendChild(this.renderer.domElement);

    this.renderer.useVolumetric = true;
    // this.renderer.setFogTexture("Assets/Textures/Fog.png");

    // Create a GUI renderer and attach it to the document body
    this.guiRenderer = new GUIRenderer();
    document.body.appendChild(this.guiRenderer.domElement);

    // Set the class to apply style defined in index.css
    this.guiRenderer.domElement.className = "guiContainer";

    this.game = new Game(this.renderer, this.guiRenderer);

    this.metaGui = new MetaGUI(this.guiRenderer);
    this.gameGui = new GameGUI(this.guiRenderer);
  }

  resize(width: number, height: number) {
    this.game.resize(width, height);
  }

  onExit() {
    this.game.onExit();
  }

  async loadMeshes(progress: {
    requested: number;
    loaded: number;
  }): Promise<void> {
    return new Promise<void>((resolve, rejects) => {
      let meshes = ["Assets/objs/cube.obj", "Assets/objs/sphere.obj"];
      progress.requested = meshes.length;

      this.renderer.meshStore.loadMeshes(meshes, progress).then(() => {
        resolve();
      });
    });
  }

  start() {
    document.body.requestPointerLock();
  }

  update(dt: number) {
    if (Input.mouseClicked) {
      document.body.requestPointerLock();
    }
    this.game.update(dt);
  }

  preRendereringUpdate(dt: number) {
    this.game.preRenderingUpdate(dt);
  }

  draw() {
    this.game.draw();
  }
}

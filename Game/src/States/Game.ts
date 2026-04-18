import {
  Camera,
  Frustum,
  GUIRenderer,
  PhysicsObject,
  PhysicsScene,
  Renderer3D,
  Scene,
  Transform,
  vec3,
} from "praccen-web-engine";
import { Input } from "../Input.js";
import { sensitivity } from "./GameContext.js";
import { gameContext } from "../main.js";
import Player from "../Player.js";

export default class Game {
  private renderer: Renderer3D;
  guiRenderer: GUIRenderer;

  camera: Camera = new Camera();
  scene: Scene = null;

  player: Player;
  physicsScene: PhysicsScene;

  private gameTimer = 0.0;

  constructor(renderer: Renderer3D, guiRenderer: GUIRenderer) {
    this.renderer = renderer;
    this.guiRenderer = guiRenderer;

    this.renderer.useVolumetric = true;
    this.renderer.setFogTexture("Assets/Textures/Fog.png");

    // Create a camera and set it's starting position
    this.camera = new Camera();
    this.camera.setPosition(vec3.fromValues(4.0, 4.0, 7.0));
    this.camera.setFarPlaneDistance(100000);
    this.camera.setFOV(80);

    this.createLevel();
  }

  createLevel() {
    this.scene = new Scene(this.renderer);
    this.physicsScene = new PhysicsScene();
    vec3.zero(this.physicsScene.gravity);
    this.player = new Player(this.physicsScene);

    vec3.set(this.scene.getDirectionalLight().colour, 1.0, 1.0, 1.0);
    vec3.set(this.scene.getDirectionalLight().direction, 0.0, -1.0, 0.00000001);
    vec3.set(this.scene.getDirectionalLight().shadowFocusPos, 0.0, 0.0, 0.0);
    this.scene.getDirectionalLight().shadowCameraDistance = 1000.0;
    this.scene.getDirectionalLight().lightProjectionBoxSideLength = 1000.0; 
    this.renderer.setFogDensity(0.1);
    this.renderer.setFogBlur(true);
    this.renderer.setFogRenderScale(0.5);

    this.scene.addNewMesh("Assets/objs/sphere.obj", "CSS:rgb(155, 0, 0)", "CSS:rgb(0,0,0)").then((gb) => {
      vec3.set(gb.transform.scale, 100.0, 100.0, 100.0);
      vec3.set(gb.transform.position, 0.0, -100.0, 100.0);
      // gb.emission = this.renderer.textureStore.getTexture("CSS:rgb(155, 0, 0)");
    });

    this.scene.addNewMesh("Assets/objs/sphere.obj", "CSS:rgb(233, 224, 64)", "CSS:rgb(0,0,0)").then((gb) => {
      vec3.set(gb.transform.scale, 1000.0, 1000.0, 1000.0);
      vec3.set(gb.transform.position, 0.0, 10000.0, 10000.0);
      gb.emission = this.renderer.textureStore.getTexture("CSS:rgb(233, 224, 64)");
    });
  }

  resize(width: number, height: number) {
    // Update the camera aspect ratio to fit the new size
    this.camera.setAspectRatio(width / height);

    // Update the size of both the renderer and GUI renderer
    this.renderer.setSize(width, height, true);
    this.guiRenderer.setSize(width, height);
  }

  onExit() {}

  update(dt: number) {
    this.gameTimer += dt;

    this.player.update(dt, this.camera);

    this.physicsScene.update(dt);
  }

  preRenderingUpdate(dt: number) {}

  draw() {
    this.renderer.render(this.scene, this.camera, this.camera.getFrustum());

    this.guiRenderer.draw(this.camera);
  }
}

import {
  Camera,
  Frustum,
  GraphicsBundle,
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

  private sun: GraphicsBundle = null;

  constructor(renderer: Renderer3D, guiRenderer: GUIRenderer) {
    this.renderer = renderer;
    this.guiRenderer = guiRenderer;

    this.renderer.useVolumetric = true;
    this.renderer.setFogTexture("CSS:rgb(255, 255, 255)");
    this.renderer.setFogDensity(0.03);
    this.renderer.setFogBlur(true);
    this.renderer.setFogRenderScale(0.5);
    this.renderer.setSkybox("Assets/Skybox");

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

    vec3.set(this.scene.getDirectionalLight().colour, 1.0, 1.0, 0.5);
    vec3.set(this.scene.getDirectionalLight().direction, 0.0, -1.0, 0.00000001);
    vec3.set(this.scene.getDirectionalLight().shadowFocusPos, 0.0, 0.0, 0.0);
    this.scene.getDirectionalLight().shadowCameraDistance = 1000.0;
    this.scene.getDirectionalLight().lightProjectionBoxSideLength = 10000.0;

    this.scene
      .addNewMesh(
        "Assets/objs/sphere.obj",
        "CSS:rgb(155, 0, 0)",
        "CSS:rgb(0,0,0)"
      )
      .then((gb) => {
        vec3.set(gb.transform.scale, 100.0, 100.0, 100.0);
        vec3.set(gb.transform.position, 0.0, -100.0, 100.0);
        // gb.emission = this.renderer.textureStore.getTexture("CSS:rgb(155, 0, 0)");
      });

    this.scene
      .addNewMesh(
        "Assets/objs/sphere.obj",
        "CSS:rgb(233, 224, 64)",
        "CSS:rgb(0,0,0)"
      )
      .then((gb) => {
        vec3.set(gb.transform.scale, 1000.0, 1000.0, 1000.0);
        vec3.set(gb.transform.position, 0.0, 20000.0, 0.0);
        gb.emission = this.renderer.textureStore.getTexture(
          "CSS:rgb(233, 224, 64)"
        );
        this.sun = gb;
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

    if (this.sun != undefined) {
      vec3.set(
        this.sun.transform.position,
        Math.sin(this.gameTimer) * 20000,
        Math.cos(this.gameTimer) * 20000.0,
        -200.0
      );
    }

    this.player.update(dt, this.camera);

    this.physicsScene.update(dt);
  }

  preRenderingUpdate(dt: number) {
    if (this.scene != undefined && this.sun != undefined) {
      vec3.normalize(
        this.scene.directionalLight.direction,
        vec3.sub(vec3.create(), vec3.create(), this.sun.transform.position)
      );
    }
  }

  draw() {
    this.renderer.render(this.scene, this.camera, this.camera.getFrustum());

    this.guiRenderer.draw(this.camera);
  }
}

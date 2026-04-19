import {
  Camera,
  Frustum,
  GraphicsBundle,
  GUIRenderer,
  PhysicsObject,
  PhysicsScene,
  quat,
  Renderer3D,
  Scene,
  Transform,
  vec3,
} from "praccen-web-engine";
import { Input } from "../Input.js";
import { sensitivity } from "./GameContext.js";
import { gameContext } from "../main.js";
import Player from "../Player.js";
import {
  Block,
  BlockType,
  createDebrisShip,
  createStartingShip,
  Platform,
} from "../Platform.js";
import GameGUI from "../GUI/GameGUI.js";

export default class Game {
  private renderer: Renderer3D;
  guiRenderer: GUIRenderer;
  gameGUI: GameGUI;

  camera: Camera = new Camera();
  scene: Scene;

  player: Player;
  physicsScene: PhysicsScene;

  private gameTimer = 0.0;

  private sun: GraphicsBundle;
  private planet: GraphicsBundle;
  private startingPlatform: Platform;
  private debrisPlatform: Platform;
  private detachedBlocks: Block[] = [];

  constructor(
    renderer: Renderer3D,
    guiRenderer: GUIRenderer,
    gameGUI: GameGUI
  ) {
    this.renderer = renderer;
    this.guiRenderer = guiRenderer;
    this.gameGUI = gameGUI;

    this.renderer.useVolumetric = true;
    this.renderer.setFogTexture("CSS:rgb(255, 255, 255)");
    this.renderer.setFogDensity(0.2);
    this.renderer.setFogBlur(true);
    this.renderer.setFogRenderScale(0.5);
    this.renderer.setFogMaxDistance(100);
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
    this.scene.useTrees = false;

    this.physicsScene = new PhysicsScene();
    vec3.zero(this.physicsScene.gravity);
    this.player = new Player(this.physicsScene, this.guiRenderer, this.gameGUI);

    vec3.set(this.scene.getDirectionalLight().colour, 1.0, 1.0, 0.5);
    vec3.set(this.scene.getDirectionalLight().direction, 0.0, -1.0, 0.00000001);
    vec3.set(this.scene.getDirectionalLight().shadowFocusPos, 0.0, 0.0, 0.0);
    this.scene.getDirectionalLight().shadowCameraDistance = 1000.0;
    this.scene.getDirectionalLight().lightProjectionBoxSideLength = 100.0;

    this.scene
      .addNewMesh(
        "Assets/objs/sphere.obj",
        "Assets/Textures/8k_mars.jpg",
        "CSS:rgb(0,0,0)"
      )
      .then((gb) => {
        vec3.set(gb.transform.scale, 2000.0, 2000.0, 2000.0);
        vec3.set(gb.transform.position, 0.0, -800.0, 800.0);
        quat.fromEuler(gb.transform.rotation, 0.0, 90.0, 180.0);
        this.planet = gb;
      });

    this.scene
      .addNewMesh(
        "Assets/objs/sphere.obj",
        "CSS:rgba(118, 228, 255, 0.3)",
        "CSS:rgb(0,0,0)"
      )
      .then((gb) => {
        vec3.set(gb.transform.scale, 2040.0, 2060.0, 2060.0);
        vec3.set(gb.transform.position, 0.0, -800.0, 800.0);
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

    this.startingPlatform = new Platform(this.scene, this.physicsScene);
    createStartingShip(
      this.startingPlatform,
      vec3.fromValues(0.0, 0.0, 2.0),
      this.player
    );

    this.debrisPlatform = new Platform(this.scene, this.physicsScene);
    createDebrisShip(this.debrisPlatform, vec3.fromValues(200.0, 0.0, 0.0));
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
        Math.sin(this.gameTimer * 0.2) * 20000,
        Math.cos(this.gameTimer * 0.2) * 20000.0,
        -200.0 + Math.sin(this.gameTimer * 0.2) * 20000.0
      );
    }

    if (this.planet != undefined) {
      quat.rotateZ(
        this.planet.transform.rotation,
        this.planet.transform.rotation,
        0.01 * dt
      );
    }

    if (
      this.debrisPlatform != undefined &&
      this.debrisPlatform.baseBlock != undefined
    ) {
      if (
        this.startingPlatform != undefined &&
        this.startingPlatform.baseBlock != undefined
      ) {
        vec3.sub(
          this.debrisPlatform.baseBlock.physicsObject.velocity,
          this.startingPlatform.baseBlock.physicsObject.transform.position,
          this.debrisPlatform.baseBlock.physicsObject.transform.position
        );
        vec3.normalize(
          this.debrisPlatform.baseBlock.physicsObject.velocity,
          this.debrisPlatform.baseBlock.physicsObject.velocity
        );
        vec3.scale(
          this.debrisPlatform.baseBlock.physicsObject.velocity,
          this.debrisPlatform.baseBlock.physicsObject.velocity,
          50
        );

        if (
          this.debrisPlatform.baseBlock.physicsObject.transform.position[0] < 25
        ) {
          this.debrisPlatform.splitPlatform(this.detachedBlocks, 50);
          this.startingPlatform.splitPlatform(this.detachedBlocks, 130);
          if (
            this.player.connectedBlock != null ||
            this.player.tetheredBlock != null
          ) {
            this.startingPlatform.resetWithNewBaseBlock(
              this.player,
              this.detachedBlocks
            );
          }
        }
      }
    }

    this.player.update(dt, this.camera, this.startingPlatform);

    this.physicsScene.update(dt);

    // Clean up detached blocks that get far away, also make sure the player's connected block is not in the list.
    this.detachedBlocks = this.detachedBlocks.filter((block) => {
      if (
        block === this.player.connectedBlock ||
        block === this.player.tetheredBlock
      ) {
        return false;
      }
      if (vec3.sqrLen(block.getWorldPos()) > Math.pow(400, 2.0)) {
        this.scene.deleteGraphicsBundle(block.graphicsBundle);
        this.physicsScene.removePhysicsObject(block.physicsObject);
        return false;
      }
      if (
        this.player.physicsObject.collisionsLastUpdate.has(
          block.physicsObject.physicsObjectId
        )
      ) {
        this.player.pickupBlock(block.type);
        this.scene.deleteGraphicsBundle(block.graphicsBundle);
        this.physicsScene.removePhysicsObject(block.physicsObject);
        return false;
      }
      return true;
    });
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

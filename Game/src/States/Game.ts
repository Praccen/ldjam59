import {
  Camera,
  Div,
  Frustum,
  GraphicsBundle,
  GUIRenderer,
  ParticleSpawner,
  PhysicsObject,
  PhysicsScene,
  quat,
  Ray,
  Renderer3D,
  Scene,
  Shape,
  ShapeGraphicsObject,
  TextObject2D,
  Transform,
  vec3,
  vec4,
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

  private antennaBlocks: Map<Block, { target: vec3; arrived: boolean }> =
    new Map();

  private targetBlockShape: Shape;

  private crashHappened = false;
  private winTriggered = false;

  constructor(
    renderer: Renderer3D,
    guiRenderer: GUIRenderer,
    gameGUI: GameGUI,
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
    this.player = new Player(
      this.scene,
      this.physicsScene,
      this.guiRenderer,
      this.gameGUI,
    );

    vec3.set(this.scene.getDirectionalLight().colour, 1.0, 1.0, 0.5);
    vec3.set(this.scene.getDirectionalLight().direction, 0.0, -1.0, 0.00000001);
    vec3.set(this.scene.getDirectionalLight().shadowFocusPos, 0.0, 0.0, 0.0);
    this.scene.getDirectionalLight().ambientMultiplier = 0.3;
    this.scene.getDirectionalLight().shadowCameraDistance = 1000.0;
    this.scene.getDirectionalLight().lightProjectionBoxSideLength = 100.0;

    this.scene
      .addNewMesh(
        "Assets/objs/sphere.obj",
        "Assets/Textures/8k_mars.jpg",
        "CSS:rgb(0,0,0)",
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
        "CSS:rgb(0,0,0)",
      )
      .then((gb) => {
        vec3.set(gb.transform.scale, 2040.0, 2060.0, 2060.0);
        vec3.set(gb.transform.position, 0.0, -800.0, 800.0);
      });

    this.scene
      .addNewMesh(
        "Assets/objs/sphere.obj",
        "CSS:rgb(233, 224, 64)",
        "CSS:rgb(0,0,0)",
      )
      .then((gb) => {
        vec3.set(gb.transform.scale, 1000.0, 1000.0, 1000.0);
        vec3.set(gb.transform.position, 0.0, 20000.0, 0.0);
        gb.emission = this.renderer.textureStore.getTexture(
          "CSS:rgb(233, 224, 64)",
        );
        this.sun = gb;
      });

    this.startingPlatform = new Platform(this.scene, this.physicsScene);
    createStartingShip(
      this.startingPlatform,
      vec3.fromValues(0.0, 0.0, 2.0),
      this.player,
    );

    // this.debrisPlatform = new Platform(this.scene, this.physicsScene);
    // createDebrisShip(this.debrisPlatform, vec3.fromValues(200.0, 0.0, 0.0));

    let moodParticleSpawner = this.scene.addNewParticleSpawner(
      "CSS:rgb(200, 200, 200)",
      1000,
    );
    moodParticleSpawner.lifeTime = 1.0;
    moodParticleSpawner.randomSizeModifier.sizeMin = 0.1;
    moodParticleSpawner.randomSizeModifier.sizeMax = 0.25;
    moodParticleSpawner.sizeChangePerSecond = 0.0;
    vec3.set(
      moodParticleSpawner.randomPositionModifier.boxMin,
      -100.0,
      -100.0,
      -100.0,
    );
    vec3.set(
      moodParticleSpawner.randomPositionModifier.boxMax,
      300.0,
      100.0,
      100.0,
    );
    vec3.set(
      moodParticleSpawner.randomStartVelModifier.direction,
      0.0,
      -0.5,
      -0.5,
    );
    moodParticleSpawner.randomStartVelModifier.degreesMax = 0.0;
    moodParticleSpawner.randomStartVelModifier.degreesMin = 0.0;
    moodParticleSpawner.randomStartVelModifier.amplitudeMin = 180.0;
    moodParticleSpawner.randomStartVelModifier.amplitudeMax = 350.0;

    // moodParticleSpawner.initAllParticles();
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
        -200.0 + Math.sin(this.gameTimer * 0.2) * 20000.0,
      );
    }

    if (this.planet != undefined) {
      quat.rotateZ(
        this.planet.transform.rotation,
        this.planet.transform.rotation,
        0.01 * dt,
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
          this.debrisPlatform.baseBlock.physicsObject.transform.position,
        );
        vec3.normalize(
          this.debrisPlatform.baseBlock.physicsObject.velocity,
          this.debrisPlatform.baseBlock.physicsObject.velocity,
        );
        vec3.scale(
          this.debrisPlatform.baseBlock.physicsObject.velocity,
          this.debrisPlatform.baseBlock.physicsObject.velocity,
          50,
        );

        if (
          this.debrisPlatform.baseBlock.physicsObject.transform.position[0] < 25
        ) {
          const antenna1 = this.startingPlatform.getBlockAtOffset(
            vec3.fromValues(0, 5, 0).toString(),
          );
          const antenna2 = this.startingPlatform.getBlockAtOffset(
            vec3.fromValues(0, 6, 0).toString(),
          );
          const antenna3 = this.startingPlatform.getBlockAtOffset(
            vec3.fromValues(0, 7, 0).toString(),
          );

          this.debrisPlatform.splitPlatform(this.detachedBlocks, 50);
          this.startingPlatform.splitPlatform(this.detachedBlocks, 130);
          this.crashHappened = true;

          const antennaTargets: [Block | undefined, vec3][] = [
            [antenna1, vec3.fromValues(3, 0, 0)],
            [antenna2, vec3.fromValues(0, 3, 0)],
            [antenna3, vec3.fromValues(0, 0, 3)],
          ];
          for (const [block, target] of antennaTargets) {
            if (block == null) continue;
            block.physicsObject.isImmovable = true;
            vec3.zero(block.physicsObject.velocity);
            vec3.zero(block.physicsObject.impulse);
            this.antennaBlocks.set(block, {
              target,
              arrived: false,
            });
          }

          if (
            this.player.connectedBlock != null ||
            this.player.tetheredBlock != null
          ) {
            this.startingPlatform.resetWithNewBaseBlock(
              this.player,
              this.detachedBlocks,
            );
          }
        }
      }
    }

    this.player.update(dt, this.camera, this.startingPlatform);

    if (this.crashHappened && !this.winTriggered) {
      if (this.startingPlatform.hasAntennaComplete()) {
        this.triggerWin();
      }
    }

    // Move and lock antennas
    for (const [block, state] of this.antennaBlocks) {
      if (!state.arrived) {
        const pos = block.graphicsBundle.transform.position;
        const dir = vec3.sub(vec3.create(), state.target, pos);
        const dist = vec3.len(dir);
        if (dist > 0.02) {
          const step = Math.min(dist, 2.0 * dt);
          vec3.normalize(dir, dir);
          vec3.scaleAndAdd(pos, pos, dir, step);
        } else {
          vec3.copy(pos, state.target);
          state.arrived = true;
          block.physicsObject.isImmovable = false;
          this.antennaBlocks.delete(block);
        }
      }
    }

    this.physicsScene.update(dt);

    // Clean up detached blocks that get far away, also make sure the player's connected block is not in the list.
    this.detachedBlocks = this.detachedBlocks.filter((block) => {
      if (
        block === this.player.connectedBlock ||
        block === this.player.tetheredBlock
      ) {
        return false;
      }
      // Keep antenna blocks that are still lerping to their final positions.
      if (this.antennaBlocks.has(block)) {
        return true;
      }
      if (vec3.sqrLen(block.getWorldPos()) > Math.pow(400, 2.0)) {
        this.scene.deleteGraphicsBundle(block.graphicsBundle);
        this.physicsScene.removePhysicsObject(block.physicsObject);
        return false;
      }
      if (
        this.player.physicsObject.collisionsLastUpdate.has(
          block.physicsObject.physicsObjectId,
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

  private triggerWin() {
    this.winTriggered = true;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes antenna-pulse {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    const div = this.guiRenderer.getNewDiv();
    div.ignoreEngineModifiers = true;
    const el = div.getElement();
    el.style.width = "100%";
    el.style.height = "100%";
    el.style.position = "absolute";
    el.style.top = "42%";
    el.style.left = "47%";
    el.style.pointerEvents = "none";
    el.style.zIndex = "500";

    const text = this.guiRenderer.getNew2DText(div);
    text.ignoreEngineModifiers = true;
    text.scaleWithWindow = false;
    text.size = 40;
    text.center = true;
    text.position[0] = 0.5;
    text.position[1] = 0.5;
    text.textString = "Antenna activating...";
    const textEl = text.getElement();
    textEl.style.color = "rgb(80, 255, 120)";
    textEl.style.textShadow =
      "0 0 20px rgba(80, 255, 120, 0.8), 0 0 40px rgba(80, 255, 120, 0.5)";
    textEl.style.animation = "antenna-pulse 1.5s ease-in-out infinite";
  }

  preRenderingUpdate(dt: number) {
    if (this.scene != undefined && this.sun != undefined) {
      vec3.normalize(
        this.scene.directionalLight.direction,
        vec3.sub(vec3.create(), vec3.create(), this.sun.transform.position),
      );
    }
    this.scene.updateParticleSpawners(dt);
    let ray = new Ray();
    ray.setStartAndDir(this.camera.getPosition(), this.camera.getDir());
    let hit = this.physicsScene.doRayCast(
      ray,
      false,
      [this.player.physicsObject, this.player.connectedBlock.physicsObject],
      10.0,
    );

    if (hit.object != undefined) {
      let block = this.startingPlatform.getBlockFromPhysicsObject(hit.object);
      if (block != undefined) {
        if (
          this.targetBlockShape == undefined ||
          this.targetBlockShape != block.physicsObject.boundingBox
        ) {
          this.scene.deleteShape(this.targetBlockShape);
          let shapeGb = this.scene.addNewShape(block.physicsObject.boundingBox);
          vec4.set(shapeGb.colour, 1.0, 1.0, 1.0, 1.0);
          this.targetBlockShape = block.physicsObject.boundingBox;
        }
      }
    }
  }

  draw() {
    this.renderer.render(this.scene, this.camera, this.camera.getFrustum());

    this.guiRenderer.draw(this.camera);
  }
}

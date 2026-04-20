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
import { Howl } from "howler";

export default class Game {
  private renderer: Renderer3D;
  guiRenderer: GUIRenderer;
  gameGUI: GameGUI;

  camera: Camera = new Camera();
  scene: Scene;

  player: Player;
  physicsScene: PhysicsScene;

  ambient: Howl = null;
  breathing: Howl = null;

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
  isGameOver = false;

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
    this.ambient = new Howl({
      src: ["Assets/Audio/327586__kickhat__ambient.mp3"],
      autoplay: true,
      loop: true,
      volume: 1.0,
    });
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

    this.debrisPlatform = new Platform(this.scene, this.physicsScene);
    createDebrisShip(this.debrisPlatform, vec3.fromValues(200.0, 0.0, 0.0));

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
          this.debrisPlatform.baseBlock.physicsObject.transform.position[0] < 3
        ) {
          vec3.scale(
            this.debrisPlatform.baseBlock.physicsObject.velocity,
            this.debrisPlatform.baseBlock.physicsObject.velocity,
            0.4,
          );

          const antenna1 = this.startingPlatform.getBlockAtOffset(
            vec3.fromValues(0, 5, 0).toString(),
          );
          const antenna2 = this.startingPlatform.getBlockAtOffset(
            vec3.fromValues(0, 6, 0).toString(),
          );
          const antenna3 = this.startingPlatform.getBlockAtOffset(
            vec3.fromValues(0, 7, 0).toString(),
          );
          new Howl({
            src: [
              "Assets/Audio/daviddumaisaudio-large-underwater-explosion-190270.mp3",
            ],
            autoplay: true,
            volume: 0.5,
          });
          this.debrisPlatform.splitPlatform(this.detachedBlocks, 50, 800.0);
          this.startingPlatform.splitPlatform(this.detachedBlocks, 400.0);
          this.crashHappened = true;
          this.player.setConnectedBlock(null!, false);
          vec3.set(this.player.physicsObject.impulse, -2.0, 0.0, 0.0);

          const antennaTargets: [Block | undefined, vec3][] = [
            [antenna1, vec3.fromValues(10, 0, 0)],
            [antenna2, vec3.fromValues(0, 20, 0)],
            [antenna3, vec3.fromValues(0, 0, 35)],
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

          this.startingPlatform.resetWithNewBaseBlock(
            this.player,
            this.detachedBlocks,
          );
        }
      }
    }

    this.player.update(dt, this.camera, this.startingPlatform);

    // Debug for activating win
    if (
      Input.keys["F"] &&
      ["localhost", "127.0.0.1"].includes(location.hostname)
    ) {
      this.triggerWin();
    }
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
          block.physicsObject.isImmovable = true;
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
      if (vec3.sqrLen(block.getWorldPos()) > Math.pow(100, 2.0)) {
        // Make it move towards player
        vec3.scale(
          block.physicsObject.velocity,
          vec3.normalize(
            vec3.create(),
            vec3.sub(
              vec3.create(),
              this.player.physicsObject.transform.position,
              block.getWorldPos(),
            ),
          ),
          5.0 + Math.random() * 10.0,
        );
        vec3.add(
          block.physicsObject.velocity,
          block.physicsObject.velocity,
          vec3.fromValues(Math.random(), Math.random(), Math.random()),
        );
        return true;
      }
      if (
        vec3.dist(
          block.physicsObject.transform.position,
          this.player.physicsObject.transform.position,
        ) < 1.5
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
      @keyframes fade-to-black {
        from { opacity: 0; }
        to   { opacity: 1; }
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
    el.style.left = "46.5%";
    el.style.pointerEvents = "none";
    el.style.zIndex = "1001";

    const text = this.guiRenderer.getNew2DText(div);
    text.ignoreEngineModifiers = true;
    text.scaleWithWindow = false;
    text.size = 40;
    text.center = true;
    text.position[0] = 0.5;
    text.position[1] = 0.5;
    text.textString = "";
    const textEl = text.getElement();
    textEl.style.color = "rgb(80, 255, 120)";

    const fullText = "Antenna activating...";
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      charIndex++;
      text.textString = fullText.slice(0, charIndex);
      if (charIndex >= fullText.length) {
        clearInterval(typeInterval);
        textEl.style.animation = "antenna-pulse 1.5s ease-in-out infinite";
      }
    }, 80);

    new Howl({
      src: ["Assets/Audio/58932__electrosnail__radio_noises.mp3"],
      autoplay: true,
      volume: 0.1,
    });

    const fadeDiv = this.guiRenderer.getNewDiv();
    fadeDiv.ignoreEngineModifiers = true;
    const fadeEl = fadeDiv.getElement();
    fadeEl.style.width = "100%";
    fadeEl.style.height = "100%";
    fadeEl.style.position = "fixed";
    fadeEl.style.top = "0";
    fadeEl.style.left = "0";
    fadeEl.style.backgroundColor = "black";
    fadeEl.style.pointerEvents = "none";
    fadeEl.style.zIndex = "1000";
    fadeEl.style.opacity = "0";

    setTimeout(() => {
      // Start fading after 2 sec
      fadeEl.style.animation = "fade-to-black 3s ease-in forwards";
      setTimeout(() => {
        // Unset text after 2.5 sec
        text.textString = "";
        textEl.style.animation = "";
        setTimeout(() => {
          // Set signal received and start signal sound aftar 3.5 sec
          const signalText = "Signal received.";
          let signalCharIndex = 0;
          text.textString = "";
          const signalTypeInterval = setInterval(() => {
            signalCharIndex++;
            text.textString = signalText.slice(0, signalCharIndex);
            if (signalCharIndex >= signalText.length) {
              clearInterval(signalTypeInterval);
            }
          }, 80);
          new Howl({
            src: ["Assets/Audio/459838__eschwabe3__ship-radar.wav"],
            autoplay: true,
            volume: 0.001,
          }).fade(0.5, 0, 3000);
          setTimeout(() => {
            // Fade ambient after 6.5 sec
            this.ambient.fade(1, 0, 3000);
            setTimeout(() => {
              // unload ambient after 9.5 sec
              this.ambient.fade(1, 0, 3000);
              this.ambient.unload();
            }, 3000);
            el.remove();
            fadeEl.remove();
            this.isGameOver = true;
          }, 3000);
        }, 1000);
      }, 500);
    }, 2000);
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
      [this.player.physicsObject, this.player.connectedBlock?.physicsObject],
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
      } else {
        this.scene.deleteShape(this.targetBlockShape);
        this.targetBlockShape = null!;
      }
    } else {
      this.scene.deleteShape(this.targetBlockShape);
      this.targetBlockShape = null!;
    }
  }

  draw() {
    this.renderer.render(this.scene, this.camera, this.camera.getFrustum());

    this.guiRenderer.draw(this.camera);
  }
}

import { vec3 } from "gl-matrix";
import {
  Camera,
  GUIRenderer,
  ParticleSpawner,
  PhysicsObject,
  PhysicsScene,
  Ray,
  Scene,
} from "praccen-web-engine";
import { Input } from "./Input";
import { Block, BlockType, Platform } from "./Platform";
import GameGUI from "./GUI/GameGUI";
import ActionBar from "./GUI/Inventory";

const jumpForce: number = 1.5;
const sensitivity: number = 0.4;

export default class Player {
  private guiRenderer: GUIRenderer;
  private gameGUI: GameGUI;

  physicsScene: PhysicsScene;
  physicsObject: PhysicsObject;

  pitch: number = 0.0;
  jaw: number = 0.0;
  private camOffset: number = 0.25;
  private tetherLength: number = 5.0;

  private mouseWasClicked: boolean = false;
  connectedBlock: Block = null;
  tetheredBlock: Block = null;
  private lerpSpeed: number = 2.5;
  private lerpMovefloating: boolean = false;

  private convertingScrap: boolean = false;
  private mouseRightWasClicked: boolean = false;
  private floating: boolean = true;

  private picking: boolean = false;
  private jumping: boolean = false;

  private inventory: ActionBar;

  private tetherParticleSpawner: ParticleSpawner;
  private tetherTension: number = 0.0;

  constructor(
    scene: Scene,
    physicsScene: PhysicsScene,
    guiRenderer: GUIRenderer,
    gameGUI: GameGUI,
  ) {
    this.guiRenderer = guiRenderer;
    this.gameGUI = gameGUI;
    this.physicsScene = physicsScene;
    this.physicsObject = physicsScene.addNewPhysicsObject();
    vec3.set(this.physicsObject.transform.scale, 1.0, 2.0, 1.0);
    vec3.set(this.physicsObject.transform.origin, 0.0, -0.5, 0.0);
    vec3.set(this.physicsObject.transform.position, 0.0, 1.0, 0.0);
    this.physicsObject.drag = 0.0;

    this.inventory = new ActionBar(this.guiRenderer, this.gameGUI);

    this.tetherParticleSpawner = scene.addNewParticleSpawner(
      "CSS:rgba(255, 255, 215, 0.77)",
      300,
    );
    this.tetherParticleSpawner.lifeTime = 0.01;
    this.tetherParticleSpawner.randomSizeModifier.sizeMin = 0.01;
    this.tetherParticleSpawner.randomSizeModifier.sizeMax = 0.01;
  }

  setTetheredBlock(block: Block) {
    if (block != null) {
      this.tetheredBlock = block;
    }
  }

  setConnectedBlock(block: Block, lerp: boolean = true) {
    this.connectedBlock = block;
    this.setTetheredBlock(block);
    this.lerpMovefloating = lerp;
    if (block != null) {
      this.physicsObject.isImmovable = true;
    } else {
      this.physicsObject.isImmovable = false;
      this.floating = true;
    }
  }

  update(dt: number, camera: Camera, platform: Platform) {
    this.tetherTension = 0.0;
    // Rotate camera with mouse
    let mouseDiff = Input.getMouseMovement();
    if (document.pointerLockElement == document.body) {
      this.pitch -= mouseDiff[1] * sensitivity;
      this.jaw -= mouseDiff[0] * sensitivity;

      this.pitch = Math.max(Math.min(this.pitch, 89), -89); // Don't allow the camera to go past 89 degrees
      this.jaw = this.jaw % 360;
    }

    this.handleInput(camera, platform);

    this.setPositionFromBlock(dt);

    this.updateCamera(camera);

    this.inventory.update();

    if (this.tetheredBlock != null) {
      let tetherStart = vec3.sub(
        vec3.create(),
        this.physicsObject.transform.position,
        camera.getUp(),
      );

      let direction = vec3.sub(
        vec3.create(),
        this.tetheredBlock.getWorldPos(),
        tetherStart,
      );

      const numKeyframes = 10;

      if (
        this.tetherParticleSpawner.randomPositionModifier.keyframes.length == 0
      ) {
        // Generate initial keyframes
        for (let i = 0; i < numKeyframes; i++) {
          this.tetherParticleSpawner.randomPositionModifier.keyframes.push(
            vec3.scaleAndAdd(
              vec3.create(),
              tetherStart,
              direction,
              i * (1.0 / (numKeyframes - 1)),
            ),
          );
        }
      } else {
        // Update the existing keyframes
        for (let i = 0; i < numKeyframes; i++) {
          // Figure out the target frame position
          let targetFrame = vec3.scaleAndAdd(
            vec3.create(),
            tetherStart,
            direction,
            i * (1.0 / (numKeyframes - 1)),
          );

          // Get the difference
          let diff = vec3.sub(
            vec3.create(),
            targetFrame,
            this.tetherParticleSpawner.randomPositionModifier.keyframes[i],
          );

          // Apply more of the diff close to player and block, less in the middle of the line
          vec3.scaleAndAdd(
            this.tetherParticleSpawner.randomPositionModifier.keyframes[i],
            this.tetherParticleSpawner.randomPositionModifier.keyframes[i],
            diff,
            Math.min(
              vec3.squaredLength(diff) *
                Math.max(0.1, Math.abs(i - numKeyframes / 2) / numKeyframes) +
                this.tetherTension,
              1.0,
            ),
          );
        }
      }
    }
  }

  setPositionFromBlock(dt: number) {
    if (this.connectedBlock != null) {
      const targetPos = this.connectedBlock.getWorldPos();
      if (this.lerpMovefloating && !this.floating) {
        const t = 1.0 - Math.exp(-this.lerpSpeed * dt);
        vec3.lerp(
          this.physicsObject.transform.position,
          this.physicsObject.transform.position,
          targetPos,
          t,
        );
      } else {
        this.physicsObject.transform.position = targetPos;
      }

      if (
        vec3.distance(this.physicsObject.transform.position, targetPos) <= 0.5
      ) {
        this.floating = false;
      }

      this.physicsObject.transform.rotation = this.connectedBlock.getWorldRot();
    } else if (this.floating && this.tetheredBlock != null) {
      const blockPos = this.tetheredBlock.getWorldPos();
      const dist = vec3.distance(
        this.physicsObject.transform.position,
        blockPos,
      );
      if (dist >= this.tetherLength) {
        vec3.scaleAndAdd(
          this.physicsObject.impulse,
          this.physicsObject.impulse,
          vec3.normalize(
            vec3.create(),
            vec3.sub(
              vec3.create(),
              this.physicsObject.transform.position,
              this.tetheredBlock.getWorldPos(),
            ),
          ),
          -0.001 * Math.pow(dist, 2),
        );
        this.tetherTension = 0.001 * Math.pow(dist, 2);
      }
    }
  }

  updateCamera(camera: Camera) {
    let camOffset = vec3.fromValues(0.0, 0.0, 0.0);
    if (!this.floating) {
      camOffset = vec3.fromValues(0.0, this.camOffset, 0.0);
    }
    vec3.transformQuat(
      camOffset,
      camOffset,
      this.physicsObject.transform.rotation,
    );
    camera.setPosition(
      vec3.add(vec3.create(), this.physicsObject.transform.position, camOffset),
    );

    camera.setPitchJawDegrees(this.pitch, this.jaw);
    let dir = vec3.clone(camera.getDir() as vec3);
    vec3.transformQuat(dir, dir, this.physicsObject.transform.rotation);
    camera.setDir(dir);

    let up = vec3.fromValues(0.0, 1.0, 0.0);
    vec3.transformQuat(up, up, this.physicsObject.transform.rotation);
    camera.setUp(up);
  }

  handleInput(camera: Camera, platform: Platform) {
    // Move to block ad point
    if (Input.keys["E"]) {
      if (!this.picking) {
        let ray = new Ray();
        ray.setStartAndDir(camera.getPosition(), camera.getDir());
        let ignoreList = [this.physicsObject];
        if (this.connectedBlock != null) {
          ignoreList.push(this.connectedBlock.physicsObject);
        }
        let hit = this.physicsScene.doRayCast(ray, false, ignoreList, 3.0);
        if (hit.object != undefined) {
          let block = platform.getBlockFromPhysicsObject(hit.object);
          if (block && block.type == BlockType.EMPTY) {
            this.setConnectedBlock(block);
            this.physicsObject.velocity = vec3.create();
            this.physicsObject.impulse = vec3.create();
            this.physicsObject.force = vec3.create();
          }
        }
      }
      this.picking = true;
    } else {
      this.picking = false;
    }

    // Jump off platform
    if (!this.jumping && Input.keys[" "]) {
      if (this.connectedBlock != null) {
        this.setConnectedBlock(null, false);
        this.floating = true;
        const jumpDir = vec3.normalize(vec3.create(), camera.getDir() as vec3);
        vec3.scaleAndAdd(
          this.physicsObject.transform.position,
          this.physicsObject.transform.position,
          jumpDir,
          this.camOffset,
        );
        vec3.scaleAndAdd(
          this.physicsObject.impulse,
          this.physicsObject.impulse,
          jumpDir,
          jumpForce,
        );
      } else if (this.tetheredBlock != null) {
        this.tetherTension = 0.1;
        vec3.scaleAndAdd(
          this.physicsObject.impulse,
          this.physicsObject.impulse,
          vec3.normalize(
            vec3.create(),
            vec3.sub(
              vec3.create(),
              this.physicsObject.transform.position,
              this.tetheredBlock.getWorldPos(),
            ),
          ),
          -0.1,
        );
      }
      this.jumping = true;
    } else {
      this.jumping = false;
    }

    if (Input.keys["SHIFT"]) {
      platform.showRemovableBlock(camera, this);
    }

    if (Input.mouseClicked) {
      if (!this.mouseWasClicked) {
        if (Input.keys["SHIFT"]) {
          let type = platform.removeBlockFromRayCast(camera, this);
          if (type != undefined) {
            this.pickupBlock(type!);
          }
        } else {
          let type = this.inventory.useSelected();
          if (type != undefined) {
            if (!platform.placeBlockFromRayCast(type, camera, this)) {
              this.inventory.addItem(type); // Couldn't place block, give it back to inventory
            }
          }
        }
      }
      this.mouseWasClicked = true;
    } else {
      this.mouseWasClicked = false;
    }

    if (Input.keys["Q"]) {
      if (!this.convertingScrap) {
        if (this.inventory.convertSelectedScrapToTether()) {
          this.tetherLength += 1;
          this.inventory.setTetherLength(this.tetherLength);
        }
      }
      this.convertingScrap = true;
    } else {
      this.convertingScrap = false;
    }

    if (Input.mouseRightClicked && this.connectedBlock != null) {
      platform.showEmptyBlock(camera, this);
      if (!this.mouseRightWasClicked) {
      }
      this.mouseRightWasClicked = true;
    } else {
      this.mouseRightWasClicked = false;
    }
  }

  pickupBlock(blockType: BlockType) {
    this.inventory.addItem(blockType);
  }
}

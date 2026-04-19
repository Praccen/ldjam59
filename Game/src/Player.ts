import { vec2, vec3 } from "gl-matrix";
import {
  Camera,
  GUIRenderer,
  PhysicsObject,
  PhysicsScene,
  Ray,
} from "praccen-web-engine";
import { Input } from "./Input";
import { Block, BlockType, Platform } from "./Platform";
import GameGUI from "./GUI/GameGUI";

const jumpForce: number = 1.5;
const sensitivity: number = 0.4;

export default class Player {
  private guiRenderer: GUIRenderer;
  private gameGUI: GameGUI;

  physicsScene: PhysicsScene;
  physicsObject: PhysicsObject;

  pitch: number = 0.0;
  jaw: number = 0.0;

  private mouseWasClicked: boolean = false;
  connectedBlock: Block = null;
  tetheredBlock: Block = null;
  private lerpSpeed: number = 2.5;
  private lerpMovefloating: boolean = false;

  private mouseRightWasClicked: boolean = false;
  private floating: boolean = true;

  private picking: boolean = false;
  private jumping: boolean = false;

  private inventory: Map<BlockType, number> = new Map<BlockType, number>();

  constructor(
    physicsScene: PhysicsScene,
    guiRenderer: GUIRenderer,
    gameGUI: GameGUI
  ) {
    this.guiRenderer = guiRenderer;
    this.gameGUI = gameGUI;
    this.physicsScene = physicsScene;
    this.physicsObject = physicsScene.addNewPhysicsObject();
    vec3.set(this.physicsObject.transform.scale, 1.0, 2.0, 1.0);
    vec3.set(this.physicsObject.transform.origin, 0.0, -0.5, 0.0);
    vec3.set(this.physicsObject.transform.position, 0.0, 1.0, 0.0);
    this.physicsObject.drag = 0.0;
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
    }
  }

  update(dt: number, camera: Camera, platform: Platform) {
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
          t
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
        blockPos
      );
      if (dist >= 5.0) {
        vec3.scaleAndAdd(
          this.physicsObject.impulse,
          this.physicsObject.impulse,
          vec3.normalize(
            vec3.create(),
            vec3.sub(
              vec3.create(),
              this.physicsObject.transform.position,
              this.tetheredBlock.getWorldPos()
            )
          ),
          -0.001 * Math.pow(dist, 2)
        );
      }
    }
  }

  updateCamera(camera: Camera) {
    let camOffset = vec3.fromValues(0.0, 1.8, 0.0);
    vec3.transformQuat(
      camOffset,
      camOffset,
      this.physicsObject.transform.rotation
    );

    camera.setPosition(
      vec3.add(vec3.create(), this.physicsObject.transform.position, camOffset)
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
    if (!this.picking && Input.keys["E"]) {
      let ray = new Ray();
      ray.setStartAndDir(camera.getPosition(), camera.getDir());
      let hit = this.physicsScene.doRayCast(
        ray,
        true,
        [this.physicsObject],
        3.0
      );
      if (hit.object != undefined) {
        let block = platform.getBlockFromPhysicsObject(hit.object);
        if (block) {
          this.setConnectedBlock(block);
          this.physicsObject.velocity = vec3.create();
          this.physicsObject.impulse = vec3.create();
          this.physicsObject.force = vec3.create();
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
        vec3.scaleAndAdd(
          this.physicsObject.impulse,
          this.physicsObject.impulse,
          vec3.transformQuat(
            vec3.create(),
            vec3.fromValues(0.0, 1.0, 0.0),
            this.physicsObject.transform.rotation
          ),
          jumpForce
        );
      } else if (this.tetheredBlock != null) {
        vec3.scaleAndAdd(
          this.physicsObject.impulse,
          this.physicsObject.impulse,
          vec3.normalize(
            vec3.create(),
            vec3.sub(
              vec3.create(),
              this.physicsObject.transform.position,
              this.tetheredBlock.getWorldPos()
            )
          ),
          -0.1
        );
      }
      this.jumping = true;
    } else {
      this.jumping = false;
    }

    if (Input.mouseClicked) {
      if (!this.mouseWasClicked) {
        platform.placeBlockFromRayCast(BlockType.FLOOR, camera, this);
      }

      this.mouseWasClicked = true;
    } else {
      this.mouseWasClicked = false;
    }

    if (Input.mouseRightClicked && this.connectedBlock != null) {
      // if (!this.mouseRightWasClicked) {
      platform.showEmptyBlock(camera, this);
      // let type = platform.removeBlockFromRayCast(camera, this);
      // if (type != undefined) {
      // this.pickupBlock(type!);
      // }
    }
    // this.mouseRightWasClicked = true;
    // } else {
    // this.mouseRightWasClicked = false;
  }

  pickupBlock(blockType: BlockType) {
    let inventoryAmount = this.inventory.get(blockType);
    if (inventoryAmount == undefined) {
      inventoryAmount = 0;
      // this.guiRenderer.getNew2DText(this.gameGUI.inventoryDiv);
    }
    this.inventory.set(blockType, inventoryAmount + 1);
    console.log(
      "BlockType:" +
        BlockType[blockType] +
        " : " +
        (inventoryAmount + 1).toString()
    );
  }
}

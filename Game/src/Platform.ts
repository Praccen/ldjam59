import {
  Camera,
  GraphicsBundle,
  mat4,
  MousePicking,
  PhysicsObject,
  PhysicsScene,
  quat,
  Ray,
  Scene,
  vec3,
} from "praccen-web-engine";
import Player from "./Player";
export enum BlockType {
  BASE,
  FLOOR,
  TEST,
}

const BlockTypeToColorMap = new Map<BlockType, string>([
  [BlockType.BASE, "CSS:rgb(255, 0, 0)"],
  [BlockType.FLOOR, "CSS:rgb(176, 176, 176)"],
  [BlockType.TEST, "CSS:rgb(0, 255, 0)"],
]);

export class Block {
  graphicsBundle: GraphicsBundle;
  physicsObject: PhysicsObject;
  type: BlockType;
  constructor(
    graphicsBundle: GraphicsBundle,
    physicsObject: PhysicsObject,
    type: BlockType
  ) {
    this.graphicsBundle = graphicsBundle;
    this.physicsObject = physicsObject;
    this.physicsObject.isImmovable = true;
    this.type = type;
  }
}

export class Platform {
  private scene: Scene;
  private physicsScene: PhysicsScene;

  baseBlock: Block;
  private attachedBlocks: Map<string, Block | undefined> = new Map<
    string,
    Block
  >();
  private physicsObjectIdToAttachedBlocksKey: Map<number, string> = new Map<
    number,
    string
  >();

  constructor(
    scene: Scene,
    physicsScene: PhysicsScene,
    baseBlockStartingPosition: vec3,
    player?: Player
  ) {
    this.scene = scene;
    this.physicsScene = physicsScene;

    this.addBlock(vec3.fromValues(0, 0, 0), BlockType.BASE).then(() => {
      this.addBlock(vec3.fromValues(1, 0, 0), BlockType.TEST);
      this.addBlock(vec3.fromValues(0, 0, 1), BlockType.TEST);
      this.addBlock(vec3.fromValues(0, 1, 1), BlockType.TEST);
      if (player) {
        player.setConnectedBlock(this.baseBlock);
      }
    });
  }

  getBlockFromPhysicsObject(physicsObject: PhysicsObject): Block | undefined {
    if (
      !this.physicsObjectIdToAttachedBlocksKey.has(
        physicsObject.physicsObjectId
      )
    ) {
      return undefined;
    }

    return this.attachedBlocks.get(
      this.physicsObjectIdToAttachedBlocksKey.get(
        physicsObject.physicsObjectId
      ) ?? ""
    );
  }

  addBlock(offset: vec3, type: BlockType): Promise<Block> {
    return new Promise<Block>(async (resolve, reject) => {
      if (this.attachedBlocks.has(offset.toString())) {
        reject("Grid spot taken");
      }

      if (this.baseBlock == undefined) {
        type = BlockType.BASE;
        if (vec3.sqrLen(offset) > 0.0001) {
          reject("No base block in platform yet");
        }
      }

      this.attachedBlocks.set(offset.toString(), undefined); // Reserve the spot
      await this.scene
        .addNewMesh(
          "Assets/objs/cube.obj",
          BlockTypeToColorMap.get(type)!,
          "CSS:rgb(0,0,0)"
        )
        .then((gb) => {
          gb.transform.position = offset;
          if (this.baseBlock != undefined) {
            gb.transform.parentTransform =
              this.baseBlock.graphicsBundle.transform;
          }
          let physicsObject = this.physicsScene.addNewPhysicsObject(
            gb.transform
          );

          let block = new Block(gb, physicsObject, type);
          if (vec3.sqrLen(offset) < 0.0001) {
            this.baseBlock = block;
          }
          this.attachedBlocks.set(offset.toString(), block);
          this.physicsObjectIdToAttachedBlocksKey.set(
            physicsObject.physicsObjectId,
            offset.toString()
          );
          resolve(block);
        });
    });
  }

  placeBlockFromRayCast(type: BlockType, camera: Camera, player: Player) {
    let ray = new Ray();
    ray.setStartAndDir(camera.getPosition(), camera.getDir());
    let hit = this.physicsScene.doRayCast(
      ray,
      true,
      [player.physicsObject],
      100.0
    );
    if (hit.object == undefined) {
      return;
    }

    if (
      !this.physicsObjectIdToAttachedBlocksKey.has(hit.object.physicsObjectId)
    ) {
      return;
    }

    let hitPosition = vec3.scaleAndAdd(
      vec3.create(),
      camera.getPosition(),
      camera.getDir(),
      hit.distance
    );
    let hitPositionInLocalCoords = vec3.transformMat4(
      vec3.create(),
      hitPosition,
      mat4.invert(mat4.create(), this.baseBlock.physicsObject.transform.matrix)
    );

    let diff = vec3.sub(
      vec3.create(),
      hitPositionInLocalCoords,
      hit.object.physicsObjectId == this.baseBlock.physicsObject.physicsObjectId
        ? vec3.create()
        : hit.object.transform.position
    );
    let offsetComparedToHitObject = vec3.create();
    if (
      Math.abs(diff[0]) > Math.abs(diff[1]) &&
      Math.abs(diff[0]) > Math.abs(diff[2])
    ) {
      vec3.normalize(
        offsetComparedToHitObject,
        vec3.set(diff, diff[0], 0.0, 0.0)
      );
    } else if (
      Math.abs(diff[1]) > Math.abs(diff[0]) &&
      Math.abs(diff[1]) > Math.abs(diff[2])
    ) {
      vec3.normalize(
        offsetComparedToHitObject,
        vec3.set(diff, 0.0, diff[1], 0.0)
      );
    } else {
      vec3.normalize(
        offsetComparedToHitObject,
        vec3.set(diff, 0.0, 0.0, diff[2])
      );
    }

    this.addBlock(
      vec3.add(
        vec3.create(),
        hit.object.physicsObjectId ==
          this.baseBlock.physicsObject.physicsObjectId
          ? vec3.create()
          : hit.object.transform.position,
        offsetComparedToHitObject
      ),
      type
    );
  }

  removeBlockFromRayCast(camera: Camera, player: Player) {
    let ray = new Ray();
    ray.setStartAndDir(camera.getPosition(), camera.getDir());
    let hit = this.physicsScene.doRayCast(
      ray,
      true,
      [player.physicsObject],
      100.0
    );
    if (hit.object == undefined) {
      return;
    }

    if (
      !this.physicsObjectIdToAttachedBlocksKey.has(hit.object.physicsObjectId)
    ) {
      return;
    }

    this.removeBlock(
      this.physicsObjectIdToAttachedBlocksKey.get(hit.object.physicsObjectId)!
    );
  }

  removeBlock(key: string) {
    if (!this.attachedBlocks.has(key)) {
      return;
    }
    let block = this.attachedBlocks.get(key)!;
    if (block === this.baseBlock) {
      return;
    }
    this.physicsObjectIdToAttachedBlocksKey.delete(
      block.physicsObject.physicsObjectId
    );
    this.physicsScene.removePhysicsObject(block.physicsObject);
    this.scene.deleteGraphicsBundle(block.graphicsBundle);
    this.attachedBlocks.delete(key);
  }

  splitPlatform() {
    for (let block of this.attachedBlocks) {
      if (block[1] == undefined) {
        continue;
      }
      block[1]!.graphicsBundle.transform.position = vec3.transformMat4(
        vec3.create(),
        vec3.create(),
        block[1].graphicsBundle.transform.matrix
      );

      block[1]!.graphicsBundle.transform.rotation = mat4.getRotation(
        quat.create(),
        block[1]!.graphicsBundle.transform.matrix
      );
      block[1]!.graphicsBundle.transform.parentTransform = null!;

      block[1]!.physicsObject.isImmovable = false;
      vec3.set(
        block[1]!.physicsObject.impulse,
        Math.random(),
        Math.random(),
        Math.random()
      );
    }
    this.attachedBlocks.clear();
    this.physicsObjectIdToAttachedBlocksKey.clear();
    this.baseBlock = null!;
  }
}

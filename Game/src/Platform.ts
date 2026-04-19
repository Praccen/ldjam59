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
  SOLARPANEL,
}

const BlockTypeToColorMap = new Map<BlockType, string>([
  [BlockType.BASE, "Assets/textures/palette.png"],
  [BlockType.FLOOR, "Assets/textures/palette.png"],
  [BlockType.SOLARPANEL, "Assets/textures/palette.png"],
]);

const BlockTypeToMeshMap = new Map<BlockType, string>([
  [BlockType.BASE, "Assets/objs/spacebox.obj"],
  [BlockType.FLOOR, "Assets/objs/spacefloor.obj"],
  [BlockType.SOLARPANEL, "Assets/objs/spacesolar.obj"],
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
  getWorldPos(): vec3 {
    return vec3.transformMat4(
      vec3.create(),
      vec3.create(),
      this.graphicsBundle.transform.matrix,
    );
  }
  getWorldRot(): quat {
    return mat4.getRotation(
      quat.create(),
      this.graphicsBundle.transform.matrix,
    );
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
      this.addBlock(vec3.fromValues(1, 0, 0), BlockType.SOLARPANEL);
      this.addBlock(vec3.fromValues(-1, 0, 0), BlockType.SOLARPANEL);
      this.addBlock(vec3.fromValues(0, 0, 1), BlockType.SOLARPANEL);
      this.addBlock(vec3.fromValues(0, 0, -1), BlockType.SOLARPANEL);
      if (player) {
        player.setConnectedBlock(this.baseBlock, false);
      }
    });
  }

  resetWithNewBaseBlock(
    graphicsBundle: GraphicsBundle,
    physicsObject: PhysicsObject
  ) {
    this.attachedBlocks.clear();
    this.physicsObjectIdToAttachedBlocksKey.clear();
    this.baseBlock = new Block(graphicsBundle, physicsObject, BlockType.BASE);
    this.baseBlock.physicsObject.isImmovable = true;
    vec3.zero(this.baseBlock.physicsObject.impulse);
    vec3.zero(this.baseBlock.physicsObject.force);
    vec3.zero(this.baseBlock.physicsObject.velocity);

    this.attachedBlocks.set(vec3.create().toString(), this.baseBlock);
    this.physicsObjectIdToAttachedBlocksKey.set(
      physicsObject.physicsObjectId,
      vec3.create().toString()
    );
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
          BlockTypeToMeshMap.get(type)!,
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
      block[1]!.physicsObject.collisionCoefficient = 0.2;
      vec3.scale(
        block[1]!.physicsObject.impulse,
        vec3.fromValues(Math.random(), Math.random(), Math.random()),
        Math.random() * 25.0
      );
    }
    this.attachedBlocks.clear();
    this.physicsObjectIdToAttachedBlocksKey.clear();
    this.baseBlock = null!;
  }
}

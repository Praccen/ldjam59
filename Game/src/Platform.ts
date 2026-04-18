import {
  Camera,
  GraphicsBundle,
  mat4,
  MousePicking,
  PhysicsObject,
  PhysicsScene,
  Ray,
  Scene,
  vec3,
} from "praccen-web-engine";
import Player from "./Player";
export enum BlockType {
  NONE,
  FLOOR,
  TEST,
}

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
    this.attachedBlocks.set(vec3.create().toString(), undefined);

    this.scene
      .addNewMesh(
        "Assets/objs/cube.obj",
        "CSS:rgb(255, 0, 0)",
        "CSS:rgb(0,0,0)"
      )
      .then((gb) => {
        gb.transform.position = baseBlockStartingPosition;
        let physicsObject = this.physicsScene.addNewPhysicsObject(gb.transform);
        this.baseBlock = new Block(gb, physicsObject, BlockType.FLOOR);
        this.attachedBlocks.set(vec3.create().toString(), this.baseBlock);
        this.physicsObjectIdToAttachedBlocksKey.set(
          physicsObject.physicsObjectId,
          vec3.create().toString()
        );

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

  addBlock(offset: vec3, type: BlockType) {
    if (
      this.attachedBlocks.has(offset.toString()) ||
      this.baseBlock == undefined
    ) {
      return;
    }

    this.attachedBlocks.set(offset.toString(), undefined); // Reserve the spot
    this.scene
      .addNewMesh(
        "Assets/objs/cube.obj",
        "CSS:rgb(0, 255, 0)",
        "CSS:rgb(0,0,0)"
      )
      .then((gb) => {
        gb.transform.position = offset;
        gb.transform.parentTransform = this.baseBlock.graphicsBundle.transform;
        let physicsObject = this.physicsScene.addNewPhysicsObject(gb.transform);

        this.attachedBlocks.set(
          offset.toString(),
          new Block(gb, physicsObject, type)
        );
        this.physicsObjectIdToAttachedBlocksKey.set(
          physicsObject.physicsObjectId,
          offset.toString()
        );
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
}

import {
  GraphicsBundle,
  PhysicsObject,
  PhysicsScene,
  Scene,
  vec3,
} from "praccen-web-engine";
export enum BlockType {
  NONE,
  FLOOR,
  TEST,
}

class Block {
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
  private physicsObjectIdToAttachedBlocksKey: Map<number, string> = new Map<number, string>();

  constructor(
    scene: Scene,
    physicsScene: PhysicsScene,
    baseBlockStartingPosition: vec3
  ) {
    this.scene = scene;
    this.physicsScene = physicsScene;
    this.attachedBlocks.set(vec3.create().toString(), undefined);

    this.scene
      .addNewMesh(
        "Assets/objs/cube.obj",
        "CSS:rgb(255, 0, 0)",
        "CSS:rgb(0,0,0)",
        true
      )
      .then((gb) => {
        gb.transform.position = baseBlockStartingPosition;
        let physicsObject = this.physicsScene.addNewPhysicsObject(gb.transform);
        this.baseBlock = new Block(gb, physicsObject, BlockType.FLOOR);
        this.attachedBlocks.set(vec3.create().toString(), this.baseBlock);
        this.physicsObjectIdToAttachedBlocksKey.set(physicsObject.physicsObjectId, vec3.create().toString());

        this.addBlock(vec3.fromValues(1, 0, 0), BlockType.TEST);
        this.addBlock(vec3.fromValues(0, 0, 1), BlockType.TEST);
        this.addBlock(vec3.fromValues(0, 1, 1), BlockType.TEST);
      });
  }

  getBlockFromPhysicsObject(physicsObject: PhysicsObject): Block | undefined {
    if (!this.physicsObjectIdToAttachedBlocksKey.has(physicsObject.physicsObjectId)) {
        return undefined;
    }

    return this.attachedBlocks.get(this.physicsObjectIdToAttachedBlocksKey.get(physicsObject.physicsObjectId) ?? "");
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
        "CSS:rgb(0,0,0)",
        true
      )
      .then((gb) => {
        gb.transform.position = offset;
        gb.transform.parentTransform = this.baseBlock.graphicsBundle.transform;
        let physicsObject = this.physicsScene.addNewPhysicsObject(gb.transform);

        this.attachedBlocks.set(
          offset.toString(),
          new Block(gb, physicsObject, type)
        );
        this.physicsObjectIdToAttachedBlocksKey.set(physicsObject.physicsObjectId, offset.toString());
      });
  }

  removeBlock(offset: vec3) {
    if (!this.attachedBlocks.has(offset.toString())) {
        return;
    }
    let block = this.attachedBlocks.get(offset.toString())!;
    this.physicsObjectIdToAttachedBlocksKey.delete(block.physicsObject.physicsObjectId);
    this.physicsScene.removePhysicsObject(block.physicsObject);
    this.scene.deleteGraphicsBundle(block.graphicsBundle);
    this.attachedBlocks.delete(offset.toString());

  }
}

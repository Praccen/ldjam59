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
  ANTENNA1,
  ANTENNA2,
  ANTENNA3,
  EMPTY,
}

const BlockTypeToColorMap = new Map<BlockType, string>([
  [BlockType.BASE, "Assets/Textures/palette.png"],
  [BlockType.FLOOR, "Assets/Textures/palette.png"],
  [BlockType.SOLARPANEL, "Assets/Textures/palette.png"],
  [BlockType.ANTENNA1, "Assets/Textures/palette.png"],
  [BlockType.ANTENNA2, "Assets/Textures/palette.png"],
  [BlockType.ANTENNA3, "Assets/Textures/palette.png"],
  [BlockType.EMPTY, "CSS:rgba(0, 255, 0, 0.25)"],
]);

const BlockTypeToMeshMap = new Map<BlockType, string>([
  [BlockType.BASE, "Assets/objs/spacebox.obj"],
  [BlockType.FLOOR, "Assets/objs/spacefloor.obj"],
  [BlockType.SOLARPANEL, "Assets/objs/spacesolar.obj"],
  [BlockType.ANTENNA1, "Assets/objs/spaceantenna1.obj"],
  [BlockType.ANTENNA2, "Assets/objs/spaceantenna2.obj"],
  [BlockType.ANTENNA3, "Assets/objs/spaceantenna3.obj"],
  [BlockType.EMPTY, "Assets/objs/spacefloor.obj"],
]);

export function createStartingShip(
  platform: Platform,
  baseBlockStartingPosition: vec3,
  player?: Player
) {
  platform
    .addBlock(vec3.fromValues(0, 0, 0), BlockType.BASE)
    .then((baseBlock) => {
      baseBlock.graphicsBundle.transform.position = baseBlockStartingPosition;
      vec3.set(baseBlock.physicsObject.momentum, 2.0, 0.0, 0.0);

      platform.addBlock(vec3.fromValues(0, 1, 0), BlockType.FLOOR);
      platform.addBlock(vec3.fromValues(0, 2, 0), BlockType.FLOOR);
      platform.addBlock(vec3.fromValues(0, 3, 0), BlockType.FLOOR);
      platform.addBlock(vec3.fromValues(0, 4, 0), BlockType.BASE);

      platform.addBlock(vec3.fromValues(1, 4, 0), BlockType.SOLARPANEL);
      platform.addBlock(vec3.fromValues(2, 4, 0), BlockType.SOLARPANEL);

      platform.addBlock(vec3.fromValues(-1, 4, 0), BlockType.SOLARPANEL);
      platform.addBlock(vec3.fromValues(-2, 4, 0), BlockType.SOLARPANEL);

      platform
        .addBlock(vec3.fromValues(0, 4, 1), BlockType.SOLARPANEL)
        .then((block) => {
          quat.fromEuler(block.graphicsBundle.transform.rotation, 0, 0, 90);
        });
      platform
        .addBlock(vec3.fromValues(0, 4, 2), BlockType.SOLARPANEL)
        .then((block) => {
          quat.fromEuler(block.graphicsBundle.transform.rotation, 0, 0, 90);
        });

      platform.addBlock(vec3.fromValues(0, 4, -1), BlockType.SOLARPANEL);
      platform.addBlock(vec3.fromValues(0, 4, -2), BlockType.SOLARPANEL);

      platform.addBlock(vec3.fromValues(0, 5, 0), BlockType.ANTENNA1);
      platform.addBlock(vec3.fromValues(0, 6, 0), BlockType.ANTENNA2);
      platform.addBlock(vec3.fromValues(0, 7, 0), BlockType.ANTENNA3);

      platform.addBlock(vec3.fromValues(-1, 0, -1), BlockType.FLOOR);
      platform.addBlock(vec3.fromValues(0, 0, -1), BlockType.FLOOR);
      platform.addBlock(vec3.fromValues(1, 0, -1), BlockType.FLOOR);

      platform.addBlock(vec3.fromValues(1, 0, 0), BlockType.FLOOR);
      platform.addBlock(vec3.fromValues(-1, 0, 0), BlockType.FLOOR);

      platform
        .addBlock(vec3.fromValues(2, 0, 0), BlockType.ANTENNA3)
        .then((block) => {
          quat.fromEuler(block.graphicsBundle.transform.rotation, 90, 90, 0);
        });

      platform.addBlock(vec3.fromValues(-1, 0, 1), BlockType.FLOOR);
      platform.addBlock(vec3.fromValues(0, 0, 1), BlockType.FLOOR);
      platform.addBlock(vec3.fromValues(1, 0, 1), BlockType.FLOOR);

      platform.addBlock(vec3.fromValues(0, 0, 2), BlockType.FLOOR);
      platform.addBlock(vec3.fromValues(0, 0, 3), BlockType.FLOOR);
      platform
        .addBlock(vec3.fromValues(1, 1, 3), BlockType.EMPTY)
        .then((block) => {
          if (player) {
            player.setConnectedBlock(block, false);
          }
        });

      platform.addBlock(vec3.fromValues(1, 0, 3), BlockType.BASE);

      platform.addBlock(vec3.fromValues(0, -1, 0), BlockType.FLOOR);
      platform.addBlock(vec3.fromValues(0, -2, 0), BlockType.FLOOR);
      platform.addBlock(vec3.fromValues(0, -3, 0), BlockType.FLOOR);
      platform.addBlock(vec3.fromValues(0, -4, 0), BlockType.BASE);

      platform.addBlock(vec3.fromValues(1, -4, 0), BlockType.SOLARPANEL);
      platform.addBlock(vec3.fromValues(2, -4, 0), BlockType.SOLARPANEL);

      platform.addBlock(vec3.fromValues(-1, -4, 0), BlockType.SOLARPANEL);
      platform.addBlock(vec3.fromValues(-2, -4, 0), BlockType.SOLARPANEL);

      platform.addBlock(vec3.fromValues(0, -4, 1), BlockType.SOLARPANEL);
      platform.addBlock(vec3.fromValues(0, -4, 2), BlockType.SOLARPANEL);

      platform.addBlock(vec3.fromValues(0, -4, -1), BlockType.SOLARPANEL);
      platform.addBlock(vec3.fromValues(0, -4, -2), BlockType.SOLARPANEL);
    });
}

export function createDebrisShip(
  platform: Platform,
  baseBlockStartingPosition: vec3
) {
  platform
    .addBlock(vec3.fromValues(0, 0, 0), BlockType.BASE)
    .then((baseBlock) => {
      baseBlock.graphicsBundle.transform.position = baseBlockStartingPosition;
      baseBlock.physicsObject.drag = 0.0;
      vec3.set(baseBlock.physicsObject.momentum, 90.0, 56.0, 82.0);

      platform.addBlock(vec3.fromValues(0, 1, 0), BlockType.FLOOR);
      platform.addBlock(vec3.fromValues(0, 2, 0), BlockType.FLOOR);
      platform.addBlock(vec3.fromValues(0, 3, 0), BlockType.FLOOR);
      platform.addBlock(vec3.fromValues(0, 4, 0), BlockType.BASE);

      platform.addBlock(vec3.fromValues(1, 4, 0), BlockType.SOLARPANEL);
      platform.addBlock(vec3.fromValues(2, 4, 0), BlockType.SOLARPANEL);

      platform.addBlock(vec3.fromValues(-1, 4, 0), BlockType.SOLARPANEL);
      platform.addBlock(vec3.fromValues(-2, 4, 0), BlockType.SOLARPANEL);

      platform.addBlock(vec3.fromValues(0, 4, -1), BlockType.SOLARPANEL);
      platform.addBlock(vec3.fromValues(0, 4, -2), BlockType.SOLARPANEL);

      platform.addBlock(vec3.fromValues(0, 5, 0), BlockType.ANTENNA1);
      platform.addBlock(vec3.fromValues(0, 6, 0), BlockType.ANTENNA2);
      platform.addBlock(vec3.fromValues(0, 7, 0), BlockType.ANTENNA3);

      platform.addBlock(vec3.fromValues(-1, 0, -1), BlockType.FLOOR);
      platform.addBlock(vec3.fromValues(0, 0, -1), BlockType.FLOOR);
      platform.addBlock(vec3.fromValues(1, 0, -1), BlockType.FLOOR);

      platform.addBlock(vec3.fromValues(1, 0, 0), BlockType.FLOOR);
      platform.addBlock(vec3.fromValues(-1, 0, 0), BlockType.FLOOR);

      platform.addBlock(vec3.fromValues(-1, 0, 1), BlockType.FLOOR);
      platform.addBlock(vec3.fromValues(0, 0, 1), BlockType.FLOOR);
      platform.addBlock(vec3.fromValues(1, 0, 1), BlockType.FLOOR);

      platform.addBlock(vec3.fromValues(0, -1, 0), BlockType.FLOOR);
      platform.addBlock(vec3.fromValues(0, -2, 0), BlockType.FLOOR);
      platform.addBlock(vec3.fromValues(0, -3, 0), BlockType.FLOOR);
      platform.addBlock(vec3.fromValues(0, -4, 0), BlockType.BASE);

      platform.addBlock(vec3.fromValues(1, -4, 0), BlockType.SOLARPANEL);
      platform.addBlock(vec3.fromValues(2, -4, 0), BlockType.SOLARPANEL);

      platform.addBlock(vec3.fromValues(-1, -4, 0), BlockType.SOLARPANEL);
      platform.addBlock(vec3.fromValues(-2, -4, 0), BlockType.SOLARPANEL);

      platform.addBlock(vec3.fromValues(0, -4, 1), BlockType.SOLARPANEL);
      platform.addBlock(vec3.fromValues(0, -4, 2), BlockType.SOLARPANEL);

      platform.addBlock(vec3.fromValues(0, -4, -1), BlockType.SOLARPANEL);
      platform.addBlock(vec3.fromValues(0, -4, -2), BlockType.SOLARPANEL);
    });
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
  getWorldPos(): vec3 {
    return vec3.transformMat4(
      vec3.create(),
      vec3.create(),
      this.graphicsBundle.transform.matrix
    );
  }
  getWorldRot(): quat {
    return mat4.getRotation(
      quat.create(),
      this.graphicsBundle.transform.matrix
    );
  }
}

export class Platform {
  private scene: Scene;
  private physicsScene: PhysicsScene;
  private static readonly NEIGHBOR_OFFSETS: vec3[] = [
    vec3.fromValues(1, 0, 0),
    vec3.fromValues(-1, 0, 0),
    vec3.fromValues(0, 1, 0),
    vec3.fromValues(0, -1, 0),
    vec3.fromValues(0, 0, 1),
    vec3.fromValues(0, 0, -1),
  ];

  baseBlock: Block;
  private attachedBlocks: Map<string, Block | undefined> = new Map<
    string,
    Block
  >();
  private physicsObjectIdToAttachedBlocksKey: Map<number, string> = new Map<
    number,
    string
  >();

  constructor(scene: Scene, physicsScene: PhysicsScene) {
    this.scene = scene;
    this.physicsScene = physicsScene;
  }

  resetWithNewBaseBlock(player: Player, detachedBlocks: Block[]) {
    this.attachedBlocks.clear();
    this.physicsObjectIdToAttachedBlocksKey.clear();
    let closest = Infinity;
    let activeBlock = detachedBlocks[0];
    for (const block of detachedBlocks) {
      const sqrDist = vec3.sqrDist(
        block.getWorldPos(),
        player.physicsObject.transform.position
      );
      if (sqrDist < closest) {
        closest = sqrDist;
        activeBlock = block;
      }
    }

    this.baseBlock = activeBlock;
    player.setTetheredBlock(this.baseBlock);
    this.baseBlock.physicsObject.isImmovable = true;
    vec3.zero(this.baseBlock.physicsObject.impulse);
    vec3.zero(this.baseBlock.physicsObject.force);
    vec3.zero(this.baseBlock.physicsObject.velocity);

    this.attachedBlocks.set(vec3.create().toString(), this.baseBlock);
    this.physicsObjectIdToAttachedBlocksKey.set(
      activeBlock.physicsObject.physicsObjectId,
      vec3.create().toString()
    );

    // Add empty blocks around this block
    this.addBlock(vec3.fromValues(1, 0, 0), BlockType.EMPTY);
    this.addBlock(vec3.fromValues(-1, 0, 0), BlockType.EMPTY);
    this.addBlock(vec3.fromValues(0, 1, 0), BlockType.EMPTY);
    this.addBlock(vec3.fromValues(0, -1, 0), BlockType.EMPTY);
    this.addBlock(vec3.fromValues(0, 0, 1), BlockType.EMPTY);
    this.addBlock(vec3.fromValues(0, 0, -1), BlockType.EMPTY);
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
    if (this.attachedBlocks.has(offset.toString())) {
      // Replace if empty block
      if (
        type != BlockType.EMPTY &&
        this.attachedBlocks.get(offset.toString()).type == BlockType.EMPTY
      ) {
        this.removeBlock(offset.toString());
      } else {
        return null;
      }
    }

    return new Promise<Block>(async (resolve, reject) => {
      if (type != BlockType.EMPTY) {
        if (this.baseBlock == undefined) {
          type = BlockType.BASE;
          if (vec3.sqrLen(offset) > 0.0001) {
            reject("No base block in platform yet");
          }
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
          gb.emission = this.scene.renderer.textureStore.getTexture(
            "Assets/Textures/emissionpalette.png"
          );
          gb.transform.position = offset;
          if (this.baseBlock != undefined) {
            gb.transform.parentTransform =
              this.baseBlock.graphicsBundle.transform;
          }
          let physicsObject = this.physicsScene.addNewPhysicsObject(
            gb.transform
          );
          if (type == BlockType.EMPTY) {
            gb.enabled = false;
            physicsObject.isCollidable = false;
          }
          physicsObject.setupInternalTreeFromGraphicsObject(gb.graphicsObject);
          physicsObject.collisionCoefficient = 0.2;
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
      if (type != BlockType.EMPTY) {
        // Add empty blocks around this block
        this.addBlock(
          vec3.add(vec3.create(), offset, vec3.fromValues(1, 0, 0)),
          BlockType.EMPTY
        );
        this.addBlock(
          vec3.add(vec3.create(), offset, vec3.fromValues(-1, 0, 0)),
          BlockType.EMPTY
        );
        this.addBlock(
          vec3.add(vec3.create(), offset, vec3.fromValues(0, 1, 0)),
          BlockType.EMPTY
        );
        this.addBlock(
          vec3.add(vec3.create(), offset, vec3.fromValues(0, -1, 0)),
          BlockType.EMPTY
        );
        this.addBlock(
          vec3.add(vec3.create(), offset, vec3.fromValues(0, 0, 1)),
          BlockType.EMPTY
        );
        this.addBlock(
          vec3.add(vec3.create(), offset, vec3.fromValues(0, 0, -1)),
          BlockType.EMPTY
        );
      }
    });
  }

  placeBlockFromRayCast(
    type: BlockType,
    camera: Camera,
    player: Player
  ): boolean {
    const filtered = [...this.attachedBlocks.values()]
      .filter((block) => block.type != BlockType.EMPTY)
      .map((block) => block.physicsObject);

    let ray = new Ray();
    ray.setStartAndDir(camera.getPosition(), camera.getDir());
    let hit = this.physicsScene.doRayCast(
      ray,
      false,
      [player.physicsObject, player.connectedBlock?.physicsObject].concat(
        filtered
      ),
      100.0
    );
    if (hit.object == undefined) {
      return false;
    }

    if (
      !this.physicsObjectIdToAttachedBlocksKey.has(hit.object.physicsObjectId)
    ) {
      return false;
    }

    const key = this.physicsObjectIdToAttachedBlocksKey.get(
      hit.object.physicsObjectId
    );
    const [x, y, z] = key.split(",").map(Number);
    const offset = vec3.fromValues(x, y, z);
    this.addBlock(offset, type);
    return true;
  }

  showRemovableBlock(camera: Camera, player: Player) {
    // Ignore  empty blocks
    const filtered = [...this.attachedBlocks.values()]
      .filter((block) => block.type == BlockType.EMPTY)
      .map((block) => block.physicsObject);

    let ray = new Ray();
    ray.setStartAndDir(camera.getPosition(), camera.getDir());

    let ignoredObjects = [
      player.physicsObject,
      player.tetheredBlock.physicsObject,
    ].concat(filtered);

    // Find out if tethered block only has one real neighbor, if so do not remove it
    const neighbors = this.getNeighborBlocks(player.tetheredBlock).filter(
      (block) => block.type != BlockType.EMPTY
    );
    if (neighbors.length == 1) {
      ignoredObjects.push(neighbors.at(0).physicsObject);
    }
    let hit = this.physicsScene.doRayCast(ray, false, ignoredObjects, 2.0);
    if (hit.object == undefined) {
      return null;
    }
    let hitBlock = this.attachedBlocks.get(
      this.physicsObjectIdToAttachedBlocksKey.get(hit.object.physicsObjectId)!
    );

    hitBlock.graphicsBundle.diffuse =
      this.scene.renderer.textureStore.getTexture("CSS:rgba(255, 0, 0, 0.25)");

    // TODO do this in a better way?
    setTimeout(() => {
      hitBlock.graphicsBundle.diffuse =
        this.scene.renderer.textureStore.getTexture(
          BlockTypeToColorMap.get(hitBlock.type)!
        );
    }, 500);
  }

  showEmptyBlock(camera: Camera, player: Player) {
    // Ignore none empty blocks
    const filtered = [...this.attachedBlocks.values()]
      .filter((block) => block.type != BlockType.EMPTY)
      .map((block) => block.physicsObject);

    let ray = new Ray();
    ray.setStartAndDir(camera.getPosition(), camera.getDir());
    let hit = this.physicsScene.doRayCast(
      ray,
      false,
      [player.physicsObject, player.connectedBlock.physicsObject].concat(
        filtered
      ),
      2.0
    );
    if (hit.object == undefined) {
      return null;
    }
    let hitEmptyBlock = this.attachedBlocks.get(
      this.physicsObjectIdToAttachedBlocksKey.get(hit.object.physicsObjectId)!
    );
    hitEmptyBlock.graphicsBundle.enabled = true;

    // TODO do this in a better way
    setTimeout(() => {
      hitEmptyBlock.graphicsBundle.enabled = false;
    }, 500);
  }

  removeBlockFromRayCast(camera: Camera, player: Player): BlockType | null {
    // Ignore empty blocks
    const filtered = [...this.attachedBlocks.values()]
      .filter((block) => block.type == BlockType.EMPTY)
      .map((block) => block.physicsObject);

    let ray = new Ray();
    ray.setStartAndDir(camera.getPosition(), camera.getDir());

    let ignoredObjects = [
      player.physicsObject,
      player.tetheredBlock.physicsObject,
    ].concat(filtered);

    // Find out if tethered block only has one real neighbor, if so do not remove it
    const neighbors = this.getNeighborBlocks(player.tetheredBlock).filter(
      (block) => block.type != BlockType.EMPTY
    );
    if (neighbors.length == 1) {
      ignoredObjects.push(neighbors.at(0).physicsObject);
    }
    let hit = this.physicsScene.doRayCast(ray, false, ignoredObjects, 2.0);
    if (hit.object == undefined) {
      return null;
    }

    if (
      !this.physicsObjectIdToAttachedBlocksKey.has(hit.object.physicsObjectId)
    ) {
      return null;
    }

    let type = this.attachedBlocks.get(
      this.physicsObjectIdToAttachedBlocksKey.get(hit.object.physicsObjectId)!
    )!.type;

    if (
      this.removeBlock(
        this.physicsObjectIdToAttachedBlocksKey.get(hit.object.physicsObjectId)!
      )
    ) {
      return type;
    }

    return null;
  }

  removeBlock(key: string): boolean {
    if (!this.attachedBlocks.has(key)) {
      return false;
    }
    let block = this.attachedBlocks.get(key)!;
    if (block === this.baseBlock) {
      return false;
    }
    this.physicsObjectIdToAttachedBlocksKey.delete(
      block.physicsObject.physicsObjectId
    );
    this.physicsScene.removePhysicsObject(block.physicsObject);
    this.scene.deleteGraphicsBundle(block.graphicsBundle);
    this.attachedBlocks.delete(key);

    // Clean up orphaned empty blocks around the removed position
    if (block.type !== BlockType.EMPTY) {
      for (const neighbor of this.getNeighborBlocks(block)) {
        if (neighbor.type !== BlockType.EMPTY) {
          continue;
        }
        const neighborBlock = this.attachedBlocks.get(
          this.physicsObjectIdToAttachedBlocksKey.get(
            neighbor.physicsObject.physicsObjectId
          )
        );
        const hasRealNeighbor = this.getNeighborBlocks(neighborBlock).some(
          (block) => block.type !== BlockType.EMPTY
        );
        if (!hasRealNeighbor) {
          this.removeBlock(
            this.physicsObjectIdToAttachedBlocksKey.get(
              neighbor.physicsObject.physicsObjectId
            )
          );
        }
      }
    }

    if (block.type !== BlockType.EMPTY) {
      const [x, y, z] = key.split(",").map(Number);
      const offset = vec3.fromValues(x, y, z);
      this.addBlock(offset, BlockType.EMPTY);
    }

    return true;
  }

  getNeighborBlocks(block: Block): Block[] {
    const neighbors: Block[] = [];
    const neighborPos = vec3.create();

    for (const offset of Platform.NEIGHBOR_OFFSETS) {
      vec3.add(neighborPos, block.graphicsBundle.transform.position, offset);
      const neighbor = this.attachedBlocks.get(neighborPos.toString());
      if (neighbor) {
        neighbors.push(neighbor);
      }
    }

    return neighbors;
  }

  splitPlatform(detachedBlocks: Block[], pieceMass: number = 1.0) {
    for (let block of this.attachedBlocks) {
      if (block[1] == undefined) {
        continue;
      }

      if (block[1].type == BlockType.EMPTY) {
        this.physicsScene.removePhysicsObject(block[1].physicsObject);
        this.scene.deleteGraphicsBundle(block[1].graphicsBundle);
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
      block[1]!.physicsObject.mass = pieceMass;
      block[1]!.physicsObject.internalTree = null!;

      vec3.set(
        block[1]!.physicsObject.momentum,
        Math.random() * 20.0,
        Math.random() * 20.0,
        Math.random() * 20.0
      );

      vec3.copy(
        block[1]!.physicsObject.velocity,
        this.baseBlock.physicsObject.velocity
      );
      vec3.scale(
        block[1]!.physicsObject.impulse,
        vec3.fromValues(Math.random(), Math.random(), Math.random()),
        Math.random() * 25.0
      );
      detachedBlocks.push(block[1]!);
    }
    this.attachedBlocks.clear();
    this.physicsObjectIdToAttachedBlocksKey.clear();
    this.baseBlock = null!;
  }
}

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
  player?: Player,
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
  baseBlockStartingPosition: vec3,
) {
  platform
    .addBlock(vec3.fromValues(0, 0, 0), BlockType.BASE)
    .then((baseBlock) => {
      baseBlock.graphicsBundle.transform.position = baseBlockStartingPosition;
      baseBlock.physicsObject.drag = 0.0;
      vec3.set(baseBlock.physicsObject.momentum, 150.0, 56.0, 82.0);

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
    type: BlockType,
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
        player.physicsObject.transform.position,
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
      vec3.create().toString(),
    );

    // Add empty blocks around this block
    this.addBlock(vec3.fromValues(1, 0, 0), BlockType.EMPTY);
    this.addBlock(vec3.fromValues(-1, 0, 0), BlockType.EMPTY);
    this.addBlock(vec3.fromValues(0, 1, 0), BlockType.EMPTY).then((block) => {
      player.setConnectedBlock(block);
      player.physicsObject.velocity = vec3.create();
      player.physicsObject.impulse = vec3.create();
      player.physicsObject.force = vec3.create();
      // vec3.set(player.physicsObject.impulse, -5.0, 0.0, 0.0);
    });
    this.addBlock(vec3.fromValues(0, -1, 0), BlockType.EMPTY);
    this.addBlock(vec3.fromValues(0, 0, 1), BlockType.EMPTY);
    this.addBlock(vec3.fromValues(0, 0, -1), BlockType.EMPTY);
  }

  getBlockFromPhysicsObject(physicsObject: PhysicsObject): Block | undefined {
    if (
      !this.physicsObjectIdToAttachedBlocksKey.has(
        physicsObject.physicsObjectId,
      )
    ) {
      return undefined;
    }

    return this.getBlockAtOffset(
      this.physicsObjectIdToAttachedBlocksKey.get(
        physicsObject.physicsObjectId,
      ) ?? "",
    );
  }

  addBlock(offset: vec3, type: BlockType): Promise<Block> {
    if (this.attachedBlocks.has(offset.toString())) {
      // Replace if empty block
      if (
        type !== BlockType.EMPTY &&
        this.getBlockAtOffset(offset.toString()).type === BlockType.EMPTY
      ) {
        this.removeBlock(offset.toString());
      } else {
        return null;
      }
    }

    return new Promise<Block>(async (resolve, reject) => {
      if (type !== BlockType.EMPTY) {
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
          "CSS:rgb(0,0,0)",
        )
        .then((gb) => {
          gb.emission = this.scene.renderer.textureStore.getTexture(
            "Assets/Textures/emissionpalette.png",
          );
          gb.transform.position = offset;
          if (this.baseBlock != undefined) {
            gb.transform.parentTransform =
              this.baseBlock.graphicsBundle.transform;
          }
          let physicsObject = this.physicsScene.addNewPhysicsObject(
            gb.transform,
          );
          if (type === BlockType.EMPTY) {
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
            offset.toString(),
          );
          resolve(block);
        });
      if (type !== BlockType.EMPTY) {
        // Add empty blocks around this block
        this.addBlock(
          vec3.add(vec3.create(), offset, vec3.fromValues(1, 0, 0)),
          BlockType.EMPTY,
        );
        this.addBlock(
          vec3.add(vec3.create(), offset, vec3.fromValues(-1, 0, 0)),
          BlockType.EMPTY,
        );
        this.addBlock(
          vec3.add(vec3.create(), offset, vec3.fromValues(0, 1, 0)),
          BlockType.EMPTY,
        );
        this.addBlock(
          vec3.add(vec3.create(), offset, vec3.fromValues(0, -1, 0)),
          BlockType.EMPTY,
        );
        this.addBlock(
          vec3.add(vec3.create(), offset, vec3.fromValues(0, 0, 1)),
          BlockType.EMPTY,
        );
        this.addBlock(
          vec3.add(vec3.create(), offset, vec3.fromValues(0, 0, -1)),
          BlockType.EMPTY,
        );
      }
    });
  }

  raycastClosestBlock(
    camera: Camera,
    player: Player,
  ): { block: Block; key: string; offset: vec3; distance: number } | null {
    let ray = new Ray();
    ray.setStartAndDir(camera.getPosition(), camera.getDir());

    let ignoreList = [player.physicsObject];
    if (player.connectedBlock != null) {
      ignoreList.push(player.connectedBlock.physicsObject);
    }
    let hit = this.physicsScene.doRayCast(ray, false, ignoreList, 100.0);
    if (hit.object == undefined) {
      return null;
    }

    let key = this.physicsObjectIdToAttachedBlocksKey.get(
      hit.object.physicsObjectId,
    );
    if (key == undefined) {
      return null;
    }

    let block = this.getBlockAtOffset(key);
    if (block == undefined) {
      return null;
    }

    const [x, y, z] = key.split(",").map(Number);
    const offset = vec3.fromValues(x, y, z);

    return { block, key, offset, distance: hit.distance };
  }

  canRemoveBlock(block: Block, player: Player): boolean {
    if (block == player.tetheredBlock) {
      return false;
    }
    if (block == this.baseBlock) {
      return false;
    }
    if (player.tetheredBlock) {
      const neighbors = this.getNeighborBlocks(player.tetheredBlock).filter(
        (b) => b.type !== BlockType.EMPTY,
      );
      if (neighbors.length == 1 && neighbors[0] == block) {
        return false;
      }
    }
    return true;
  }

  highlightBlock(camera: Camera, player: Player) {
    let result = this.raycastClosestBlock(camera, player);
    if (result == null) {
      return;
    }

    let { block } = result;

    if (block.type == BlockType.EMPTY) {
      // Show empty block preview
      block.graphicsBundle.enabled = true;
      // TODO do this in a better way
      setTimeout(() => {
        block.graphicsBundle.enabled = false;
      }, 500);
    } else if (this.canRemoveBlock(block, player)) {
      // Show removable block preview
      block.graphicsBundle.diffuse =
        this.scene.renderer.textureStore.getTexture(
          "CSS:rgba(255, 0, 0, 0.25)",
        );
      // TODO do this in a better way?
      setTimeout(() => {
        block.graphicsBundle.diffuse =
          this.scene.renderer.textureStore.getTexture(
            BlockTypeToColorMap.get(block.type)!,
          );
      }, 500);
    }
  }

  removeBlock(key: string): boolean {
    if (!this.attachedBlocks.has(key)) {
      return false;
    }
    let block = this.getBlockAtOffset(key)!;
    if (block === this.baseBlock) {
      return false;
    }
    this.physicsObjectIdToAttachedBlocksKey.delete(
      block.physicsObject.physicsObjectId,
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
        const neighborBlock = this.getBlockAtOffset(
          this.physicsObjectIdToAttachedBlocksKey.get(
            neighbor.physicsObject.physicsObjectId,
          ),
        );
        const hasRealNeighbor = this.getNeighborBlocks(neighborBlock).some(
          (block) => block.type !== BlockType.EMPTY,
        );
        if (!hasRealNeighbor) {
          this.removeBlock(
            this.physicsObjectIdToAttachedBlocksKey.get(
              neighbor.physicsObject.physicsObjectId,
            ),
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

  getBlockAtOffset(offset: string): Block | undefined {
    return this.attachedBlocks.get(offset);
  }

  getNeighborBlocks(block: Block): Block[] {
    const neighbors: Block[] = [];
    const neighborPos = vec3.create();

    for (const offset of Platform.NEIGHBOR_OFFSETS) {
      vec3.add(neighborPos, block.graphicsBundle.transform.position, offset);
      const neighbor = this.getBlockAtOffset(neighborPos.toString());
      if (neighbor) {
        neighbors.push(neighbor);
      }
    }

    return neighbors;
  }

  hasAntennaComplete(): boolean {
    const antenna1Blocks: Block[] = [];
    const antenna2Blocks: Block[] = [];
    const antenna3Blocks: Block[] = [];
    for (const block of this.attachedBlocks.values()) {
      if (!block) continue;
      if (block.type === BlockType.ANTENNA1) antenna1Blocks.push(block);
      if (block.type === BlockType.ANTENNA2) antenna2Blocks.push(block);
      if (block.type === BlockType.ANTENNA3) antenna3Blocks.push(block);
    }

    // Check for a valid chain
    for (const a1 of antenna1Blocks) {
      const a1Neighbors = this.getNeighborBlocks(a1);
      for (const a2 of antenna2Blocks) {
        if (!a1Neighbors.includes(a2)) continue;
        const a2Neighbors = this.getNeighborBlocks(a2);
        for (const a3 of antenna3Blocks) {
          if (a2Neighbors.includes(a3)) return true;
        }
      }
    }

    return false;
  }

  splitPlatform(
    detachedBlocks: Block[],
    pieceMass: number = 1.0,
    explosionAmplitude: number = 100.0,
  ) {
    for (let block of this.attachedBlocks) {
      if (block[1] == undefined) {
        continue;
      }

      if (block[1].type === BlockType.EMPTY) {
        this.physicsScene.removePhysicsObject(block[1].physicsObject);
        this.scene.deleteGraphicsBundle(block[1].graphicsBundle);
        continue;
      }

      block[1]!.graphicsBundle.transform.position = vec3.transformMat4(
        vec3.create(),
        vec3.create(),
        block[1].graphicsBundle.transform.matrix,
      );

      block[1]!.graphicsBundle.transform.rotation = mat4.getRotation(
        quat.create(),
        block[1]!.graphicsBundle.transform.matrix,
      );
      block[1]!.graphicsBundle.transform.parentTransform = null!;

      block[1]!.physicsObject.isImmovable = true;
      block[1]!.physicsObject.mass = pieceMass;
      block[1]!.physicsObject.internalTree = null!;

      vec3.set(
        block[1]!.physicsObject.momentum,
        Math.random() * 20.0,
        Math.random() * 20.0,
        Math.random() * 20.0,
      );

      vec3.copy(
        block[1]!.physicsObject.velocity,
        this.baseBlock.physicsObject.velocity,
      );
      vec3.scale(
        block[1]!.physicsObject.impulse,
        vec3.fromValues(Math.random(), Math.random(), Math.random()),
        Math.random() * 800.0,
      );
      detachedBlocks.push(block[1]!);
    }
    this.attachedBlocks.clear();
    this.physicsObjectIdToAttachedBlocksKey.clear();
    this.baseBlock = null!;
  }
}

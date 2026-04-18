import { vec2, vec3 } from "gl-matrix";
import { Camera, PhysicsObject, PhysicsScene } from "praccen-web-engine";
import { Input } from "./Input";

const acceleration: number = 20.0;
const jumpForce: number = 15.0;
const sensitivity: number = 0.4;

export default class Player {
  physicsObject: PhysicsObject;

  mouseMovement: vec2 = vec2.create();

  pitch: number = 0.0;
  jaw: number = 0.0;

  private mouseWasClicked: boolean = false;

  constructor(physicsScene: PhysicsScene) {
    this.physicsObject = physicsScene.addNewPhysicsObject();
    vec3.set(this.physicsObject.transform.scale, 1.0, 2.0, 1.0);
    vec3.set(this.physicsObject.transform.origin, 0.0, -0.5, 0.0);
    vec3.set(this.physicsObject.transform.position, 0.0, 1.0, 0.0);
    this.physicsObject.drag = 2.0;

    Input.mouseMoveCallBack = (event: MouseEvent) => {
      let movX = event.movementX;
      let movY = event.movementY;

      if (Math.abs(movX) > window.innerWidth * 0.3) {
        movX = 0.0;
      }

      if (Math.abs(movY) > window.innerHeight * 0.3) {
        movY = 0.0;
      }

      this.mouseMovement[0] += movX;
      this.mouseMovement[1] += movY;
    };
  }

  update(dt: number, camera: Camera) {
    // Rotate camera with mouse
    let mouseDiff = Input.getMouseMovement();
    if (document.pointerLockElement == document.body) {
      this.pitch -= mouseDiff[1] * sensitivity;
      this.jaw -= mouseDiff[0] * sensitivity;

      this.pitch = Math.max(Math.min(this.pitch, 89), -89); // Don't allow the camera to go past 89 degrees
      this.jaw = this.jaw % 360;
    }

    camera.setPitchJawDegrees(this.pitch, this.jaw);

    // vec3.scaleAndAdd(this.physicsObject.force, this.physicsObject.force, camera.getDir(), acceleration);

    // if (Input.mouseClicked || Input.mouseRightClicked) {
    //     if (!this.mouseWasClicked) {
    //         vec3.scaleAndAdd(this.physicsObject.impulse, this.physicsObject.impulse, vec3.fromValues(0.0, 1.0, 0.0), jumpForce);
    //     }
    //     this.mouseWasClicked = true;
    // }
    // else {
    //     this.mouseWasClicked = false;
    // }

    camera.setPosition(
      vec3.add(
        vec3.create(),
        this.physicsObject.transform.position,
        vec3.fromValues(0.0, 1.8, 0.0)
      )
    );
  }
}

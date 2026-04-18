import {
  GUIRenderer,
  TextObject2D,
  TextObject3D,
  Slider,
  Checkbox,
  Button,
  Div,
} from "praccen-web-engine";

export default class MetaGUI {
  metaGuiDiv: Div;
  fpsDisplay: TextObject2D;
  cameraFollowCheckbox: Checkbox;
  volumetricLightingCheckbox: Checkbox;
  sensitivitySlider: Slider;
  volumetricRenderScaleSlider: Slider;
  volumetricBlurCheckbox: Checkbox;
  densitySlider: Slider;
  ambientSlider: Slider;
  constructor(guiRenderer: GUIRenderer) {
    this.metaGuiDiv = guiRenderer.getNewDiv();
    this.metaGuiDiv.getElement().style.width = "100%";
    this.metaGuiDiv.getElement().style.height = "100%";

    // Add an FPS display
    this.fpsDisplay = guiRenderer.getNew2DText(this.metaGuiDiv);
    this.fpsDisplay.position[0] = 0.95;
    this.fpsDisplay.getElement().style.color = "lime";
    this.fpsDisplay.textString = "0";
    this.fpsDisplay.getElement().style.zIndex = "1";
  }
}

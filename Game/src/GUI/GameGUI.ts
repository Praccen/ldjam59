import {
    GUIRenderer,
    TextObject2D,
    TextObject3D,
    Slider,
    Checkbox,
    Button,
    Div,
} from "praccen-web-engine";

export default class GameGUI {
    gameGuiDiv: Div;
    constructor(guiRenderer: GUIRenderer) {
        this.gameGuiDiv = guiRenderer.getNewDiv();
        this.gameGuiDiv.getElement().style.width = "100%";
        this.gameGuiDiv.getElement().style.height = "100%";

        let crosshair = guiRenderer.getNew2DText(this.gameGuiDiv);
        crosshair.position[0] = 0.5;
        crosshair.position[1] = 0.5;
        crosshair.textString = "+";
        crosshair.getElement().style.color = "white";
        crosshair.getElement().style.zIndex = "1";
        crosshair.center = true;
    }
}

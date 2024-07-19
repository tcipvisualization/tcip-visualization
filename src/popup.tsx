import ReactDOM from "react-dom/client";
import ProjectsPopup from "./ProjectsPopup.tsx";
import Point from "@arcgis/core/geometry/Point";
import Graphic from "@arcgis/core/Graphic";

export const setPopupTitle = (features: Graphic[], mapPoint: Point) => {
    if (features.length === 1) {
        return features[0].attributes["project"];
    }

    return "Projects near (" + mapPoint.latitude.toFixed(4) + ", " + mapPoint.longitude.toFixed(4) + ")";
}


const createPopupUI = (features: Graphic[]) => {
    const element = document.createElement("div");
    // create root
    ReactDOM.createRoot(element).render(<ProjectsPopup features={features}/>);
    return element;
}

export default createPopupUI;
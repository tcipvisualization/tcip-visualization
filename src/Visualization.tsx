import {ArcgisLegend, ArcgisMap, ArcgisSearch} from "@arcgis/map-components-react";
import {useEffect, useRef} from "react";
import {ArcgisMapCustomEvent, ArcGISMapView} from "@arcgis/map-components";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import createPopupUI, {setPopupTitle} from "./popup.tsx";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet";
import Graphic from "@arcgis/core/Graphic";
import FeatureLayerView from "@arcgis/core/views/layers/FeatureLayerView";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import {useMapStore, useProjectsTable} from "./store.ts";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import Color from "@arcgis/core/Color";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import ColorVariable from "@arcgis/core/renderers/visualVariables/ColorVariable";
import ReactDOM from "react-dom/client";
import Legend from "./Legend.tsx";
import Filters from "./Filters.tsx";
import {MantineProvider} from "@mantine/core";
import ViewLayerviewCreateEvent = __esri.ViewLayerviewCreateEvent;
import ViewClickEvent = __esri.ViewClickEvent;
import ViewHit = __esri.ViewHit;
import GraphicHit = __esri.GraphicHit;
import Fullscreen from "@arcgis/core/widgets/Fullscreen";

const MAP_ID = "916dd2c5913f42f0b164bb959e963ce0";

const displayPopup = async (mapView: ArcGISMapView, hits: ViewHit[], pointsLayer: FeatureLayer, linesLayer: FeatureLayer) => {
    if (hits.length === 0) {
        return;
    }

    const pointObjectIDs: number[] = [];
    const lineObjectIDs: number[] = [];

    for (const hit of hits) {
        if (hit.type != "graphic") {
            continue;
        }

        const graphicHit = hit as GraphicHit;
        const objectID = graphicHit.graphic.attributes.objectid;

        if (!objectID) {
            continue;
        }

        if (hit.layer === pointsLayer) {
            pointObjectIDs.push(objectID);
        }

        if (hit.layer === linesLayer) {
            lineObjectIDs.push(objectID);
        }
    }

    // Query the points layer
    const pointQuery = pointsLayer.createQuery();
    pointQuery.objectIds = pointObjectIDs;

    const lineQuery = linesLayer.createQuery();
    lineQuery.objectIds = lineObjectIDs;

    let pointResults: FeatureSet | null = null;
    if (pointObjectIDs.length > 0) {
        pointResults = await pointsLayer.queryFeatures(pointQuery);
    }
    let lineResults: FeatureSet | null = null;
    if (lineObjectIDs.length > 0) {
        lineResults = await linesLayer.queryFeatures(lineQuery);
    }

    if ((pointResults && pointResults.features.length) === 0 && (lineResults && lineResults.features.length === 0)) {
        return;
    }

    let features: Graphic[] = [];
    if (pointResults) {
        features = features.concat(pointResults.features);
    }

    if (lineResults) {
        features = features.concat(lineResults.features);
    }

    const hitPoint = hits[0].mapPoint;

    await mapView.openPopup({
        // Set the popup's title to the coordinates of the clicked location
        title: setPopupTitle(features, hitPoint),
        content: createPopupUI(features),
        location: hitPoint
    });

    // Highlight the selected features
    const pointLayerView: FeatureLayerView = await mapView.whenLayerView(pointsLayer);
    const pointHighlight = pointLayerView.highlight(pointObjectIDs);

    const lineLayerView: FeatureLayerView = await mapView.whenLayerView(linesLayer);
    const lineHighlight = lineLayerView.highlight(lineObjectIDs);

    // on close, remove the highlight
    await reactiveUtils.whenOnce(() => !mapView.popup.visible);
    pointHighlight.remove();
    lineHighlight.remove();
}

interface VisualizationProps {
    height: string;
}

const Visualization = ({height}: VisualizationProps) => {
    const mapRef = useRef<HTMLArcgisMapElement>(null);

    const layers = useMapStore((state) => state.layers);
    const pointsLayer = layers.has("CIP Points") ? layers.get("CIP Points") as FeatureLayer : undefined;
    const linesLayer = layers.has("CIP Lines") ? layers.get("CIP Lines") as FeatureLayer : undefined;
    const projectsTable = useProjectsTable();

    const addLayer = useMapStore((state) => state.addLayer);
    const removeLayer = useMapStore((state) => state.removeLayer);

    useEffect(() => {
        if (pointsLayer && projectsTable) {
            pointsLayer.popupEnabled = false;
        }
        if (linesLayer && projectsTable) {
            linesLayer.popupEnabled = false;
        }
    }, [pointsLayer, linesLayer, projectsTable]);

    const onClickMap = (event: ArcgisMapCustomEvent<ViewClickEvent>) => {
        if (pointsLayer && linesLayer && mapRef.current) {
            mapRef.current.view.hitTest(event.detail, {include: [linesLayer, pointsLayer]}).then((response) => {
                // if (response.results.length > 2)
                // {
                //     console.log(response.results[2].layer.title);
                // }
                displayPopup(mapRef.current!.view, response.results, pointsLayer, linesLayer).then();
            });
        }
    }

    useEffect(() => {
        if (!linesLayer) {
            return;
        }

        const colorCoding = new ColorVariable({
            valueExpression: `
                 if ($feature.summary_category == "grow") {
                      return 1;
                 }
                 else if ($feature.summary_category == "modernize") {
                      return 2;
                 }
                 else if ($feature.summary_category == "maintain") {
                      return 3;
                 } else {
                      return 4;
                 }
           `
            ,
            stops: [
                {value: 1, color: new Color("#00ff00")},
                {value: 2, color: new Color("#ff8800")},
                {value: 3, color: new Color("#ffdd00")},
                {value: 4, color: new Color("#ff00ff")}
            ],
            legendOptions: {
                title: "Color Coding",
                showLegend: false
            }
        });


        linesLayer.renderer = new SimpleRenderer({
            symbol: new SimpleLineSymbol(
                {
                    color: new Color("#b45af1"),
                    width: 3
                }
            ),
            visualVariables: [colorCoding]
        });
    }, [linesLayer]);

    const onReady = () => {
        if (!mapRef.current) {
            return;
        }

        mapRef.current.view.map.tables.forEach((table) => {
            addLayer(table);
        });

        const ui = mapRef.current.view.ui;
        const bottomLeft = ui.getComponents("bottom-left");
        // if (bottomLeft.length > 0) {
        //     // remove the default legend
        //     ui.remove(bottomLeft[0]);
        // }
        // remove all components in the bottom left
        bottomLeft.forEach((component) => {
            ui.remove(component);
        });

        // add a legend
        {
            const element = document.createElement("div");
            ui.add(element, "bottom-left");

            ReactDOM.createRoot(element).render(<Legend/>);
        }
        // add filters on the right side
        {
            const element = document.createElement("div");
            ui.add(element, "bottom-right");

            ReactDOM.createRoot(element).render(
                <MantineProvider>
                    <Filters/>
                </MantineProvider>
            );
        }

        // add full screen button
        {
            const fullscreen = new Fullscreen({
                view: mapRef.current.view
            });

            mapRef.current.view.ui.add(fullscreen, "top-left");
        }


    }

    return (
        <div style={{height: height, width: "100%"}}>
            <ArcgisMap
                itemId={MAP_ID}
                onArcgisViewLayerviewCreate={(event: ArcgisMapCustomEvent<ViewLayerviewCreateEvent>) => {
                    // if (event.detail.layer.title === "CIP Points" && mapRef.current) {
                    //     const layer = event.detail.layer as FeatureLayer;
                    //     layer.popupEnabled = false;
                    //     setPointsLayer(layer);
                    // }
                    //
                    // if (event.detail.layer.title === "CIP Lines" && mapRef.current) {
                    //     const layer = event.detail.layer as FeatureLayer;
                    //     layer.popupEnabled = false;
                    //     setLinesLayer(layer);
                    // }
                    addLayer(event.detail.layer);
                }}
                onArcgisViewLayerviewDestroy={(event: ArcgisMapCustomEvent<ViewLayerviewCreateEvent>) => {
                    removeLayer(event.detail.layer);
                }}
                onArcgisViewReadyChange={onReady}
                onArcgisViewClick={onClickMap}
                ref={mapRef}
            >
                <ArcgisSearch position="top-right"></ArcgisSearch>
                <ArcgisLegend position="bottom-left"></ArcgisLegend>
            </ArcgisMap>
        </div>
    );
}

export default Visualization;
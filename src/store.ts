import Layer from "@arcgis/core/layers/Layer";
import {create} from "zustand";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

interface MapStore {
    layers: Map<string, Layer>;
    addLayer: (layer: Layer) => void;
    removeLayer: (layer: Layer) => void;
}

export const useMapStore = create<MapStore>()((set) => ({
    layers: new Map<string, Layer>(),
    addLayer: (layer: Layer) => {
        set((state) => {
            const newLayers = new Map(state.layers);
            newLayers.set(layer.title, layer);
            return {layers: newLayers};
        });
    },

    removeLayer: (layer: Layer) => {
        set((state) => {
            const newLayers = new Map(state.layers);
            newLayers.delete(layer.title);
            return {layers: newLayers};
        });
    },
}));

export const useFinancesTable = () => {
    return useMapStore(state => state.layers.get("CIP Finances") as FeatureLayer | undefined);
}

export const useProjectsTable = () => {
    return useMapStore(state => state.layers.get("CIP Projects") as FeatureLayer | undefined);
}
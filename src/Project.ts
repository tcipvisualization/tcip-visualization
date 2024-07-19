import Graphic from "@arcgis/core/Graphic";

interface Project {
    id: number;
    project: string;
    jurisdiction?: string;
    project_category?: string;
    summary_category?: string;
    mode?: string;
    current_fy_category?: string;
    next_fy_category?: string;
    asset_category_1?: string;
    asset_category_2?: string;
    asset_category_3?: string;
    estimated_total_cost?: number;
    year_source_cost_estimate?: number;
    notes?: string;
    project_charter?: string;
    plan_alignment_score?: number;
    staff_resources_score?: number;
    realities_score?: number;
}

// eslint-disable-next-line
export const isProject = (obj: any): obj is Project => {
    return obj.id !== undefined && obj.project !== undefined;
}

const randomID = () => Math.floor(Math.random() * 1000000);

export const convertGraphicToProject = (graphic: Graphic): Project => {
    // cast attributes to Project if possible
    const attributes = graphic.attributes;
    if (isProject(attributes)) {
        return attributes;
    }

    return {id: randomID(), project: "Unknown"};
}

export default Project;
import styles from './Filters.module.scss';
import {Button, Menu, MultiSelect} from "@mantine/core";
import {upperFirstLetterWithoutUnderscores} from "./utils.ts";
import {useDisclosure} from "@mantine/hooks";
import {useEffect, useState} from "react";
import {useMapStore, useProjectsTable} from "./store.ts";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

const projectKeys = [
    "jurisdiction",
    "project_category",
    "summary_category",
    "mode",
    "current_fy_category",
    "next_fy_category",
    "asset_category_1",
];

const projectKeysDisplayed = [
    "Jurisdiction",
    "Project Category",
    "Summary Category",
    "Mode",
    "Current Fiscal Year Category",
    "Next Fiscal Year Category",
    "Primary Asset Category",
];

const getFiltersString = (filters: Map<string, string[]>) => {
    let filterString = "";
    for (const [key, values] of filters.entries()) {
        if (values.length === 0) {
            continue;
        }
        const valuesString = values.map((value) => `'${value}'`).join(",");
        filterString += `${key} NOT IN (${valuesString}) AND `;
    }

    return filterString.slice(0, -5);
}

const Filters = () => {

    const [opened, {open, close}] = useDisclosure();
    const [possibleValues, setPossibleValues] = useState<Map<string, string[]>>(new Map<string, string[]>());

    const layers = useMapStore((state) => state.layers);
    const pointsLayer = layers.has("CIP Points") ? layers.get("CIP Points") as FeatureLayer : null;
    const linesLayer = layers.has("CIP Lines") ? layers.get("CIP Lines") as FeatureLayer : null;

    const [filters, setFilters] = useState<Map<string, string[]>>(new Map<string, string[]>());
    useEffect(() => {
        const initialFilters = new Map<string, string[]>();
        initialFilters.set("current_fy_category", ["completed"]);

        setFilters(initialFilters);
    }, []);

    const filterString = getFiltersString(filters);

    useEffect(() => {
        if (pointsLayer) {
            pointsLayer.definitionExpression = filterString;
        }
        if (linesLayer) {
            linesLayer.definitionExpression = filterString;
        }
    }, [filterString, pointsLayer, linesLayer]);

    const projectsTable = useProjectsTable();
    useEffect(() => {
        if (!projectsTable) {
            return;
        }

        for (const key of projectKeys) {
            const query = projectsTable.createQuery();
            query.outFields = [key];
            query.returnDistinctValues = true;
            // filter out null values
            query.where = `${key} IS NOT NULL`;
            projectsTable.queryFeatures(query).then((result) => {
                const values = result.features.map((feature) => feature.attributes[key]);
                setPossibleValues((prev) => {
                    prev.set(key, values);
                    return prev;
                });
            });
        }

    }, [projectsTable]);

    return (
        <div className={styles.filters}>
            <Menu opened={opened} position="top">
                <Menu.Target>
                    <Button onClick={opened ? close : open} className={styles.filterButton}
                            variant="light">Filters</Button>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Label>
                        Options
                    </Menu.Label>
                    {
                        projectKeys.map((key, i) => {
                            if (!filters.has(key)) {
                                filters.set(key, []);
                            }

                            const displayKey = projectKeysDisplayed[i];

                            return (
                                <Menu.Item key={key}>
                                    <MultiSelect label={upperFirstLetterWithoutUnderscores(displayKey)}
                                                 data={possibleValues.get(key) || []}
                                                 value={filters.get(key)}
                                                 onChange={(value) => {
                                                     const newFilters = new Map(filters);
                                                     newFilters.set(key, value);
                                                     setFilters(newFilters);
                                                 }}
                                                 placeholder={"Ignored values"}/>
                                </Menu.Item>
                            )
                        })
                    }
                </Menu.Dropdown>
            </Menu>
        </div>
    )
}

export default Filters;
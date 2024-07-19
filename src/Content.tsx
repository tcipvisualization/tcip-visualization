import styles from "./Content.module.scss";
import MapSection from "./MapSection.tsx";
import {useFinancesTable, useProjectsTable} from "./store.ts";
import {useEffect, useState} from "react";
import StatisticDefinition from "@arcgis/core/rest/support/StatisticDefinition";
import {Checkbox, Table, Text} from "@mantine/core";
import {fieldText, formatDollar, upperFirstLetterOfWords} from "./utils.ts";
import Project, {convertGraphicToProject} from "./Project.ts";
import ProjectModal from "./ProjectModal.tsx";

interface FinanceTotals {
    year: number;
    local_sum: number;
    other_sum: number;
}

const Content = () => {

    const financesTable = useFinancesTable();
    const projectsTable = useProjectsTable();

    const [financeTotals, setFinanceTotals] = useState<FinanceTotals[]>([]);
    const [projectTotals, setProjectTotals] = useState<Map<string, Map<string, number>>>(new Map());
    const [highScoringProjects, setHighScoringProjects] = useState<Project[]>([]);
    const [highScoringProjectOpen, setHighScoringProjectOpen] = useState<number | null>(null);

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        if (financesTable) {
            const query = financesTable.createQuery();
            query.where = `year >= ${currentYear}`;
            // group by year
            query.groupByFieldsForStatistics = ["year"];
            // sum local and other
            query.outStatistics = [
                new StatisticDefinition({
                    onStatisticField: "local",
                    outStatisticFieldName: "local_sum",
                    statisticType: "sum"
                }),
                new StatisticDefinition({
                    onStatisticField: "other",
                    outStatisticFieldName: "other_sum",
                    statisticType: "sum"
                })
            ];
            // order by year
            query.orderByFields = ["year"];

            financesTable.queryFeatures(query).then((result) => {
                setFinanceTotals(result.features.map((feature) => {
                    return {
                        year: feature.attributes.year,
                        local_sum: feature.attributes.local_sum,
                        other_sum: feature.attributes.other_sum
                    }
                }));
            });
        }
    }, [financesTable]);

    useEffect(() => {
        if (projectsTable) {
            {
                // const query = projectsTable.createQuery();
                // query.where = "project_category IS NOT NULL AND summary_category IS NOT NULL";
                // query.groupByFieldsForStatistics = ["project_category", "summary_category"];
                //
                // // count the number of projects
                // query.outStatistics = [
                //     new StatisticDefinition({
                //         onStatisticField: "project_category",
                //         outStatisticFieldName: "count",
                //         statisticType: "count"
                //     })
                // ];
                //
                // projectsTable.queryFeatures(query).then((result) => {
                //     setProjectTotals(result.features.map((feature) => {
                //         return {
                //             project_category: feature.attributes.project_category,
                //             summary_category: feature.attributes.summary_category,
                //             count: feature.attributes.count
                //         }
                //     }));
                // });

                const query = projectsTable.createQuery();
                query.where = "project_category IS NOT NULL AND summary_category IS NOT NULL";

                projectsTable.queryFeatures(query).then((result) => {
                    const projectTotalsMap: Map<string, Map<string, number>> = new Map();
                    result.features.forEach((feature) => {
                        const mode = feature.attributes.mode;
                        const summaryCategory = feature.attributes.summary_category;
                        if (!projectTotalsMap.has(summaryCategory)) {
                            projectTotalsMap.set(summaryCategory, new Map<string, number>());
                        }

                        const projectMap = projectTotalsMap.get(summaryCategory)!;
                        if (!projectMap.has(mode)) {
                            projectMap.set(mode, 0);
                        }

                        projectMap.set(mode, projectMap.get(mode)! + 1);
                    });

                    setProjectTotals(projectTotalsMap);
                });
            }

            // get high scoring projects
            {
                const query = projectsTable.createQuery();
                query.where = "(plan_alignment_score + staff_resources_score + realities_score) > 5";
                // sort by project
                query.orderByFields = ["project"];
                projectsTable.queryFeatures(query).then((result) => {
                    setHighScoringProjects(result.features.map((feature) => convertGraphicToProject(feature)));
                });
            }
        }
    }, [projectsTable]);

    const columns = Array.from(projectTotals.keys());
    const rowsMap: Set<string> = new Set();
    projectTotals.forEach((value) => {
        value.forEach((_, key) => {
            rowsMap.add(key);
        });
    });

    const rows = Array.from(rowsMap);


    return (
        <>
            <MapSection/>

            <section className={styles.second} id="analysis">
                <div className={styles.analysis}>
                    <h1 className={styles.analysisHeader}>Analysis</h1>
                    <hr className={styles.divider}/>

                    <p>Below are some metrics that may be useful in project planning and analysis.</p>

                    <div className={styles.analysisItem}>
                        <div className={styles.analysisItemHeader}> Item 1 - <i>Anticipated Expenditures by Year</i>
                        </div>
                        <Table title={"Anticipated Expenditures by Year"} className={styles.financeTable}>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Year</Table.Th>
                                    <Table.Th>Local Funding</Table.Th>
                                    <Table.Th>Other Funding</Table.Th>
                                    <Table.Th>Total</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {financeTotals.map((total) => {
                                    return (
                                        <Table.Tr key={total.year}>
                                            <Table.Td>{total.year}</Table.Td>
                                            <Table.Td>{formatDollar(total.local_sum)}</Table.Td>
                                            <Table.Td>{formatDollar(total.other_sum)}</Table.Td>
                                            <Table.Td>{formatDollar(total.local_sum + total.other_sum)}</Table.Td>
                                        </Table.Tr>
                                    );
                                })}
                            </Table.Tbody>
                        </Table>
                    </div>

                    {/* cross table of project mode and summary category */}
                    <div className={styles.analysisItem}>
                        <div className={styles.analysisItemHeader}> Item 2 - <i>Number of Projects by Categories</i>
                        </div>
                        <Table title={"Projects by Categories"} className={styles.financeTable}>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th key={"category"}>Project Mode</Table.Th>

                                    {columns.map((column) => {
                                            return <Table.Th key={column}>{upperFirstLetterOfWords(column)}</Table.Th>
                                        }
                                    )}
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {rows.map((row) => {
                                    return (
                                        <Table.Tr key={row}>
                                            <Table.Td key={row}>{upperFirstLetterOfWords(row)}</Table.Td>
                                            {columns.map((column) => {
                                                return (
                                                    <Table.Td key={row + column}>
                                                        {projectTotals.get(column)?.get(row) || 0}
                                                    </Table.Td>
                                                );
                                            })}
                                        </Table.Tr>
                                    );
                                })}

                            </Table.Tbody>
                        </Table>
                    </div>

                    <div className={styles.analysisItem}>
                        <div className={styles.analysisItemHeader}> Item 3 - <i>High Scoring Projects</i></div>
                        <Table title={"High Scoring Projects"} className={styles.financeTable}>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Project</Table.Th>
                                    <Table.Th>Project Category</Table.Th>
                                    <Table.Th>Jurisdiction</Table.Th>
                                    <Table.Th>Estimated Total Cost</Table.Th>
                                    <Table.Th>See Advanced Details</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {highScoringProjects.map((project, index) => {
                                    return (
                                        <Table.Tr key={project.id}>
                                            <Table.Td> {fieldText(project.project)} </Table.Td>
                                            <Table.Td> {fieldText(project.project_category)} </Table.Td>
                                            <Table.Td> {fieldText(project.jurisdiction)} </Table.Td>
                                            <Table.Td> {formatDollar(project.estimated_total_cost)} </Table.Td>
                                            <Table.Td>
                                                <Checkbox checked={highScoringProjectOpen === index} onChange={() => {
                                                    setHighScoringProjectOpen(highScoringProjectOpen === index ? null : index);
                                                }}/>
                                            </Table.Td>
                                        </Table.Tr>
                                    );
                                })}
                            </Table.Tbody>
                        </Table>
                    </div>
                </div>
                <ProjectModal opened={highScoringProjectOpen !== null}
                              project={highScoringProjectOpen == null ? null : highScoringProjects[highScoringProjectOpen]}
                              onClose={() => setHighScoringProjectOpen(null)}/>
            </section>

            {/* About section */}
            <section className={styles.third} id="about">
                <div className={styles.about}>
                    <h1 className={styles.aboutHeader}>About</h1>
                    <hr className={styles.divider}/>

                    <Text> Each year the Town and County separately hear recommended capital improvement recommendations
                        from staff. Actual capital improvements are dictated by Town, County, and Joint department
                        budget
                        adoption. Below are various visualizations and metrics related to projects that Town and County
                        departments recommend to (1) maintain infrastructure in a state of good repair and (2) align our
                        transportation networks and services with the goals of the comprehensive plan. Staff are also
                        working on ways for the community to weigh in on projects that they think should be
                        prioritized. </Text>
                </div>
            </section>

            <div className={styles.footer}>
                <p>Thank you for visiting the Jackson/Teton County Capital Improvement Visualization website. We hope
                    you found
                    the
                    information useful. </p>
            </div>
        </>
    );
}

export default Content;
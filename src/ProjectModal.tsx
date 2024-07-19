import Project from "./Project.ts";
import {Accordion, Modal, Table} from "@mantine/core";
import {fieldText, formatDollar} from "./utils.ts";
import styles from "./ProjectModal.module.scss";
import {useFinancesTable} from "./store.ts";
import {useEffect, useState} from "react";
import {Finance} from "./Finance.ts";

interface ProjectModalProps {
    project?: Project | null;
    opened: boolean;
    onClose: () => void;
}

const DetailsTable = ({project}: { project: Project }) => {
    return (
        <Table title={"Details"} striped>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Field</Table.Th>
                    <Table.Th>Value</Table.Th>
                </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
                <Table.Tr>
                    <Table.Td>Jurisdiction</Table.Td>
                    <Table.Td>{fieldText(project.jurisdiction)}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Td>Project Category</Table.Td>
                    <Table.Td>{fieldText(project.project_category)}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Td>Summary Category</Table.Td>
                    <Table.Td>{fieldText(project.summary_category)}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Td>Mode</Table.Td>
                    <Table.Td>{fieldText(project.mode)}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Td>Current Fiscal Year Category</Table.Td>
                    <Table.Td>{fieldText(project.current_fy_category)}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Td>Next Fiscal Year Category</Table.Td>
                    <Table.Td>{fieldText(project.next_fy_category)}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Td>Asset Category 1</Table.Td>
                    <Table.Td>{fieldText(project.asset_category_1)}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Td>Asset Category 2</Table.Td>
                    <Table.Td>{fieldText(project.asset_category_2)}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Td>Asset Category 3</Table.Td>
                    <Table.Td>{fieldText(project.asset_category_3)}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Td>Estimated Total Cost</Table.Td>
                    <Table.Td>{formatDollar(project.estimated_total_cost)}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Td>Year of Cost Estimate</Table.Td>
                    <Table.Td>{project.year_source_cost_estimate || "Unknown"}</Table.Td>
                </Table.Tr>
            </Table.Tbody>
        </Table>
    );
}

const ScoresTable = ({project}: { project: Project }) => {
    return (
        <Table title={"Scores"} striped>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Field</Table.Th>
                    <Table.Th>Value</Table.Th>
                </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
                <Table.Tr>
                    <Table.Td>Plan Alignment Score</Table.Td>
                    <Table.Td>{project.plan_alignment_score || "Unknown"}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Td>Staff Resources Score</Table.Td>
                    <Table.Td>{project.staff_resources_score || "Unknown"}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Td>Realities Score</Table.Td>
                    <Table.Td>{project.realities_score || "Unknown"}</Table.Td>
                </Table.Tr>
            </Table.Tbody>
        </Table>
    );

}

const FinanceTable = ({project}: { project: Project }) => {
    const financeLayer = useFinancesTable();

    // Select rows from financeLayer where project.project === project.project
    const [financeRows, setFinanceRows] = useState<Finance[]>([]);
    useEffect(() => {
        if (financeLayer) {
            const query = financeLayer.createQuery();
            query.where = `project_id = '${project?.id}'`;
            financeLayer.queryFeatures(query).then((result) => {
                setFinanceRows(result.features.map((feature) => {
                    return {
                        year: feature.attributes.year,
                        local: feature.attributes.local,
                        local_source: feature.attributes.local_source,
                        other: feature.attributes.other,
                        other_source: feature.attributes.other_source
                    }
                }));
            });
        }
    }, [project, financeLayer]);

    return (
        <Table title={"Finances"} striped>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Year</Table.Th>
                    <Table.Th>Local</Table.Th>
                    <Table.Th>Local Source</Table.Th>
                    <Table.Th>Other</Table.Th>
                    <Table.Th>Other Source</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {financeRows.map((finance) => {
                    return (
                        <Table.Tr key={finance.year}>
                            <Table.Td>{finance.year}</Table.Td>
                            <Table.Td>{finance.local ? formatDollar(finance.local) : ""}</Table.Td>
                            <Table.Td>{finance.local_source}</Table.Td>
                            <Table.Td>{finance.other ? formatDollar(finance.other) : ""}</Table.Td>
                            <Table.Td>{finance.other_source}</Table.Td>
                        </Table.Tr>
                    );
                })}
            </Table.Tbody>
        </Table>);
}

const ProjectModal = ({project, opened, onClose}: ProjectModalProps) => {

    return (
        <Modal opened={opened} onClose={onClose} size={"lg"} centered>
            {project &&
                <>
                    <h1 className={styles.projectName}>Project: {project.project}</h1>
                    <Accordion defaultValue={"Details"} className={styles.projectAccordion}>
                        <Accordion.Item value={"Details"}>
                            <Accordion.Control>Details</Accordion.Control>
                            <Accordion.Panel>
                                <DetailsTable project={project}/>
                            </Accordion.Panel>
                        </Accordion.Item>
                        <Accordion.Item value={"Scores"}>
                            <Accordion.Control>Scores</Accordion.Control>
                            <Accordion.Panel>
                                <ScoresTable project={project}/>
                            </Accordion.Panel>
                        </Accordion.Item>
                        <Accordion.Item value={"Finances"}>
                            <Accordion.Control>Finances</Accordion.Control>
                            <Accordion.Panel>
                                <FinanceTable project={project}/>
                            </Accordion.Panel>
                        </Accordion.Item>

                        <div className={styles.notes}>
                            <h3> Project Charter: {!project.project_charter ? "N/A" : ""}</h3>
                            {project.project_charter}

                            <br/>

                            <h3>Notes: {!project.notes ? "N/A" : ""}</h3>
                            {project.notes}
                        </div>
                    </Accordion>
                </>

            }
        </Modal>
    );
}

export default ProjectModal;
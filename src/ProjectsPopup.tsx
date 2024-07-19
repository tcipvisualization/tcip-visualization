import {Accordion, Flex, MantineProvider} from "@mantine/core";
import "./index.css";
import "./App.css";
import styles from "./ProjectsPopup.module.scss";
import Graphic from "@arcgis/core/Graphic";
import Project, {convertGraphicToProject} from "./Project.ts";
import {useMemo, useState} from "react";
import {useDisclosure} from "@mantine/hooks";
import ProjectModal from "./ProjectModal.tsx";
import {upperFirstLetterOfWords} from "./utils.ts";

interface ProjectsPopupProps {
    features: Graphic[];
}

const groupProjects = (projects: Project[]): Map<string, Project[]> => {
    const projectGroups = new Map<string, Project[]>();

    for (const project of projects) {
        const key = project.current_fy_category || "Unknown";

        if (!projectGroups.has(key)) {
            projectGroups.set(key, []);
        }

        projectGroups.get(key)!.push(project);
    }

    // Sort each group by project name
    for (const group of projectGroups.values()) {
        group.sort((a, b) => a.project.localeCompare(b.project));
    }

    // sort the groups
    return new Map([...projectGroups.entries()].sort((a, b) => {
        return a[0].localeCompare(b[0]);
    }));
}

// const getYearString = (year: number | undefined): string => {
//     if (!year) {
//         return "Unknown";
//     }
//
//     return year.toString();
//
// }

const ProjectList = ({projects, onProjectSelected}: {
    projects: Project[],
    onProjectSelected?: (project: Project) => void
}) => {
    const projectGroups = useMemo(() => groupProjects(projects), [projects]);

    const onChooseProject = (project: Project) => {
        if (onProjectSelected) {
            onProjectSelected(project);
        }
    }

    return (
        <div>
            <Accordion>
                {Array.from(projectGroups.entries()).map(([key, projects]) => {
                    return (
                        <Accordion.Item value={key || "Unknown"} key={key}>
                            <Accordion.Control> Current
                                Category: {upperFirstLetterOfWords(key || "Unknown")}</Accordion.Control>
                            <Accordion.Panel>
                                <Flex direction="column">
                                    {projects.map((project) => {
                                        return (
                                            <button key={project.project} className={styles.projectListItem}
                                                    onClick={() => onChooseProject(project)}>
                                                {project.project}
                                            </button>
                                        );
                                    })}
                                </Flex>
                            </Accordion.Panel>
                        </Accordion.Item>
                    );
                })}
            </Accordion>
        </div>
    );
}

const SingleProjectPopup = ({project}: { project: Project }) => {
    const [opened, {open, close}] = useDisclosure(false);

    return (
        <MantineProvider>
            <hr/>
            <div className={styles.popup}>
                <div className={styles.info}>
                    <div className={styles.label}>Jurisdiction: {' '}</div>
                    <div>{upperFirstLetterOfWords(project.jurisdiction || 'Unknown')}</div>
                </div>
                <div className={styles.info}>
                    <div className={styles.label}>Project Category: {' '}</div>
                    <div>{upperFirstLetterOfWords(project.project_category || 'Unknown')}</div>
                </div>
                <div className={styles.info}>
                    <div className={styles.label}>Summary Category: {' '}</div>
                    <div>{upperFirstLetterOfWords(project.summary_category || 'Unknown')}</div>
                </div>
                <div className={styles.info}>
                    <div className={styles.label}>Mode: {' '}</div>
                    <div>{upperFirstLetterOfWords(project.mode || 'Unknown')}</div>
                </div>
                <button className={styles.projectButton} onClick={open}>
                    See Advanced Details
                </button>
            </div>

            <ProjectModal project={project} opened={opened} onClose={close}/>
        </MantineProvider>
    );
};


const ProjectsPopup = ({features}: ProjectsPopupProps) => {
    // Convert features into Project objects
    const projects: Project[] = useMemo(() => features.map(convertGraphicToProject), [features]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    if (projects.length === 1) {
        return <SingleProjectPopup project={projects[0]}/>
    }

    // If no selected project, display a list of projects sorted by (year_source_cost_estimate if it exists, then project)


    return (
        <MantineProvider>
            <hr/>
            <div className={styles.popup}>
                <ProjectList projects={projects} onProjectSelected={setSelectedProject}/>
            </div>

            <ProjectModal project={selectedProject} opened={selectedProject !== null}
                          onClose={() => setSelectedProject(null)}/>
        </MantineProvider>
    );
}

export default ProjectsPopup;
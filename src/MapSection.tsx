import styles from "./MapSection.module.scss";
import {Flex, Input, Text, Title} from "@mantine/core";
import Visualization from "./Visualization.tsx";
import {IoIosArrowDown} from "react-icons/io";
import ProjectModal from "./ProjectModal.tsx";
import {useEffect, useMemo, useRef, useState} from "react";
import {useProjectsTable} from "./store.ts";
import Project, {convertGraphicToProject} from "./Project.ts";
import {useViewportSize} from "@mantine/hooks";

const MapSection = () => {
    const heightRef = useRef<HTMLDivElement>(null);

    const [searchQuery, setSearchQuery] = useState<string>("");
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const viewportSize = useViewportSize();

    const projectsTable = useProjectsTable();

    const [projects, setProjects] = useState<Project[]>([]);
    useEffect(() => {
        if (projectsTable) {
            projectsTable.queryFeatures().then((results) => {
                setProjects(results.features.map((feature) => convertGraphicToProject(feature)));
            });
        }
    }, [projectsTable]);

    const filteredProjects = useMemo(() =>
            projects.filter((project) => project.project.toLowerCase().includes(searchQuery.toLowerCase()))
                .sort((a, b) => a.project.localeCompare(b.project)),
        [projects, searchQuery]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const [height, setHeight] = useState<number>(0);
    useEffect(() => {
        if (!heightRef.current) return;
        setHeight(heightRef.current.clientHeight);

        const resizeObserver = new ResizeObserver(() => {
            setHeight(heightRef.current!.clientHeight);
        });
        resizeObserver.observe(heightRef.current);
        return () => resizeObserver.disconnect(); // clean up
    }, []);

    const sidebar = <div className={styles.sidebar}
                         style={{
                             height: viewportSize.width > 768 ? height : "50vh",
                             width: viewportSize.width > 768 ? undefined : "100%"
                         }}>
        <Title className={styles.sidebarTitle} order={2}>
            Projects Map
        </Title>
        <Text className={styles.sidebarText}>
            Some projects may not be have inputted coordinates.
            Search in the area below to find a specific project.
        </Text>

        <Input placeholder={"Search"} value={searchQuery} onChange={handleSearch}/>

        <div className={styles.projectList}>
            {filteredProjects.map((project) => (
                <div key={project.id} className={styles.project}
                     onClick={() => setSelectedProject(project)}>
                    <Text>{project.project}</Text>
                </div>
            ))}
        </div>
    </div>;

    return (
        <>
            <section className={styles.first} id="map">
                <div className={styles.header}>
                    <div> Jackson/Teton County Transportation Capital Improvement Program</div>
                </div>
                <Flex className={styles.map} ref={heightRef}>
                    <div className={styles.mainMap}>
                        <Visualization height={height + "px"}/>
                    </div>
                    {viewportSize.width > 768 ? sidebar : null}

                    {/* Scroll down arrow overlayed on the map */}
                    <a className={styles.scrollDownArrow} href="#analysis">
                        <IoIosArrowDown size={30}/>
                    </a>
                </Flex>

                <ProjectModal project={selectedProject} opened={selectedProject != null}
                              onClose={() => setSelectedProject(null)}/>
            </section>


            {viewportSize.width <= 768 ? sidebar : null}
        </>
    );
}

export default MapSection;
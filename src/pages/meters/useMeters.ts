import { useEffect, useMemo, useState } from "react";
import { fetchMeters, type Meter } from "../../api/meters";

type UseMetersArgs = {
  initialProject?: string;
};

export function useMeters({ initialProject }: UseMetersArgs) {
  const [allProjects, setAllProjects] = useState<string[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [selectedProject, setSelectedProject] = useState(initialProject || "");

  const [meters, setMeters] = useState<Meter[]>([]);
  const [filteredMeters, setFilteredMeters] = useState<Meter[]>([]);
  const [loadingMeters, setLoadingMeters] = useState(true);

  const loadMeters = async () => {
    setLoadingMeters(true);
    setLoadingProjects(true);

    try {
      const data = await fetchMeters();

      const projectsArray = [...new Set(data.map((r) => r.areaName))]
        .filter(Boolean) as string[];

      setAllProjects(projectsArray);
      setMeters(data);

      setSelectedProject((prev) => {
        if (prev) return prev;
        if (initialProject) return initialProject;
        return projectsArray[0] ?? "";
      });
    } catch (error) {
      console.error("Error loading meters:", error);
      setAllProjects([]);
      setMeters([]);
      setSelectedProject("");
    } finally {
      setLoadingMeters(false);
      setLoadingProjects(false);
    }
  };

  // init
  useEffect(() => {
    loadMeters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep selectedProject synced if parent changes initialProject
  useEffect(() => {
    if (initialProject) setSelectedProject(initialProject);
  }, [initialProject]);

  // filter by project
  useEffect(() => {
    if (!selectedProject) {
      setFilteredMeters([]);
      return;
    }
    setFilteredMeters(meters.filter((m) => m.areaName === selectedProject));
  }, [selectedProject, meters]);

  const projectsCounts = useMemo(() => {
    return meters.reduce<Record<string, number>>((acc, m) => {
      const area = m.areaName ?? "SIN PROYECTO";
      acc[area] = (acc[area] ?? 0) + 1;
      return acc;
    }, {});
  }, [meters]);

  return {
    // loading
    loadingProjects,
    loadingMeters,

    // projects
    allProjects,
    projectsCounts,
    selectedProject,
    setSelectedProject,

    // data
    meters,
    setMeters,
    filteredMeters,

    // actions
    loadMeters,
  };
}

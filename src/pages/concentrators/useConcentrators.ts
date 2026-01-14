import { useEffect, useMemo, useState } from "react";
import {
  fetchConcentrators,
  type Concentrator,
} from "../../api/concentrators";
import type { ProjectCard, SampleView } from "./ConcentratorsPage";

type User = {
  role: "SUPER_ADMIN" | "USER";
  project?: string;
};

export function useConcentrators(currentUser: User) {
  const [sampleView, setSampleView] = useState<SampleView>("GENERAL");

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingConcentrators, setLoadingConcentrators] = useState(true);

  const [allProjects, setAllProjects] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState("");

  const [concentrators, setConcentrators] = useState<Concentrator[]>([]);
  const [filteredConcentrators, setFilteredConcentrators] = useState<
    Concentrator[]
  >([]);

  const isGeneral = sampleView === "GENERAL";

  const sampleViewLabel = useMemo(() => {
    switch (sampleView) {
      case "GENERAL":
        return "General";
      case "LORA":
        return "LoRa";
      case "LORAWAN":
        return "LoRaWAN";
      case "GRANDES":
        return "Grandes consumidores";
      default:
        return "General";
    }
  }, [sampleView]);

  const visibleProjects = useMemo(
    () =>
      currentUser.role === "SUPER_ADMIN"
        ? allProjects
        : currentUser.project
        ? [currentUser.project]
        : [],
    [allProjects, currentUser.role, currentUser.project]
  );

  const loadConcentrators = async () => {
    if (!isGeneral) return;

    setLoadingConcentrators(true);
    setLoadingProjects(true);

    try {
      const raw = await fetchConcentrators();

      const normalized = raw.map((c: any) => {
        const preferredName =
          c["Device Alias"] ||
          c["Device Label"] ||
          c["Device Display Name"] ||
          c.deviceName ||
          c.name ||
          c["Device Name"] ||
          "";

        return {
          ...c,
          "Device Name": preferredName,
        };
      });

      const projectsArray = [
        ...new Set(normalized.map((r: any) => r["Area Name"])),
      ].filter(Boolean) as string[];

      setAllProjects(projectsArray);
      setConcentrators(normalized);

      setSelectedProject((prev) => {
        if (prev) return prev;
        if (currentUser.role !== "SUPER_ADMIN" && currentUser.project) {
          return currentUser.project;
        }
        return projectsArray[0] ?? "";
      });
    } catch (err) {
      console.error("Error loading concentrators:", err);
      setAllProjects([]);
      setConcentrators([]);
      setSelectedProject("");
    } finally {
      setLoadingConcentrators(false);
      setLoadingProjects(false);
    }
  };

  // init
  useEffect(() => {
    loadConcentrators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // view changes
  useEffect(() => {
    if (isGeneral) {
      loadConcentrators();
    } else {
      setLoadingProjects(false);
      setLoadingConcentrators(false);
      setSelectedProject("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sampleView]);

  // auto select single visible project
  useEffect(() => {
    if (!isGeneral) return;
    if (!selectedProject && visibleProjects.length === 1) {
      setSelectedProject(visibleProjects[0]);
    }
  }, [visibleProjects, selectedProject, isGeneral]);

  // filter by project
  useEffect(() => {
    if (!isGeneral) {
      setFilteredConcentrators([]);
      return;
    }

    if (selectedProject) {
      setFilteredConcentrators(
        concentrators.filter((c) => c["Area Name"] === selectedProject)
      );
    } else {
      setFilteredConcentrators(concentrators);
    }
  }, [selectedProject, concentrators, isGeneral]);

  // sidebar cards (general)
  const projectsDataGeneral: ProjectCard[] = useMemo(() => {
    const counts = concentrators.reduce<Record<string, number>>((acc, c) => {
      const area = c["Area Name"] ?? "SIN PROYECTO";
      acc[area] = (acc[area] ?? 0) + 1;
      return acc;
    }, {});

    const baseRegion = "Baja California";
    const baseContact = "Operaciones";
    const baseLastSync = "Hace 1 h";

    return visibleProjects.map((name) => ({
      name,
      region: baseRegion,
      projects: 1,
      concentrators: counts[name] ?? 0,
      activeAlerts: 0,
      lastSync: baseLastSync,
      contact: baseContact,
      status: "ACTIVO",
    }));
  }, [concentrators, visibleProjects]);

  // sidebar cards (mock)
  const projectsDataMock: Record<Exclude<SampleView, "GENERAL">, ProjectCard[]> =
    useMemo(
      () => ({
        LORA: [
          {
            name: "LoRa - Zona Centro",
            region: "Baja California",
            projects: 1,
            concentrators: 12,
            activeAlerts: 1,
            lastSync: "Hace 15 min",
            contact: "Operaciones",
            status: "ACTIVO",
          },
          {
            name: "LoRa - Zona Este",
            region: "Baja California",
            projects: 1,
            concentrators: 8,
            activeAlerts: 0,
            lastSync: "Hace 40 min",
            contact: "Operaciones",
            status: "ACTIVO",
          },
        ],
        LORAWAN: [
          {
            name: "LoRaWAN - Industrial",
            region: "Baja California",
            projects: 1,
            concentrators: 5,
            activeAlerts: 0,
            lastSync: "Hace 1 h",
            contact: "Operaciones",
            status: "ACTIVO",
          },
        ],
        GRANDES: [
          {
            name: "Grandes - Convenios",
            region: "Baja California",
            projects: 1,
            concentrators: 3,
            activeAlerts: 0,
            lastSync: "Hace 2 h",
            contact: "Operaciones",
            status: "ACTIVO",
          },
        ],
      }),
      []
    );

  const projectsData: ProjectCard[] = useMemo(() => {
    if (isGeneral) return projectsDataGeneral;
    return projectsDataMock[sampleView as Exclude<SampleView, "GENERAL">];
  }, [isGeneral, projectsDataGeneral, projectsDataMock, sampleView]);

  return {
    // view
    sampleView,
    setSampleView,
    sampleViewLabel,
    isGeneral,

    // loading
    loadingProjects,
    loadingConcentrators,

    // projects
    allProjects,
    visibleProjects,
    projectsData,
    selectedProject,
    setSelectedProject,

    // data
    concentrators,
    setConcentrators,
    filteredConcentrators,

    // actions
    loadConcentrators,
  };
}

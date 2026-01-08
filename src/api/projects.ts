const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const PROJECTS_API_URL = `${API_BASE_URL}/api/v3/data/ppfu31vhv5gf6i0/m05u6wpquvdbv3c/records`;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

export const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  "xc-token": API_TOKEN,                 // NocoDB style
  Authorization: `Bearer ${API_TOKEN}`,  // fallback por si el backend usa Bearer
});

export interface ProjectRecord {
  id: number;
  fields: {
    "Area name"?: string;
    "Device S/N"?: string;
    "Device Name"?: string;
    "Device Type"?: string;
    "Device Status"?: string;
    Operator?: string;
    "Installed Time"?: string;
    "Communication Time"?: string;
    "Instruction Manual"?: string | null;
  };
}

export interface ProjectsResponse {
  records: ProjectRecord[];
  next?: string;
  prev?: string;
  nestedNext?: string;
  nestedPrev?: string;
}

export interface Project {
  id: string;
  areaName: string;
  deviceSN: string;
  deviceName: string;
  deviceType: string;
  deviceStatus: "ACTIVE" | "INACTIVE";
  operator: string;
  installedTime: string;
  communicationTime: string;
  instructionManual: string;
}

export const fetchProjectNames = async (): Promise<string[]> => {
  try {
    const response = await fetch(PROJECTS_API_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch projects");
    }

    const data: ProjectsResponse = await response.json();

    if (!data.records || data.records.length === 0) {
      console.warn("No project records found from API");
      return [];
    }

    const projectNames = [
      ...new Set(
        data.records
          .map((record) => record.fields["Area name"] || "")
          .filter((name) => name)
      ),
    ];

    return projectNames;
  } catch (error) {
    console.error("Error fetching project names:", error);
    return [];
  }
};

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const response = await fetch(PROJECTS_API_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch projects");
    }

    const data: ProjectsResponse = await response.json();

    return data.records.map((r: ProjectRecord) => ({
      id: r.id.toString(),
      areaName: r.fields["Area name"] ?? "",
      deviceSN: r.fields["Device S/N"] ?? "",
      deviceName: r.fields["Device Name"] ?? "",
      deviceType: r.fields["Device Type"] ?? "",
      deviceStatus:
        r.fields["Device Status"] === "Installed" ? "ACTIVE" : "INACTIVE",
      operator: r.fields["Operator"] ?? "",
      installedTime: r.fields["Installed Time"] ?? "",
      communicationTime: r.fields["Communication Time"] ?? "",
      instructionManual: r.fields["Instruction Manual"] ?? "",
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export const createProject = async (
  projectData: Omit<Project, "id">
): Promise<Project> => {
  const response = await fetch(PROJECTS_API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      fields: {
        "Area name": projectData.areaName,
        "Device S/N": projectData.deviceSN,
        "Device Name": projectData.deviceName,
        "Device Type": projectData.deviceType,
        "Device Status":
          projectData.deviceStatus === "ACTIVE" ? "Installed" : "Inactive",
        Operator: projectData.operator,
        "Installed Time": projectData.installedTime,
        "Communication Time": projectData.communicationTime,
        "Instruction Manual": projectData.instructionManual,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to create project: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  const createdRecord = data.records?.[0];
  if (!createdRecord) {
    throw new Error("Invalid response format: no record returned");
  }

  return {
    id: createdRecord.id.toString(),
    areaName: createdRecord.fields["Area name"] ?? projectData.areaName,
    deviceSN: createdRecord.fields["Device S/N"] ?? projectData.deviceSN,
    deviceName: createdRecord.fields["Device Name"] ?? projectData.deviceName,
    deviceType: createdRecord.fields["Device Type"] ?? projectData.deviceType,
    deviceStatus:
      createdRecord.fields["Device Status"] === "Installed"
        ? "ACTIVE"
        : "INACTIVE",
    operator: createdRecord.fields["Operator"] ?? projectData.operator,
    installedTime:
      createdRecord.fields["Installed Time"] ?? projectData.installedTime,
    communicationTime:
      createdRecord.fields["Communication Time"] ??
      projectData.communicationTime,
    instructionManual:
      createdRecord.fields["Instruction Manual"] ??
      projectData.instructionManual,
  };
};

export const updateProject = async (
  id: string,
  projectData: Omit<Project, "id">
): Promise<Project> => {
  const response = await fetch(PROJECTS_API_URL, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      id: parseInt(id),
      fields: {
        "Area name": projectData.areaName,
        "Device S/N": projectData.deviceSN,
        "Device Name": projectData.deviceName,
        "Device Type": projectData.deviceType,
        "Device Status":
          projectData.deviceStatus === "ACTIVE" ? "Installed" : "Inactive",
        Operator: projectData.operator,
        "Installed Time": projectData.installedTime,
        "Communication Time": projectData.communicationTime,
        "Instruction Manual": projectData.instructionManual,
      },
    }),
  });

  if (!response.ok) {
    if (response.status === 400) {
      const errorData = await response.json();
      throw new Error(
        `Bad Request: ${errorData.msg || "Invalid data provided"}`
      );
    }
    throw new Error(
      `Failed to update project: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  const updatedRecord = data.records?.[0];
  if (!updatedRecord) {
    throw new Error("Invalid response format: no record returned");
  }

  return {
    id: updatedRecord.id.toString(),
    areaName: updatedRecord.fields["Area name"] ?? projectData.areaName,
    deviceSN: updatedRecord.fields["Device S/N"] ?? projectData.deviceSN,
    deviceName: updatedRecord.fields["Device Name"] ?? projectData.deviceName,
    deviceType: updatedRecord.fields["Device Type"] ?? projectData.deviceType,
    deviceStatus:
      updatedRecord.fields["Device Status"] === "Installed"
        ? "ACTIVE"
        : "INACTIVE",
    operator: updatedRecord.fields["Operator"] ?? projectData.operator,
    installedTime:
      updatedRecord.fields["Installed Time"] ?? projectData.installedTime,
    communicationTime:
      updatedRecord.fields["Communication Time"] ??
      projectData.communicationTime,
    instructionManual:
      updatedRecord.fields["Instruction Manual"] ??
      projectData.instructionManual,
  };
};

export const deleteProject = async (id: string): Promise<void> => {
  const response = await fetch(PROJECTS_API_URL, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      id: id,
    }),
  });

  if (!response.ok) {
    if (response.status === 400) {
      const errorData = await response.json();
      throw new Error(
        `Bad Request: ${errorData.msg || "Invalid data provided"}`
      );
    }
    throw new Error(
      `Failed to delete project: ${response.status} ${response.statusText}`
    );
  }
};

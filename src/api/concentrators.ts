const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const CONCENTRATORS_API_URL = `${API_BASE_URL}/api/v3/data/ppfu31vhv5gf6i0/mqqvi3woqdw5ziq/records`;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${API_TOKEN}`,
  "Content-Type": "application/json",
});

export interface ConcentratorRecord {
  id: string;
  fields: {
    "Area Name": string;
    "Device S/N": string;
    "Device Name": string;
    "Device Time": string;
    "Device Status": string;
    "Operator": string;
    "Installed Time": string;
    "Communication Time": string;
    "Instruction Manual": string;
  };
}

export interface ConcentratorsResponse {
  records: ConcentratorRecord[];
  next?: string;
  prev?: string;
  nestedNext?: string;
  nestedPrev?: string;
}

export interface Concentrator {
  id: string;
  "Area Name": string;
  "Device S/N": string;
  "Device Name": string;
  "Device Time": string;
  "Device Status": string;
  "Operator": string;
  "Installed Time": string;
  "Communication Time": string;
  "Instruction Manual": string;
}

export const fetchConcentrators = async (): Promise<Concentrator[]> => {
  try {
    const response = await fetch(CONCENTRATORS_API_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch concentrators");
    }

    const data: ConcentratorsResponse = await response.json();

    return data.records.map((r: ConcentratorRecord) => ({
      id: r.id,
      "Area Name": r.fields["Area Name"] || "",
      "Device S/N": r.fields["Device S/N"] || "",
      "Device Name": r.fields["Device Name"] || "",
      "Device Time": r.fields["Device Time"] || "",
      "Device Status": r.fields["Device Status"] || "",
      "Operator": r.fields["Operator"] || "",
      "Installed Time": r.fields["Installed Time"] || "",
      "Communication Time": r.fields["Communication Time"] || "",
      "Instruction Manual": r.fields["Instruction Manual"] || "",
    }));
  } catch (error) {
    console.error("Error fetching concentrators:", error);
    throw error;
  }
};

export const createConcentrator = async (
  concentratorData: Omit<Concentrator, "id">
): Promise<Concentrator> => {
  try {
    const response = await fetch(CONCENTRATORS_API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        fields: {
          "Area Name": concentratorData["Area Name"],
          "Device S/N": concentratorData["Device S/N"],
          "Device Name": concentratorData["Device Name"],
          "Device Time": concentratorData["Device Time"],
          "Device Status": concentratorData["Device Status"],
          "Operator": concentratorData["Operator"],
          "Installed Time": concentratorData["Installed Time"],
          "Communication Time": concentratorData["Communication Time"],
          "Instruction Manual": concentratorData["Instruction Manual"],
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create concentrator: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const createdRecord = data.records?.[0];

    if (!createdRecord) {
      throw new Error("Invalid response format: no record returned");
    }

    return {
      id: createdRecord.id,
      "Area Name": createdRecord.fields["Area Name"] || concentratorData["Area Name"],
      "Device S/N": createdRecord.fields["Device S/N"] || concentratorData["Device S/N"],
      "Device Name": createdRecord.fields["Device Name"] || concentratorData["Device Name"],
      "Device Time": createdRecord.fields["Device Time"] || concentratorData["Device Time"],
      "Device Status": createdRecord.fields["Device Status"] || concentratorData["Device Status"],
      "Operator": createdRecord.fields["Operator"] || concentratorData["Operator"],
      "Installed Time": createdRecord.fields["Installed Time"] || concentratorData["Installed Time"],
      "Communication Time": createdRecord.fields["Communication Time"] || concentratorData["Communication Time"],
      "Instruction Manual": createdRecord.fields["Instruction Manual"] || concentratorData["Instruction Manual"],
    };
  } catch (error) {
    console.error("Error creating concentrator:", error);
    throw error;
  }
};

export const updateConcentrator = async (
  id: string,
  concentratorData: Omit<Concentrator, "id">
): Promise<Concentrator> => {
  try {
    const response = await fetch(CONCENTRATORS_API_URL, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        id: id,
        fields: {
          "Area Name": concentratorData["Area Name"],
          "Device S/N": concentratorData["Device S/N"],
          "Device Name": concentratorData["Device Name"],
          "Device Time": concentratorData["Device Time"],
          "Device Status": concentratorData["Device Status"],
          "Operator": concentratorData["Operator"],
          "Installed Time": concentratorData["Installed Time"],
          "Communication Time": concentratorData["Communication Time"],
          "Instruction Manual": concentratorData["Instruction Manual"],
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(`Bad Request: ${errorData.msg || "Invalid data provided"}`);
      }
      throw new Error(`Failed to update concentrator: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const updatedRecord = data.records?.[0];

    if (!updatedRecord) {
      throw new Error("Invalid response format: no record returned");
    }

    return {
      id: updatedRecord.id,
      "Area Name": updatedRecord.fields["Area Name"] || concentratorData["Area Name"],
      "Device S/N": updatedRecord.fields["Device S/N"] || concentratorData["Device S/N"],
      "Device Name": updatedRecord.fields["Device Name"] || concentratorData["Device Name"],
      "Device Time": updatedRecord.fields["Device Time"] || concentratorData["Device Time"],
      "Device Status": updatedRecord.fields["Device Status"] || concentratorData["Device Status"],
      "Operator": updatedRecord.fields["Operator"] || concentratorData["Operator"],
      "Installed Time": updatedRecord.fields["Installed Time"] || concentratorData["Installed Time"],
      "Communication Time": updatedRecord.fields["Communication Time"] || concentratorData["Communication Time"],
      "Instruction Manual": updatedRecord.fields["Instruction Manual"] || concentratorData["Instruction Manual"],
    };
  } catch (error) {
    console.error("Error updating concentrator:", error);
    throw error;
  }
};

export const deleteConcentrator = async (id: string): Promise<void> => {
  try {
    const response = await fetch(CONCENTRATORS_API_URL, {
      method: "DELETE",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        id: id,
      }),
    });

    if (!response.ok) {
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(`Bad Request: ${errorData.msg || "Invalid data provided"}`);
      }
      throw new Error(`Failed to delete concentrator: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting concentrator:", error);
    throw error;
  }
};

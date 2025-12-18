interface ProjectRecord {
  id: string;
  fields: {
    "Project ID": string;
    "Area name": string;
    "Device S/N": string;
    "Device Name": string;
    "Device Type": string;
    "Device Status": string;
    "Operator": string;
    "Installed Time": string;
    "Communication Time": string;
    "Instruction Manual": string;
  };
}

interface ProjectsResponse {
  records: ProjectRecord[];
  next?: string;
  prev?: string;
  nestedNext?: string;
  nestedPrev?: string;
}

export const fetchProjects = async (): Promise<string[]> => {
  try {
    // const response = await fetch('/api/v3/data/ppfu31vhv5gf6i0/m05u6wpquvdbv3c/records');
    // const data: ProjectsResponse = await response.json();

    const dummyResponse: ProjectsResponse = {
      records: [
        {
          id: "rec1",
          fields: {
            "Project ID": "1",
            "Area name": "GRH (PADRE)",
            "Device S/N": "SN001",
            "Device Name": "Device 1",
            "Device Type": "Type A",
            "Device Status": "Active",
            "Operator": "Op1",
            "Installed Time": "2023-01-01",
            "Communication Time": "2023-01-02",
            "Instruction Manual": "Manual 1"
          }
        },
        {
          id: "rec2",
          fields: {
            "Project ID": "2",
            "Area name": "CESPT",
            "Device S/N": "SN002",
            "Device Name": "Device 2",
            "Device Type": "Type B",
            "Device Status": "Active",
            "Operator": "Op2",
            "Installed Time": "2023-01-02",
            "Communication Time": "2023-01-03",
            "Instruction Manual": "Manual 2"
          }
        },
        {
          id: "rec3",
          fields: {
            "Project ID": "3",
            "Area name": "Proyecto A",
            "Device S/N": "SN003",
            "Device Name": "Device 3",
            "Device Type": "Type C",
            "Device Status": "Inactive",
            "Operator": "Op3",
            "Installed Time": "2023-01-03",
            "Communication Time": "2023-01-04",
            "Instruction Manual": "Manual 3"
          }
        },
        {
          id: "rec4",
          fields: {
            "Project ID": "4",
            "Area name": "Proyecto B",
            "Device S/N": "SN004",
            "Device Name": "Device 4",
            "Device Type": "Type D",
            "Device Status": "Active",
            "Operator": "Op4",
            "Installed Time": "2023-01-04",
            "Communication Time": "2023-01-05",
            "Instruction Manual": "Manual 4"
          }
        }
      ]
    };

    const projectNames = [...new Set(dummyResponse.records.map(record => record.fields["Area name"]))];

    return projectNames;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return ["GRH (PADRE)", "CESPT", "Proyecto A", "Proyecto B"];
  }
};

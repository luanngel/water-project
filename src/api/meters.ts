const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const METERS_API_URL = `${API_BASE_URL}/api/v3/data/ppfu31vhv5gf6i0/mp1izvcpok5rk6s/records`;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${API_TOKEN}`,
  "Content-Type": "application/json",
});

export interface MeterRecord {
  id: string;
  fields: {
    CreatedAt: string;
    UpdatedAt: string;
    "Area Name": string;
    "Account Number": string | null;
    "User Name": string | null;
    "User Address": string | null;
    "Meter S/N": string;
    "Meter Name": string;
    "Meter Status": string;
    "Protocol Type": string;
    "Price No.": string | null;
    "Price Name": string | null;
    "DMA Partition": string | null;
    "Supply Types": string;
    "Device ID": string;
    "Device Name": string;
    "Device Type": string;
    "Usage Analysis Type": string;
    "Installed Time": string;
  };
}

export interface MetersResponse {
  records: MeterRecord[];
  next?: string;
  prev?: string;
  nestedNext?: string;
  nestedPrev?: string;
}

export interface Meter {
  id: string;
  createdAt: string;
  updatedAt: string;
  areaName: string;
  accountNumber: string | null;
  userName: string | null;
  userAddress: string | null;
  meterSerialNumber: string;
  meterName: string;
  meterStatus: string;
  protocolType: string;
  priceNo: string | null;
  priceName: string | null;
  dmaPartition: string | null;
  supplyTypes: string;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  usageAnalysisType: string;
  installedTime: string;
}

export const fetchMeters = async (): Promise<Meter[]> => {
  const pageSize = 9999;
  try {
    const response = await fetch(`${METERS_API_URL}?pageSize=${pageSize}`, {
      method: "GET",
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error("Failed to fetch meters");
    }

    const data: MetersResponse = await response.json();
    const ans = data.records.map((r: MeterRecord) => ({
      id: r.id,
      createdAt: r.fields.CreatedAt || "",
      updatedAt: r.fields.UpdatedAt || "",
      areaName: r.fields["Area Name"] || "",
      accountNumber: r.fields["Account Number"] || null,
      userName: r.fields["User Name"] || null,
      userAddress: r.fields["User Address"] || null,
      meterSerialNumber: r.fields["Meter S/N"] || "",
      meterName: r.fields["Meter Name"] || "",
      meterStatus: r.fields["Meter Status"] || "",
      protocolType: r.fields["Protocol Type"] || "",
      priceNo: r.fields["Price No."] || null,
      priceName: r.fields["Price Name"] || null,
      dmaPartition: r.fields["DMA Partition"] || null,
      supplyTypes: r.fields["Supply Types"] || "",
      deviceId: r.fields["Device ID"] || "",
      deviceName: r.fields["Device Name"] || "",
      deviceType: r.fields["Device Type"] || "",
      usageAnalysisType: r.fields["Usage Analysis Type"] || "",
      installedTime: r.fields["Installed Time"] || "",
    }));

    return ans;
  } catch (error) {
    console.error("Error fetching meters:", error);
    throw error;
  }
};

export const createMeter = async (
  meterData: Omit<Meter, "id">
): Promise<Meter> => {
  try {
    const response = await fetch(METERS_API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        fields: {
          CreatedAt: meterData.createdAt,
          UpdatedAt: meterData.updatedAt,
          "Area Name": meterData.areaName,
          "Account Number": meterData.accountNumber,
          "User Name": meterData.userName,
          "User Address": meterData.userAddress,
          "Meter S/N": meterData.meterSerialNumber,
          "Meter Name": meterData.meterName,
          "Meter Status": meterData.meterStatus,
          "Protocol Type": meterData.protocolType,
          "Price No.": meterData.priceNo,
          "Price Name": meterData.priceName,
          "DMA Partition": meterData.dmaPartition,
          "Supply Types": meterData.supplyTypes,
          "Device ID": meterData.deviceId,
          "Device Name": meterData.deviceName,
          "Device Type": meterData.deviceType,
          "Usage Analysis Type": meterData.usageAnalysisType,
          "Installed Time": meterData.installedTime,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create meter: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const createdRecord = data.records?.[0];

    if (!createdRecord) {
      throw new Error("Invalid response format: no record returned");
    }

    return {
      id: createdRecord.id,
      createdAt: createdRecord.fields.CreatedAt || meterData.createdAt,
      updatedAt: createdRecord.fields.UpdatedAt || meterData.updatedAt,
      areaName: createdRecord.fields["Area Name"] || meterData.areaName,
      accountNumber:
        createdRecord.fields["Account Number"] || meterData.accountNumber,
      userName: createdRecord.fields["User Name"] || meterData.userName,
      userAddress:
        createdRecord.fields["User Address"] || meterData.userAddress,
      meterSerialNumber:
        createdRecord.fields["Meter S/N"] || meterData.meterSerialNumber,
      meterName: createdRecord.fields["Meter Name"] || meterData.meterName,
      meterStatus:
        createdRecord.fields["Meter Status"] || meterData.meterStatus,
      protocolType:
        createdRecord.fields["Protocol Type"] || meterData.protocolType,
      priceNo: createdRecord.fields["Price No."] || meterData.priceNo,
      priceName: createdRecord.fields["Price Name"] || meterData.priceName,
      dmaPartition:
        createdRecord.fields["DMA Partition"] || meterData.dmaPartition,
      supplyTypes:
        createdRecord.fields["Supply Types"] || meterData.supplyTypes,
      deviceId: createdRecord.fields["Device ID"] || meterData.deviceId,
      deviceName: createdRecord.fields["Device Name"] || meterData.deviceName,
      deviceType: createdRecord.fields["Device Type"] || meterData.deviceType,
      usageAnalysisType:
        createdRecord.fields["Usage Analysis Type"] ||
        meterData.usageAnalysisType,
      installedTime:
        createdRecord.fields["Installed Time"] || meterData.installedTime,
    };
  } catch (error) {
    console.error("Error creating meter:", error);
    throw error;
  }
};

export const updateMeter = async (
  id: string,
  meterData: Omit<Meter, "id">
): Promise<Meter> => {
  try {
    const response = await fetch(METERS_API_URL, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        id: id,
        fields: {
          CreatedAt: meterData.createdAt,
          UpdatedAt: meterData.updatedAt,
          "Area Name": meterData.areaName,
          "Account Number": meterData.accountNumber,
          "User Name": meterData.userName,
          "User Address": meterData.userAddress,
          "Meter S/N": meterData.meterSerialNumber,
          "Meter Name": meterData.meterName,
          "Meter Status": meterData.meterStatus,
          "Protocol Type": meterData.protocolType,
          "Price No.": meterData.priceNo,
          "Price Name": meterData.priceName,
          "DMA Partition": meterData.dmaPartition,
          "Supply Types": meterData.supplyTypes,
          "Device ID": meterData.deviceId,
          "Device Name": meterData.deviceName,
          "Device Type": meterData.deviceType,
          "Usage Analysis Type": meterData.usageAnalysisType,
          "Installed Time": meterData.installedTime,
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
        `Failed to update meter: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const updatedRecord = data.records?.[0];

    if (!updatedRecord) {
      throw new Error("Invalid response format: no record returned");
    }

    return {
      id: updatedRecord.id,
      createdAt: updatedRecord.fields.CreatedAt || meterData.createdAt,
      updatedAt: updatedRecord.fields.UpdatedAt || meterData.updatedAt,
      areaName: updatedRecord.fields["Area Name"] || meterData.areaName,
      accountNumber:
        updatedRecord.fields["Account Number"] || meterData.accountNumber,
      userName: updatedRecord.fields["User Name"] || meterData.userName,
      userAddress:
        updatedRecord.fields["User Address"] || meterData.userAddress,
      meterSerialNumber:
        updatedRecord.fields["Meter S/N"] || meterData.meterSerialNumber,
      meterName: updatedRecord.fields["Meter Name"] || meterData.meterName,
      meterStatus:
        updatedRecord.fields["Meter Status"] || meterData.meterStatus,
      protocolType:
        updatedRecord.fields["Protocol Type"] || meterData.protocolType,
      priceNo: updatedRecord.fields["Price No."] || meterData.priceNo,
      priceName: updatedRecord.fields["Price Name"] || meterData.priceName,
      dmaPartition:
        updatedRecord.fields["DMA Partition"] || meterData.dmaPartition,
      supplyTypes:
        updatedRecord.fields["Supply Types"] || meterData.supplyTypes,
      deviceId: updatedRecord.fields["Device ID"] || meterData.deviceId,
      deviceName: updatedRecord.fields["Device Name"] || meterData.deviceName,
      deviceType: updatedRecord.fields["Device Type"] || meterData.deviceType,
      usageAnalysisType:
        updatedRecord.fields["Usage Analysis Type"] ||
        meterData.usageAnalysisType,
      installedTime:
        updatedRecord.fields["Installed Time"] || meterData.installedTime,
    };
  } catch (error) {
    console.error("Error updating meter:", error);
    throw error;
  }
};

export const deleteMeter = async (id: string): Promise<void> => {
  try {
    const response = await fetch(METERS_API_URL, {
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
        `Failed to delete meter: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Error deleting meter:", error);
    throw error;
  }
};

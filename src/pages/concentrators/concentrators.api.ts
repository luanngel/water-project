export const createConcentrator = async (concentratorData: {
  "Area Name": string;
  "Device S/N": string;
  "Device Name": string;
  "Device Time": string;
  "Device Status": string;
  "Operator": string;
  "Installed Time": string;
  "Communication Time": string;
  "Instruction Manual": string;
}): Promise<void> => {
  try {
    // const response = await fetch('/api/v3/data/ppfu31vhv5gf6i0/mqqvi3woqdw5ziq/records', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ fields: concentratorData }),
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to create concentrator');
    // }

    console.log('Creating concentrator with data:', concentratorData);
  } catch (error) {
    console.error('Error creating concentrator:', error);
    throw error;
  }
};

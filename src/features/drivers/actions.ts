"use server";

export const getSelectedDriver = async (driverID: string) => {
	const response = await fetch(`http://127.0.0.1:3000/api/drivers/${driverID}`);

	return (await response.json()).result[0];
};

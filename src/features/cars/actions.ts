"use server";

export const getSelectedCar = async (carID: string) => {
  const response = await fetch(`http://127.0.0.1:3000/api/cars/${carID}`);

  return (await response.json()).result[0];
};

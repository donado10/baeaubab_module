import React from "react";
import { BiSolidError } from "react-icons/bi";
import { FaCircleCheck } from "react-icons/fa6";
import { IoIosInformationCircle } from "react-icons/io";

export const ToastInfo = ({ toastTitle }: { toastTitle: string }) => {
  return (
    <div className="flex items-center gap-4 text-white">
      <span>
        <IoIosInformationCircle className="h-6 w-6" />
      </span>
      <h1>{toastTitle}</h1>
    </div>
  );
};

export const ToastError = ({ toastTitle }: { toastTitle: string }) => {
  return (
    <div className="flex items-center gap-4 text-white">
      <span>
        <BiSolidError className="h-6 w-6" />
      </span>
      <h1>{toastTitle}</h1>
    </div>
  );
};
export const ToastSuccess = ({ toastTitle }: { toastTitle: string }) => {
  return (
    <div className="flex items-center gap-4 text-white">
      <span>
        <FaCircleCheck className="h-6 w-6" />
      </span>
      <h1>{toastTitle}</h1>
    </div>
  );
};

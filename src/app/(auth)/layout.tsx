import React, { ReactNode } from "react";

type Props = {};

const layout = ({ children }: { children: ReactNode }) => {

  
  return (
    <div className="w-full flex items-center justify-center">{children}</div>
  );
};

export default layout;

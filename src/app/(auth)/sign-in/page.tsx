import { getCurrent } from "@/features/auth/action";
import SignInCard from "@/features/auth/components/sign-in";
import { redirect } from "next/navigation";
import React from "react";

type Props = {};

const page = async () => {

  const user = await getCurrent()

  if (user) {
    return redirect('/m1/reporting')
  }

  return <SignInCard />;
};

export default page;

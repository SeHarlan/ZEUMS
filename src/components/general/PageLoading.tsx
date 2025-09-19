import { FC } from "react";
import AutomatedProgress from "./AutomatedProgress";
import Logo from "./Logo";

const PageLoading: FC<{ complete: boolean, loading: boolean }> = ({ complete, loading }) => {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-screen w-full max-w-2xl mx-auto p-8">
      <Logo />
      <AutomatedProgress complete={complete} loading={loading} />
    </div>
  );
};

export default PageLoading;
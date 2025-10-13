import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const ASM = lazy(() => import("../../Components/Team/ASM"));
const ASMPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <ASM />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default ASMPage;

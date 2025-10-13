import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Permission = lazy(() => import("../../Components/Team/Permission"));
const PermissionPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Permission />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default PermissionPage;

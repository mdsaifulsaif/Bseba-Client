import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const AddStockDetails = lazy(() =>
  import("../../Components/Product/AddStockDetails")
);

const AddStockDetailsPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <AddStockDetails />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default AddStockDetailsPage;

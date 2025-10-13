import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const AddStockList = lazy(() =>
  import("../../Components/Product/AddStockList")
);

const AddStockListPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <AddStockList />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default AddStockListPage;

import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const ProductSaleReport = lazy(() =>
  import("../../Components/Report/ProductSaleReport")
);
const ProductSaleReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <ProductSaleReport />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default ProductSaleReportPage;

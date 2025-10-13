import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const PostTransiction = lazy(() =>
  import("../../Components/Officers/PostTransiction")
);

const PostTransictionPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <PostTransiction />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default PostTransictionPage;

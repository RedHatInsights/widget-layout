import React, { Suspense, lazy } from 'react';
import { Routes as DomRoutes, Route } from 'react-router-dom';

import { Bullseye, Spinner } from '@patternfly/react-core';

const Default = lazy(() => import(/* webpackChunkName: "DefaultRoute" */ './Routes/Default/Default'));
const NotFound = lazy(() => import(/* webpackCunkName: "NotFound" */ './Routes/404/404'));

const Routes = () => (
  <Suspense
    fallback={
      <Bullseye>
        <Spinner />
      </Bullseye>
    }
  >
    <DomRoutes>
      <Route path="/" element={<Default />} />
      <Route path="*" element={<NotFound />} />
    </DomRoutes>
  </Suspense>
);

export default Routes;

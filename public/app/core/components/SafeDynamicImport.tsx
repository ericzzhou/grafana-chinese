import React, { lazy, Suspense, FunctionComponent } from 'react';
import { cx, css } from 'emotion';
import { LoadingPlaceholder, ErrorBoundary, Button } from '@grafana/ui';

export const LoadingChunkPlaceHolder: FunctionComponent = () => (
  <div className={cx('preloader')}>
    <LoadingPlaceholder text={'加载中...'} />
  </div>
);

function getAlertPageStyle() {
  return css`
    width: 508px;
    margin: 128px auto;
  `;
}

export const SafeDynamicImport = (importStatement: Promise<any>) => ({ ...props }) => {
  const LazyComponent = lazy(() => importStatement);
  return (
    <ErrorBoundary>
      {({ error, errorInfo }) => {
        if (!errorInfo) {
          return (
            <Suspense fallback={<LoadingChunkPlaceHolder />}>
              <LazyComponent {...props} />
            </Suspense>
          );
        }

        return (
          <div className={getAlertPageStyle()}>
            <h2>无法找到应用程序文件</h2>
            <br />
            <h2 className="page-heading">Grafana可能已经更新。 请尝试重新加载页面.</h2>
            <br />
            <div className="gf-form-group">
              <Button size={'md'} variant={'secondary'} icon="fa fa-repeat" onClick={() => window.location.reload()}>
                刷新
              </Button>
            </div>
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {error && error.toString()}
              <br />
              {errorInfo.componentStack}
            </details>
          </div>
        );
      }}
    </ErrorBoundary>
  );
};

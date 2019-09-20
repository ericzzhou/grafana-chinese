import React from 'react';

export interface Props {
  apiKey: string;
  rootPath: string;
}

export const ApiKeysAddedModal = (props: Props) => {
  return (
    <div className="modal-body">
      <div className="modal-header">
        <h2 className="modal-header-title">
          <i className="fa fa-key" />
          <span className="p-l-1">API Key 已创建</span>
        </h2>

        <a className="modal-header-close" ng-click="dismiss();">
          <i className="fa fa-remove" />
        </a>
      </div>

      <div className="modal-content">
        <div className="gf-form-group">
          <div className="gf-form">
            <span className="gf-form-label">Key</span>
            <span className="gf-form-label">{props.apiKey}</span>
          </div>
        </div>

        <div className="grafana-info-box" style={{ border: 0 }}>
          您只能在此处查看此密钥一次！ 它不以此形式存储。 所以一定要立即复制它。
          <br />
          <br />
          您可以使用Authorization HTTP标头验证请求，例如：
          <br />
          <br />
          <pre className="small">
            curl -H "Authorization: Bearer {props.apiKey}" {props.rootPath}/api/dashboards/home
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ApiKeysAddedModal;

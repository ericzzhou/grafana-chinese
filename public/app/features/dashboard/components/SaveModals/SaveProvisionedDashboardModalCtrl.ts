import angular from 'angular';
import { saveAs } from 'file-saver';
import coreModule from 'app/core/core_module';
import { DashboardModel } from '../../state';
import { DashboardSrv } from '../../services/DashboardSrv';

const template = `
<div class="modal-body">
  <div class="modal-header">
    <h2 class="modal-header-title">
      <i class="fa fa-save"></i><span class="p-l-1">无法保存已设置的仪表板</span>
    </h2>

    <a class="modal-header-close" ng-click="ctrl.dismiss();">
      <i class="fa fa-remove"></i>
    </a>
  </div>

  <div class="modal-content">
    <small>
     无法从Grafana的UI保存此仪表板，因为它是从其他源设置的。
复制json或将其保存到下面的文件中。然后可以在相应的配置源中更新仪表板。<br/>
      <i>查看 <a class="external-link" href="http://docs.grafana.org/administration/provisioning/#dashboards" target="_blank">
      文档</a> 有关资源调配的详细信息.</i>
    </small>
    <div class="p-t-1">
      File path: {{ctrl.dashboardModel.meta.provisionedExternalId}}
    </div>
    <div class="p-t-2">
      <div class="gf-form">
        <code-editor content="ctrl.dashboardJson" data-mode="json" data-max-lines=15></code-editor>
      </div>
      <div class="gf-form-button-row">
        <button class="btn btn-primary" clipboard-button="ctrl.getJsonForClipboard()">
          复制 JSON 到剪贴板
        </button>
        <button class="btn btn-secondary" clipboard-button="ctrl.save()">
          保存 JSON 到文件
        </button>
        <a class="btn btn-link" ng-click="ctrl.dismiss();">取消</a>
      </div>
    </div>
  </div>
</div>
`;

export class SaveProvisionedDashboardModalCtrl {
  dash: any;
  dashboardModel: DashboardModel;
  dashboardJson: string;
  dismiss: () => void;

  /** @ngInject */
  constructor(dashboardSrv: DashboardSrv) {
    this.dashboardModel = dashboardSrv.getCurrent();
    this.dash = this.dashboardModel.getSaveModelClone();
    delete this.dash.id;
    this.dashboardJson = angular.toJson(this.dash, true);
  }

  save() {
    const blob = new Blob([angular.toJson(this.dash, true)], {
      type: 'application/json;charset=utf-8',
    });
    saveAs(blob, this.dash.title + '-' + new Date().getTime() + '.json');
  }

  getJsonForClipboard() {
    return this.dashboardJson;
  }
}

export function saveProvisionedDashboardModalDirective() {
  return {
    restrict: 'E',
    template: template,
    controller: SaveProvisionedDashboardModalCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: { dismiss: '&' },
  };
}

coreModule.directive('saveProvisionedDashboardModal', saveProvisionedDashboardModalDirective);

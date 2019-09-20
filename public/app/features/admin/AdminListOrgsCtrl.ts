import { BackendSrv } from 'app/core/services/backend_srv';
import { NavModelSrv } from 'app/core/core';

export default class AdminListOrgsCtrl {
  /** @ngInject */
  constructor($scope: any, backendSrv: BackendSrv, navModelSrv: NavModelSrv) {
    $scope.init = () => {
      $scope.navModel = navModelSrv.getNav('admin', 'global-orgs', 0);
      $scope.getOrgs();
    };

    $scope.getOrgs = () => {
      backendSrv.get('/api/orgs').then((orgs: any) => {
        $scope.orgs = orgs;
      });
    };

    $scope.deleteOrg = (org: any) => {
      $scope.appEvent('confirm-modal', {
        title: '删除',
        text: '是否要删除组织 ' + org.name + '?',
        text2: '将删除该组织的所有仪表板!',
        icon: 'fa-trash',
        yesText: '删除',
        onConfirm: () => {
          backendSrv.delete('/api/orgs/' + org.id).then(() => {
            $scope.getOrgs();
          });
        },
      });
    };

    $scope.init();
  }
}

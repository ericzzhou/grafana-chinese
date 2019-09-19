import angular from 'angular';
import _ from 'lodash';
import { DashboardModel } from 'app/features/dashboard/state';

export let iconMap = {
  'external link': 'fa-external-link',
  dashboard: 'fa-th-large',
  question: 'fa-question',
  info: 'fa-info',
  bolt: 'fa-bolt',
  doc: 'fa-file-text-o',
  cloud: 'fa-cloud',
};

export class DashLinksEditorCtrl {
  dashboard: DashboardModel;
  iconMap: any;
  mode: any;
  link: any;

  emptyListCta = {
    title: '尚未添加仪表板链接',
    buttonIcon: 'gicon gicon-link',
    buttonTitle: '添加仪表板链接',
    infoBox: {
      __html: `<p>
     仪表板链接允许您将指向其他仪表板和网站的链接直接放置在仪表板下面报头。
    </p>`,
    },
    infoBoxTitle: '什么是仪表板链接?',
  };

  /** @ngInject */
  constructor($scope: any, $rootScope: any) {
    this.iconMap = iconMap;
    this.dashboard.links = this.dashboard.links || [];
    this.mode = 'list';

    $scope.$on('$destroy', () => {
      $rootScope.appEvent('dash-links-updated');
    });
  }

  backToList() {
    this.mode = 'list';
  }

  setupNew = () => {
    this.mode = 'new';
    this.link = { type: 'dashboards', icon: 'external link' };
  };

  addLink() {
    this.dashboard.links.push(this.link);
    this.mode = 'list';
    this.dashboard.updateSubmenuVisibility();
  }

  editLink(link: any) {
    this.link = link;
    this.mode = 'edit';
    console.log(this.link);
  }

  saveLink() {
    this.backToList();
  }

  moveLink(index: string | number, dir: string | number) {
    // @ts-ignore
    _.move(this.dashboard.links, index, index + dir);
  }

  deleteLink(index: number) {
    this.dashboard.links.splice(index, 1);
    this.dashboard.updateSubmenuVisibility();
  }
}

function dashLinksEditor() {
  return {
    restrict: 'E',
    controller: DashLinksEditorCtrl,
    templateUrl: 'public/app/features/dashboard/components/DashLinks/editor.html',
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {
      dashboard: '=',
    },
  };
}

angular.module('grafana.directives').directive('dashLinksEditor', dashLinksEditor);

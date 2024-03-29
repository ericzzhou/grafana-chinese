import _ from 'lodash';
import angular, { ILocationService, IQService } from 'angular';

import locationUtil from 'app/core/utils/location_util';
import { DashboardModel } from '../../state/DashboardModel';
import { HistoryListOpts, RevisionsModel, CalculateDiffOptions, HistorySrv } from './HistorySrv';
import { dateTime, toUtc, DateTimeInput } from '@grafana/data';

export class HistoryListCtrl {
  appending: boolean;
  dashboard: DashboardModel;
  delta: { basic: string; json: string };
  diff: string;
  limit: number;
  loading: boolean;
  max: number;
  mode: string;
  revisions: RevisionsModel[];
  start: number;
  newInfo: RevisionsModel;
  baseInfo: RevisionsModel;
  canCompare: boolean;
  isNewLatest: boolean;

  /** @ngInject */
  constructor(
    private $route: any,
    private $rootScope: any,
    private $location: ILocationService,
    private $q: IQService,
    private historySrv: HistorySrv,
    public $scope: any
  ) {
    this.appending = false;
    this.diff = 'basic';
    this.limit = 10;
    this.loading = false;
    this.max = 2;
    this.mode = 'list';
    this.start = 0;
    this.canCompare = false;

    this.$rootScope.onAppEvent('dashboard-saved', this.onDashboardSaved.bind(this), $scope);
    this.resetFromSource();
  }

  onDashboardSaved() {
    this.resetFromSource();
  }

  switchMode(mode: string) {
    this.mode = mode;
    if (this.mode === 'list') {
      this.reset();
    }
  }

  dismiss() {
    this.$rootScope.appEvent('hide-dash-editor');
  }

  addToLog() {
    this.start = this.start + this.limit;
    this.getLog(true);
  }

  revisionSelectionChanged() {
    const selected = _.filter(this.revisions, { checked: true }).length;
    this.canCompare = selected === 2;
  }

  formatDate(date: DateTimeInput) {
    return this.dashboard.formatDate(date);
  }

  formatBasicDate(date: DateTimeInput) {
    const now = this.dashboard.timezone === 'browser' ? dateTime() : toUtc();
    const then = this.dashboard.timezone === 'browser' ? dateTime(date) : toUtc(date);
    return then.from(now);
  }

  getDiff(diff: string) {
    this.diff = diff;
    this.mode = 'compare';

    // have it already been fetched?
    // @ts-ignore
    if (this.delta[this.diff]) {
      // @ts-ignore
      return this.$q.when(this.delta[this.diff]);
    }

    const selected = _.filter(this.revisions, { checked: true });

    this.newInfo = selected[0];
    this.baseInfo = selected[1];
    this.isNewLatest = this.newInfo.version === this.dashboard.version;

    this.loading = true;
    const options: CalculateDiffOptions = {
      new: {
        dashboardId: this.dashboard.id,
        version: this.newInfo.version,
      },
      base: {
        dashboardId: this.dashboard.id,
        version: this.baseInfo.version,
      },
      diffType: diff,
    };

    return this.historySrv
      .calculateDiff(options)
      .then((response: any) => {
        // @ts-ignore
        this.delta[this.diff] = response;
      })
      .catch(() => {
        this.mode = 'list';
      })
      .finally(() => {
        this.loading = false;
      });
  }

  getLog(append = false) {
    this.loading = !append;
    this.appending = append;
    const options: HistoryListOpts = {
      limit: this.limit,
      start: this.start,
    };

    return this.historySrv
      .getHistoryList(this.dashboard, options)
      .then((revisions: any) => {
        // set formatted dates & default values
        for (const rev of revisions) {
          rev.createdDateString = this.formatDate(rev.created);
          rev.ageString = this.formatBasicDate(rev.created);
          rev.checked = false;
        }

        this.revisions = append ? this.revisions.concat(revisions) : revisions;
      })
      .catch((err: any) => {
        this.loading = false;
      })
      .finally(() => {
        this.loading = false;
        this.appending = false;
      });
  }

  isLastPage() {
    return _.find(this.revisions, rev => rev.version === 1);
  }

  reset() {
    this.delta = { basic: '', json: '' };
    this.diff = 'basic';
    this.mode = 'list';
    this.revisions = _.map(this.revisions, rev => _.extend({}, rev, { checked: false }));
    this.canCompare = false;
    this.start = 0;
    this.isNewLatest = false;
  }

  resetFromSource() {
    this.revisions = [];
    return this.getLog().then(this.reset.bind(this));
  }

  restore(version: number) {
    this.$rootScope.appEvent('confirm-modal', {
      title: '还原版本',
      text: '',
      text2: `确实要将仪表板还原到${version}版本吗？所有未保存的更改都将丢失。`,
      icon: 'fa-history',
      yesText: `是，还原到版本 ${version}`,
      onConfirm: this.restoreConfirm.bind(this, version),
    });
  }

  restoreConfirm(version: number) {
    this.loading = true;
    return this.historySrv
      .restoreDashboard(this.dashboard, version)
      .then((response: any) => {
        this.$location.url(locationUtil.stripBaseFromUrl(response.url)).replace();
        this.$route.reload();
        this.$rootScope.appEvent('alert-success', ['Dashboard restored', 'Restored from version ' + version]);
      })
      .catch(() => {
        this.mode = 'list';
        this.loading = false;
      });
  }
}

export function dashboardHistoryDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app/features/dashboard/components/VersionHistory/template.html',
    controller: HistoryListCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {
      dashboard: '=',
    },
  };
}

angular.module('grafana.directives').directive('gfDashboardHistory', dashboardHistoryDirective);

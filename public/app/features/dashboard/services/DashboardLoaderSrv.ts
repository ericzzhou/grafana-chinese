/* tslint:disable:import-blacklist */
import angular, { IQService } from 'angular';
import moment from 'moment';
import _ from 'lodash';
import $ from 'jquery';
import kbn from 'app/core/utils/kbn';
import { dateMath } from '@grafana/data';
import impressionSrv from 'app/core/services/impression_srv';
import { BackendSrv } from 'app/core/services/backend_srv';
import { DashboardSrv } from './DashboardSrv';
import DatasourceSrv from 'app/features/plugins/datasource_srv';
import { UrlQueryValue } from '@grafana/runtime';

export class DashboardLoaderSrv {
  /** @ngInject */
  constructor(
    private backendSrv: BackendSrv,
    private dashboardSrv: DashboardSrv,
    private datasourceSrv: DatasourceSrv,
    private $http: any,
    private $q: IQService,
    private $timeout: any,
    contextSrv: any,
    private $routeParams: any,
    private $rootScope: any
  ) {}

  _dashboardLoadFailed(title: string, snapshot?: boolean) {
    snapshot = snapshot || false;
    return {
      meta: {
        canStar: false,
        isSnapshot: snapshot,
        canDelete: false,
        canSave: false,
        canEdit: false,
        dashboardNotFound: true,
      },
      dashboard: { title },
    };
  }

  loadDashboard(type: UrlQueryValue, slug: any, uid: any) {
    let promise;

    if (type === 'script') {
      promise = this._loadScriptedDashboard(slug);
    } else if (type === 'snapshot') {
      promise = this.backendSrv.get('/api/snapshots/' + slug).catch(() => {
        return this._dashboardLoadFailed('Snapshot not found', true);
      });
    } else {
      promise = this.backendSrv
        .getDashboardByUid(uid)
        .then((result: any) => {
          if (result.meta.isFolder) {
            this.$rootScope.appEvent('alert-error', ['Dashboard not found']);
            throw new Error('未找到仪表板');
          }
          return result;
        })
        .catch(() => {
          return this._dashboardLoadFailed('Not found', true);
        });
    }

    promise.then((result: any) => {
      if (result.meta.dashboardNotFound !== true) {
        impressionSrv.addDashboardImpression(result.dashboard.id);
      }

      return result;
    });

    return promise;
  }

  _loadScriptedDashboard(file: string) {
    const url = 'public/dashboards/' + file.replace(/\.(?!js)/, '/') + '?' + new Date().getTime();

    return this.$http({ url: url, method: 'GET' })
      .then(this._executeScript.bind(this))
      .then(
        (result: any) => {
          return {
            meta: {
              fromScript: true,
              canDelete: false,
              canSave: false,
              canStar: false,
            },
            dashboard: result.data,
          };
        },
        (err: any) => {
          console.log('Script dashboard error ' + err);
          this.$rootScope.appEvent('alert-error', ['Script Error', '请确保它存在并返回有效的仪表板']);
          return this._dashboardLoadFailed('Scripted dashboard');
        }
      );
  }

  _executeScript(result: any) {
    const services = {
      dashboardSrv: this.dashboardSrv,
      datasourceSrv: this.datasourceSrv,
      $q: this.$q,
    };

    /*jshint -W054 */
    const scriptFunc = new Function(
      'ARGS',
      'kbn',
      'dateMath',
      '_',
      'moment',
      'window',
      'document',
      '$',
      'jQuery',
      'services',
      result.data
    );
    const scriptResult = scriptFunc(this.$routeParams, kbn, dateMath, _, moment, window, document, $, $, services);

    // Handle async dashboard scripts
    if (_.isFunction(scriptResult)) {
      const deferred = this.$q.defer();
      scriptResult((dashboard: any) => {
        this.$timeout(() => {
          deferred.resolve({ data: dashboard });
        });
      });
      return deferred.promise;
    }

    return { data: scriptResult };
  }
}

angular.module('grafana.services').service('dashboardLoaderSrv', DashboardLoaderSrv);

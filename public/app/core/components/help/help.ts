import coreModule from '../../core_module';
import appEvents from 'app/core/app_events';

export class HelpCtrl {
  tabIndex: any;
  shortcuts: any;

  /** @ngInject */
  constructor() {
    this.tabIndex = 0;
    this.shortcuts = {
      Global: [
        { keys: ['g', 'h'], description: '转到主页仪表板' },
        { keys: ['g', 'p'], description: '转到个人资料' },
        { keys: ['s', 'o'], description: '打开搜索' },
        { keys: ['esc'], description: '退出编辑/设置视图' },
      ],
      Dashboard: [
        { keys: ['mod+s'], description: '保存仪表盘' },
        { keys: ['d', 'r'], description: '刷新所有面板' },
        { keys: ['d', 's'], description: '仪表盘设置' },
        { keys: ['d', 'v'], description: 'Toggle in-active / view mode' },
        { keys: ['d', 'k'], description: 'Toggle kiosk mode (hides top nav)' },
        { keys: ['d', 'E'], description: '展开所有行' },
        { keys: ['d', 'C'], description: '折叠所有行' },
        { keys: ['d', 'a'], description: 'Toggle auto fit panels (experimental feature)' },
        { keys: ['mod+o'], description: 'Toggle shared graph crosshair' },
        { keys: ['d', 'l'], description: '切换所有面板图例' },
      ],
      'Focused Panel': [
        { keys: ['e'], description: 'Toggle panel edit view' },
        { keys: ['v'], description: 'Toggle panel fullscreen view' },
        { keys: ['p', 's'], description: '打开面板共享模式' },
        { keys: ['p', 'd'], description: '复制面板' },
        { keys: ['p', 'r'], description: '删除面板' },
        { keys: ['p', 'l'], description: '切换面板图例' },
      ],
      'Time Range': [
        { keys: ['t', 'z'], description: '缩小时间范围' },
        {
          keys: ['t', '<i class="fa fa-long-arrow-left"></i>'],
          description: 'Move time range back',
        },
        {
          keys: ['t', '<i class="fa fa-long-arrow-right"></i>'],
          description: 'Move time range forward',
        },
      ],
    };
  }

  dismiss() {
    appEvents.emit('hide-modal');
  }
}

export function helpModal() {
  return {
    restrict: 'E',
    templateUrl: 'public/app/core/components/help/help.html',
    controller: HelpCtrl,
    bindToController: true,
    transclude: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

coreModule.directive('helpModal', helpModal);

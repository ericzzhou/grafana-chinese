// Libraries
import React, { PureComponent } from 'react';

// Services & Utils
import { AngularComponent, getAngularLoader } from '@grafana/runtime';
import appEvents from 'app/core/app_events';

// Components
import { EditorTabBody, EditorToolbarView } from '../dashboard/panel_editor/EditorTabBody';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import StateHistory from './StateHistory';
import 'app/features/alerting/AlertTabCtrl';

// Types
import { DashboardModel } from '../dashboard/state/DashboardModel';
import { PanelModel } from '../dashboard/state/PanelModel';
import { TestRuleResult } from './TestRuleResult';
import { AlertBox } from 'app/core/components/AlertBox/AlertBox';
import { AppNotificationSeverity } from 'app/types';

interface Props {
  angularPanel?: AngularComponent;
  dashboard: DashboardModel;
  panel: PanelModel;
}

export class AlertTab extends PureComponent<Props> {
  element: any;
  component: AngularComponent;
  panelCtrl: any;

  componentDidMount() {
    if (this.shouldLoadAlertTab()) {
      this.loadAlertTab();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.shouldLoadAlertTab()) {
      this.loadAlertTab();
    }
  }

  shouldLoadAlertTab() {
    return this.props.angularPanel && this.element && !this.component;
  }

  componentWillUnmount() {
    if (this.component) {
      this.component.destroy();
    }
  }

  loadAlertTab() {
    const { angularPanel } = this.props;

    const scope = angularPanel.getScope();

    // When full page reloading in edit mode the angular panel has on fully compiled & instantiated yet
    if (!scope.$$childHead) {
      setTimeout(() => {
        this.forceUpdate();
      });
      return;
    }

    this.panelCtrl = scope.$$childHead.ctrl;
    const loader = getAngularLoader();
    const template = '<alert-tab />';

    const scopeProps = { ctrl: this.panelCtrl };

    this.component = loader.load(this.element, scopeProps, template);
  }

  stateHistory = (): EditorToolbarView => {
    return {
      title: 'State history',
      render: () => {
        return (
          <StateHistory
            dashboard={this.props.dashboard}
            panelId={this.props.panel.id}
            onRefresh={this.panelCtrl.refresh}
          />
        );
      },
    };
  };

  deleteAlert = (): EditorToolbarView => {
    const { panel } = this.props;
    return {
      title: '删除',
      btnType: 'danger',
      onClick: () => {
        appEvents.emit('confirm-modal', {
          title: '删除警报',
          text: '您确定要删除此警报规则吗？?',
          text2: '您需要保存仪表板才能使删除生效',
          icon: 'fa-trash',
          yesText: '删除',
          onConfirm: () => {
            delete panel.alert;
            panel.thresholds = [];
            this.panelCtrl.alertState = null;
            this.panelCtrl.render();
            this.forceUpdate();
          },
        });
      },
    };
  };

  renderTestRuleResult = () => {
    const { panel, dashboard } = this.props;
    return <TestRuleResult panelId={panel.id} dashboard={dashboard} />;
  };

  testRule = (): EditorToolbarView => ({
    title: '测试规则',
    render: () => this.renderTestRuleResult(),
  });

  onAddAlert = () => {
    this.panelCtrl._enableAlert();
    this.component.digest();
    this.forceUpdate();
  };

  render() {
    const { alert, transformations } = this.props.panel;
    const hasTransformations = transformations && transformations.length;

    if (!alert && hasTransformations) {
      return (
        <EditorTabBody heading="Alert">
          <AlertBox severity={AppNotificationSeverity.Warning} title="警报查询不支持转换" />
        </EditorTabBody>
      );
    }

    const toolbarItems = alert ? [this.stateHistory(), this.testRule(), this.deleteAlert()] : [];

    const model = {
      title: 'Panel没有定义警报规则',
      buttonIcon: 'gicon gicon-alert',
      onClick: this.onAddAlert,
      buttonTitle: '创建警报',
    };

    return (
      <EditorTabBody heading="Alert" toolbarItems={toolbarItems}>
        <>
          {alert && hasTransformations && (
            <AlertBox severity={AppNotificationSeverity.Error} title="警报查询不支持转换" />
          )}

          <div ref={element => (this.element = element)} />
          {!alert && <EmptyListCTA {...model} />}
        </>
      </EditorTabBody>
    );
  }
}

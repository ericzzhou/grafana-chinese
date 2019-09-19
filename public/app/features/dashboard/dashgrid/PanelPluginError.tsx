// Libraries
import _ from 'lodash';
import React, { PureComponent, ReactNode } from 'react';

// Components
import { AlertBox } from 'app/core/components/AlertBox/AlertBox';

// Types
import { AppNotificationSeverity } from 'app/types';
import { PanelProps, PanelPlugin, PluginType, PanelPluginMeta } from '@grafana/ui';

interface Props {
  title: string;
  text?: ReactNode;
}

class PanelPluginError extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const style = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    };

    return (
      <div style={style}>
        <AlertBox severity={AppNotificationSeverity.Error} {...this.props} />
      </div>
    );
  }
}

export function getPanelPluginLoadError(meta: PanelPluginMeta, err: any): PanelPlugin {
  const LoadError = class LoadError extends PureComponent<PanelProps> {
    render() {
      const text = (
        <>
          检查服务器启动日志以获取更多信息。 <br />
          如果从git加载此插件，请确保它已编译.
        </>
      );
      return <PanelPluginError title={`Error loading: ${meta.id}`} text={text} />;
    }
  };
  const plugin = new PanelPlugin(LoadError);
  plugin.meta = meta;
  plugin.loadError = true;
  return plugin;
}

export function getPanelPluginNotFound(id: string): PanelPlugin {
  const NotFound = class NotFound extends PureComponent<PanelProps> {
    render() {
      return <PanelPluginError title={`找不到面板插件: ${id}`} />;
    }
  };

  const plugin = new PanelPlugin(NotFound);
  plugin.meta = {
    id: id,
    name: id,
    sort: 100,
    type: PluginType.panel,
    module: '',
    baseUrl: '',
    info: {
      author: {
        name: '',
      },
      description: '',
      links: [],
      logos: {
        large: '',
        small: '',
      },
      screenshots: [],
      updated: '',
      version: '',
    },
  };
  return plugin;
}

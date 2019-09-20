import React from 'react';
import { LegendOptions, PanelOptionsGroup, Switch, Input, StatsPicker } from '@grafana/ui';

export interface GraphLegendEditorLegendOptions extends LegendOptions {
  stats?: string[];
  decimals?: number;
  sortBy?: string;
  sortDesc?: boolean;
}

interface GraphLegendEditorProps {
  options: GraphLegendEditorLegendOptions;
  onChange: (options: GraphLegendEditorLegendOptions) => void;
}

export const GraphLegendEditor: React.FunctionComponent<GraphLegendEditorProps> = props => {
  const { options, onChange } = props;

  const onStatsChanged = (stats: string[]) => {
    onChange({
      ...options,
      stats,
    });
  };

  const onOptionToggle = (option: keyof LegendOptions) => (event?: React.SyntheticEvent<HTMLInputElement>) => {
    const newOption = {};
    if (!event) {
      return;
    }
    // TODO: fix the ignores
    // @ts-ignore
    newOption[option] = event.target.checked;
    if (option === 'placement') {
      // @ts-ignore
      newOption[option] = event.target.checked ? 'right' : 'under';
    }

    onChange({
      ...options,
      ...newOption,
    });
  };

  const labelWidth = 8;
  return (
    <PanelOptionsGroup title="图例">
      <div className="section gf-form-group">
        <h4>选项</h4>
        <Switch
          label="显示图例"
          labelClass={`width-${labelWidth}`}
          checked={options.isVisible}
          onChange={onOptionToggle('isVisible')}
        />
        <Switch
          label="显示为表格"
          labelClass={`width-${labelWidth}`}
          checked={options.asTable}
          onChange={onOptionToggle('asTable')}
        />
        <Switch
          label="右对齐"
          labelClass={`width-${labelWidth}`}
          checked={options.placement === 'right'}
          onChange={onOptionToggle('placement')}
        />
      </div>

      <div className="section gf-form-group">
        <h4>显示</h4>
        <div className="gf-form">
          <StatsPicker
            allowMultiple={true}
            stats={options.stats ? options.stats : []}
            onChange={onStatsChanged}
            placeholder={'Pick Values'}
          />
        </div>

        <div className="gf-form">
          <div className="gf-form-label">Decimals</div>
          <Input
            className="gf-form-input width-5"
            type="number"
            value={options.decimals}
            placeholder="Auto"
            onChange={event => {
              onChange({
                ...options,
                decimals: parseInt(event.target.value, 10),
              });
            }}
          />
        </div>
      </div>

      <div className="section gf-form-group">
        <h4>隐藏系列</h4>
        {/* <Switch label="With only nulls" checked={!!options.hideEmpty} onChange={onOptionToggle('hideEmpty')} /> */}
        <Switch label="With only zeros" checked={!!options.hideZero} onChange={onOptionToggle('hideZero')} />
      </div>
    </PanelOptionsGroup>
  );
};

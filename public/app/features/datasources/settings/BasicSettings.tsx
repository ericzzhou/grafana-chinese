import React, { FC } from 'react';
import { FormLabel, Input, Switch } from '@grafana/ui';

export interface Props {
  dataSourceName: string;
  isDefault: boolean;
  onNameChange: (name: string) => void;
  onDefaultChange: (value: boolean) => void;
}

const BasicSettings: FC<Props> = ({ dataSourceName, isDefault, onDefaultChange, onNameChange }) => {
  return (
    <div className="gf-form-group">
      <div className="gf-form-inline">
        <div className="gf-form max-width-30" style={{ marginRight: '3px' }}>
          <FormLabel tooltip={'在面板中选择数据源时使用该名称 ' + '在新面板中预选默认数据源.'}>名称</FormLabel>
          <Input
            className="gf-form-input max-width-23"
            type="text"
            value={dataSourceName}
            placeholder="名称"
            onChange={event => onNameChange(event.target.value)}
            required
          />
        </div>
        {/*
        //@ts-ignore */}
        <Switch label="默认" checked={isDefault} onChange={event => onDefaultChange(event.target.checked)} />
      </div>
    </div>
  );
};

export default BasicSettings;

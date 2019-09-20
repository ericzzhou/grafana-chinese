import React, { useState, ChangeEvent, useContext } from 'react';
import { DataLink } from '@grafana/data';
import { FormField, Switch } from '../index';
import { VariableSuggestion } from './DataLinkSuggestions';
import { css } from 'emotion';
import { ThemeContext } from '../../themes/index';
import { DataLinkInput } from './DataLinkInput';

interface DataLinkEditorProps {
  index: number;
  isLast: boolean;
  value: DataLink;
  suggestions: VariableSuggestion[];
  onChange: (index: number, link: DataLink) => void;
  onRemove: (link: DataLink) => void;
}

export const DataLinkEditor: React.FC<DataLinkEditorProps> = React.memo(
  ({ index, value, onChange, onRemove, suggestions, isLast }) => {
    const theme = useContext(ThemeContext);
    const [title, setTitle] = useState(value.title);

    const onUrlChange = (url: string) => {
      onChange(index, { ...value, url });
    };
    const onTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
      setTitle(event.target.value);
    };

    const onTitleBlur = () => {
      onChange(index, { ...value, title: title });
    };

    const onRemoveClick = () => {
      onRemove(value);
    };

    const onOpenInNewTabChanged = () => {
      onChange(index, { ...value, targetBlank: !value.targetBlank });
    };

    const listItemStyle = css`
      margin-bottom: ${theme.spacing.sm};
    `;

    const infoTextStyle = css`
      padding-bottom: ${theme.spacing.md};
      margin-left: 66px;
      color: ${theme.colors.textWeak};
    `;

    return (
      <div className={listItemStyle}>
        <div className="gf-form gf-form--inline">
          <FormField
            className="gf-form--grow"
            label="标题"
            value={title}
            onChange={onTitleChange}
            onBlur={onTitleBlur}
            inputWidth={0}
            labelWidth={5}
            placeholder="显示详情"
          />
          <Switch label="新页面打开" checked={value.targetBlank || false} onChange={onOpenInNewTabChanged} />
          <button className="gf-form-label gf-form-label--btn" onClick={onRemoveClick} title="删除连接">
            <i className="fa fa-times" />
          </button>
        </div>
        <FormField
          label="网址"
          labelWidth={5}
          inputEl={<DataLinkInput value={value.url} onChange={onUrlChange} suggestions={suggestions} />}
          className={css`
            width: 100%;
          `}
        />
        {isLast && (
          <div className={infoTextStyle}>
            用数据链接，您可以引用数据变量，如系列名称，标签和值。 键入CMD + Space，CTRL + Space或$以打开变量建议
          </div>
        )}
      </div>
    );
  }
);

DataLinkEditor.displayName = 'DataLinkEditor';

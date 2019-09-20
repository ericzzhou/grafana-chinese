import React, { FC } from 'react';
import config from 'app/core/config';

export interface Props {
  isReadOnly: boolean;
  onDelete: () => void;
  onSubmit: (event: any) => void;
  onTest: (event: any) => void;
}

const ButtonRow: FC<Props> = ({ isReadOnly, onDelete, onSubmit, onTest }) => {
  return (
    <div className="gf-form-button-row">
      {!isReadOnly && (
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isReadOnly}
          onClick={event => onSubmit(event)}
          aria-label="保存和测试按钮"
        >
          保存 &amp; 测试
        </button>
      )}
      {isReadOnly && (
        <button type="submit" className="btn btn-success" onClick={onTest}>
          测试
        </button>
      )}
      <button type="submit" className="btn btn-danger" disabled={isReadOnly} onClick={onDelete}>
        删除
      </button>
      <a className="btn btn-inverse" href={`${config.appSubUrl}/datasources`}>
        返回
      </a>
    </div>
  );
};

export default ButtonRow;

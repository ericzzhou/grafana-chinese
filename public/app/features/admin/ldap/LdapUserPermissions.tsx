import React, { FC } from 'react';
import { LdapPermissions } from 'app/types';

interface Props {
  permissions: LdapPermissions;
}

export const LdapUserPermissions: FC<Props> = ({ permissions }) => {
  return (
    <div className="gf-form-group">
      <div className="gf-form">
        <table className="filter-table form-inline">
          <thead>
            <tr>
              <th colSpan={1}>权限</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="width-16"> Grafana 管理员</td>
              <td>
                {permissions.isGrafanaAdmin ? (
                  <>
                    <i className="gicon gicon-shield" /> 是
                  </>
                ) : (
                  '否'
                )}
              </td>
            </tr>
            <tr>
              <td className="width-16">状态</td>
              <td>
                {permissions.isDisabled ? (
                  <>
                    <i className="fa fa-fw fa-times" /> 停用
                  </>
                ) : (
                  <>
                    <i className="fa fa-fw fa-check" /> 激活
                  </>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

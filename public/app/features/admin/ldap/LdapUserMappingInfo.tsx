import React, { FC } from 'react';
import { LdapUserInfo } from 'app/types';

interface Props {
  info: LdapUserInfo;
  showAttributeMapping?: boolean;
}

export const LdapUserMappingInfo: FC<Props> = ({ info, showAttributeMapping }) => {
  return (
    <div className="gf-form-group">
      <div className="gf-form">
        <table className="filter-table form-inline">
          <thead>
            <tr>
              <th colSpan={2}>用户信息</th>
              {showAttributeMapping && <th>LDAP 属性</th>}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="width-16">名字</td>
              <td>{info.name.ldapValue}</td>
              {showAttributeMapping && <td>{info.name.cfgAttrValue}</td>}
            </tr>
            <tr>
              <td className="width-16">姓</td>
              <td>{info.surname.ldapValue}</td>
              {showAttributeMapping && <td>{info.surname.cfgAttrValue}</td>}
            </tr>
            <tr>
              <td className="width-16">用户名</td>
              <td>{info.login.ldapValue}</td>
              {showAttributeMapping && <td>{info.login.cfgAttrValue}</td>}
            </tr>
            <tr>
              <td className="width-16">电子邮箱</td>
              <td>{info.email.ldapValue}</td>
              {showAttributeMapping && <td>{info.email.cfgAttrValue}</td>}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

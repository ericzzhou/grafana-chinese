import React, { FC } from 'react';
import { User } from 'app/types';

interface Props {
  user: User;
}

export const UserInfo: FC<Props> = ({ user }) => {
  return (
    <div className="gf-form-group">
      <div className="gf-form">
        <table className="filter-table form-inline">
          <thead>
            <tr>
              <th colSpan={2}>用户信息</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="width-16">名称</td>
              <td>{user.name}</td>
            </tr>
            <tr>
              <td className="width-16">用户名</td>
              <td>{user.login}</td>
            </tr>
            <tr>
              <td className="width-16">邮箱</td>
              <td>{user.email}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

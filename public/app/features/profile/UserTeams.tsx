import React, { PureComponent } from 'react';
import { Team } from 'app/types';
import { LoadingPlaceholder } from '@grafana/ui';

export interface Props {
  teams: Team[];
  isLoading: boolean;
  loadTeams: () => void;
}

export class UserTeams extends PureComponent<Props> {
  componentDidMount() {
    this.props.loadTeams();
  }

  render() {
    const { isLoading, teams } = this.props;

    if (isLoading) {
      return <LoadingPlaceholder text="加载团队..." />;
    }

    return (
      <>
        {teams.length > 0 && (
          <>
            <h3 className="page-sub-heading">团队</h3>
            <div className="gf-form-group">
              <table className="filter-table form-inline">
                <thead>
                  <tr>
                    <th />
                    <th>名称</th>
                    <th>邮箱</th>
                    <th>成员</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team: Team, index) => {
                    return (
                      <tr key={index}>
                        <td className="width-4 text-center">
                          <img className="filter-table__avatar" src={team.avatarUrl} />
                        </td>
                        <td>{team.name}</td>
                        <td>{team.email}</td>
                        <td>{team.memberCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </>
    );
  }
}

export default UserTeams;

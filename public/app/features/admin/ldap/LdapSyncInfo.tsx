import React, { PureComponent } from 'react';
import { dateTime } from '@grafana/data';
import { SyncInfo } from 'app/types';

interface Props {
  ldapSyncInfo: SyncInfo;
}

interface State {
  isSyncing: boolean;
}

const syncTimeFormat = 'dddd YYYY-MM-DD HH:mm zz';

export class LdapSyncInfo extends PureComponent<Props, State> {
  state = {
    isSyncing: false,
  };

  handleSyncClick = () => {
    console.log('Bulk-sync now');
    this.setState({ isSyncing: !this.state.isSyncing });
  };

  render() {
    const { ldapSyncInfo } = this.props;
    const { isSyncing } = this.state;
    const nextSyncTime = dateTime(ldapSyncInfo.nextSync).format(syncTimeFormat);
    const prevSyncSuccessful = ldapSyncInfo && ldapSyncInfo.prevSync;
    const prevSyncTime = prevSyncSuccessful ? dateTime(ldapSyncInfo.prevSync.started).format(syncTimeFormat) : '';

    return (
      <>
        <h3 className="page-heading">
          LDAP 同步
          <button className={`btn btn-secondary pull-right`} onClick={this.handleSyncClick} hidden={true}>
            <span className="btn-title">立即批量同步</span>
            {isSyncing && <i className="fa fa-spinner fa-fw fa-spin run-icon" />}
          </button>
        </h3>
        <div className="gf-form-group">
          <div className="gf-form">
            <table className="filter-table form-inline">
              <tbody>
                <tr>
                  <td>激活同步</td>
                  <td colSpan={2}>{ldapSyncInfo.enabled ? 'Enabled' : 'Disabled'}</td>
                </tr>
                <tr>
                  <td>计划</td>
                  <td>{ldapSyncInfo.schedule}</td>
                </tr>
                <tr>
                  <td>下次计划同步</td>
                  <td>{nextSyncTime}</td>
                </tr>
                <tr>
                  <td>最后一次同步</td>
                  {prevSyncSuccessful && (
                    <>
                      <td>{prevSyncTime}</td>
                      <td>成功</td>
                    </>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }
}

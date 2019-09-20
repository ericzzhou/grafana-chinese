import React, { PureComponent, SyntheticEvent, ChangeEvent } from 'react';
import { Tooltip } from '@grafana/ui';
import appEvents from 'app/core/app_events';

interface Props {
  onSubmit: (pw: string) => void;
  onSkip: Function;
  focus?: boolean;
}

interface State {
  newPassword: string;
  confirmNew: string;
  valid: boolean;
}

export class ChangePassword extends PureComponent<Props, State> {
  private userInput: HTMLInputElement;
  constructor(props: Props) {
    super(props);
    this.state = {
      newPassword: '',
      confirmNew: '',
      valid: false,
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (!prevProps.focus && this.props.focus) {
      this.focus();
    }
  }

  focus() {
    this.userInput.focus();
  }

  onSubmit = (e: SyntheticEvent) => {
    e.preventDefault();

    const { newPassword, valid } = this.state;
    if (valid) {
      this.props.onSubmit(newPassword);
    } else {
      appEvents.emit('alert-warning', ['New passwords do not match', '']);
    }
  };

  onNewPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      newPassword: e.target.value,
      valid: this.validate('newPassword', e.target.value),
    });
  };

  onConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      confirmNew: e.target.value,
      valid: this.validate('confirmNew', e.target.value),
    });
  };

  onSkip = (e: SyntheticEvent) => {
    this.props.onSkip();
  };

  validate(changed: string, pw: string) {
    if (changed === 'newPassword') {
      return this.state.confirmNew === pw;
    } else if (changed === 'confirmNew') {
      return this.state.newPassword === pw;
    }
    return false;
  }

  render() {
    return (
      <div className="login-inner-box" id="change-password-view">
        <div className="text-left login-change-password-info">
          <h5>更改密码</h5>
          在您开始使用精彩的信息中心之前，我们需要您通过更改来提高帐户的安全性你的密码。
          <br />
          您可以稍后再次更改密码。
        </div>
        <form className="login-form-group gf-form-group">
          <div className="login-form">
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              className="gf-form-input login-form-input"
              required
              placeholder="新密码"
              onChange={this.onNewPasswordChange}
              ref={input => {
                this.userInput = input;
              }}
            />
          </div>
          <div className="login-form">
            <input
              type="password"
              name="confirmNew"
              className="gf-form-input login-form-input"
              required
              ng-model="command.confirmNew"
              placeholder="确认密码"
              onChange={this.onConfirmPasswordChange}
            />
          </div>
          <div className="login-button-group login-button-group--right text-right">
            <Tooltip placement="bottom" content="如果您跳过，则下次登录时会提示您更改密码.">
              <a className="btn btn-link" onClick={this.onSkip}>
                跳过
              </a>
            </Tooltip>

            <button
              type="submit"
              className={`btn btn-large p-x-2 ${this.state.valid ? 'btn-primary' : 'btn-inverse'}`}
              onClick={this.onSubmit}
              disabled={!this.state.valid}
            >
              保存
            </button>
          </div>
        </form>
      </div>
    );
  }
}

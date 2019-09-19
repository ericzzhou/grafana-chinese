import React, { FC } from 'react';

export const UserSignup: FC<{}> = () => {
  return (
    <div className="login-signup-box">
      <div className="login-signup-title p-r-1">Grafana 新手?</div>
      <a href="signup" className="btn btn-medium btn-signup btn-p-x-2">
        注册
      </a>
    </div>
  );
};

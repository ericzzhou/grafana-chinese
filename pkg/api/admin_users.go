package api

import (
	"github.com/grafana/grafana/pkg/api/dtos"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/infra/metrics"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/util"
)

func AdminCreateUser(c *models.ReqContext, form dtos.AdminCreateUserForm) {
	cmd := models.CreateUserCommand{
		Login:    form.Login,
		Email:    form.Email,
		Password: form.Password,
		Name:     form.Name,
	}

	if len(cmd.Login) == 0 {
		cmd.Login = cmd.Email
		if len(cmd.Login) == 0 {
			c.JsonApiErr(400, "验证错误，需要指定用户名或电子邮件", nil)
			return
		}
	}

	if len(cmd.Password) < 4 {
		c.JsonApiErr(400, "密码太短", nil)
		return
	}

	if err := bus.Dispatch(&cmd); err != nil {
		c.JsonApiErr(500, "创建用户失败", err)
		return
	}

	metrics.MApiAdminUserCreate.Inc()

	user := cmd.Result

	result := models.UserIdDTO{
		Message: "用户创建成功",
		Id:      user.Id,
	}

	c.JSON(200, result)
}

func AdminUpdateUserPassword(c *models.ReqContext, form dtos.AdminUpdateUserPasswordForm) {
	userID := c.ParamsInt64(":id")

	if len(form.Password) < 4 {
		c.JsonApiErr(400, "新密码太短", nil)
		return
	}

	userQuery := models.GetUserByIdQuery{Id: userID}

	if err := bus.Dispatch(&userQuery); err != nil {
		c.JsonApiErr(500, "无法从数据库中读取用户", err)
		return
	}

	passwordHashed := util.EncodePassword(form.Password, userQuery.Result.Salt)

	cmd := models.ChangeUserPasswordCommand{
		UserId:      userID,
		NewPassword: passwordHashed,
	}

	if err := bus.Dispatch(&cmd); err != nil {
		c.JsonApiErr(500, "无法更新用户密码", err)
		return
	}

	c.JsonOK("用户密码已更新")
}

// PUT /api/admin/users/:id/permissions
func AdminUpdateUserPermissions(c *models.ReqContext, form dtos.AdminUpdateUserPermissionsForm) {
	userID := c.ParamsInt64(":id")

	cmd := models.UpdateUserPermissionsCommand{
		UserId:         userID,
		IsGrafanaAdmin: form.IsGrafanaAdmin,
	}

	if err := bus.Dispatch(&cmd); err != nil {
		if err == models.ErrLastGrafanaAdmin {
			c.JsonApiErr(400, models.ErrLastGrafanaAdmin.Error(), nil)
			return
		}

		c.JsonApiErr(500, "无法更新用户权限", err)
		return
	}

	c.JsonOK("用户权限已更新")
}

func AdminDeleteUser(c *models.ReqContext) {
	userID := c.ParamsInt64(":id")

	cmd := models.DeleteUserCommand{UserId: userID}

	if err := bus.Dispatch(&cmd); err != nil {
		c.JsonApiErr(500, "删除用户失败", err)
		return
	}

	c.JsonOK("用户已删除")
}

// POST /api/admin/users/:id/disable
func (server *HTTPServer) AdminDisableUser(c *models.ReqContext) Response {
	userID := c.ParamsInt64(":id")

	// External users shouldn't be disabled from API
	authInfoQuery := &models.GetAuthInfoQuery{UserId: userID}
	if err := bus.Dispatch(authInfoQuery); err != models.ErrUserNotFound {
		return Error(500, "无法禁用外部用户", nil)
	}

	disableCmd := models.DisableUserCommand{UserId: userID, IsDisabled: true}
	if err := bus.Dispatch(&disableCmd); err != nil {
		return Error(500, "无法禁用用户", err)
	}

	err := server.AuthTokenService.RevokeAllUserTokens(c.Req.Context(), userID)
	if err != nil {
		return Error(500, "无法禁用用户", err)
	}

	return Success("用户已禁用")
}

// POST /api/admin/users/:id/enable
func AdminEnableUser(c *models.ReqContext) Response {
	userID := c.ParamsInt64(":id")

	// External users shouldn't be disabled from API
	authInfoQuery := &models.GetAuthInfoQuery{UserId: userID}
	if err := bus.Dispatch(authInfoQuery); err != models.ErrUserNotFound {
		return Error(500, "无法启用外部用户", nil)
	}

	disableCmd := models.DisableUserCommand{UserId: userID, IsDisabled: false}
	if err := bus.Dispatch(&disableCmd); err != nil {
		return Error(500, "无法启用用户", err)
	}

	return Success("用户启用")
}

// POST /api/admin/users/:id/logout
func (server *HTTPServer) AdminLogoutUser(c *models.ReqContext) Response {
	userID := c.ParamsInt64(":id")

	if c.UserId == userID {
		return Error(400, "你无法自己退出", nil)
	}

	return server.logoutUserFromAllDevicesInternal(c.Req.Context(), userID)
}

// GET /api/admin/users/:id/auth-tokens
func (server *HTTPServer) AdminGetUserAuthTokens(c *models.ReqContext) Response {
	userID := c.ParamsInt64(":id")
	return server.getUserAuthTokensInternal(c, userID)
}

// POST /api/admin/users/:id/revoke-auth-token
func (server *HTTPServer) AdminRevokeUserAuthToken(c *models.ReqContext, cmd models.RevokeAuthTokenCmd) Response {
	userID := c.ParamsInt64(":id")
	return server.revokeUserAuthTokenInternal(c, userID, cmd)
}

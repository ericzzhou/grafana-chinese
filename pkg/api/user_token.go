package api

import (
	"context"
	"time"

	"github.com/grafana/grafana/pkg/api/dtos"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/util"
	"github.com/ua-parser/uap-go/uaparser"
)

// GET /api/user/auth-tokens
func (server *HTTPServer) GetUserAuthTokens(c *models.ReqContext) Response {
	return server.getUserAuthTokensInternal(c, c.UserId)
}

// POST /api/user/revoke-auth-token
func (server *HTTPServer) RevokeUserAuthToken(c *models.ReqContext, cmd models.RevokeAuthTokenCmd) Response {
	return server.revokeUserAuthTokenInternal(c, c.UserId, cmd)
}

func (server *HTTPServer) logoutUserFromAllDevicesInternal(ctx context.Context, userID int64) Response {
	userQuery := models.GetUserByIdQuery{Id: userID}

	if err := bus.Dispatch(&userQuery); err != nil {
		if err == models.ErrUserNotFound {
			return Error(404, "找不到用户", err)
		}
		return Error(500, "无法从数据库中读取用户", err)
	}

	err := server.AuthTokenService.RevokeAllUserTokens(ctx, userID)
	if err != nil {
		return Error(500, "无法注销用户", err)
	}

	return JSON(200, util.DynMap{
		"message": "用户退出了",
	})
}

func (server *HTTPServer) getUserAuthTokensInternal(c *models.ReqContext, userID int64) Response {
	userQuery := models.GetUserByIdQuery{Id: userID}

	if err := bus.Dispatch(&userQuery); err != nil {
		if err == models.ErrUserNotFound {
			return Error(404, "找不到用户", err)
		}
		return Error(500, "无法获得用户", err)
	}

	tokens, err := server.AuthTokenService.GetUserTokens(c.Req.Context(), userID)
	if err != nil {
		return Error(500, "无法获得用户身份验证令牌", err)
	}

	result := []*dtos.UserToken{}
	for _, token := range tokens {
		isActive := false
		if c.UserToken != nil && c.UserToken.Id == token.Id {
			isActive = true
		}

		parser := uaparser.NewFromSaved()
		client := parser.Parse(token.UserAgent)

		osVersion := ""
		if client.Os.Major != "" {
			osVersion = client.Os.Major

			if client.Os.Minor != "" {
				osVersion = osVersion + "." + client.Os.Minor
			}
		}

		browserVersion := ""
		if client.UserAgent.Major != "" {
			browserVersion = client.UserAgent.Major

			if client.UserAgent.Minor != "" {
				browserVersion = browserVersion + "." + client.UserAgent.Minor
			}
		}

		createdAt := time.Unix(token.CreatedAt, 0)
		seenAt := time.Unix(token.SeenAt, 0)

		if token.SeenAt == 0 {
			seenAt = createdAt
		}

		result = append(result, &dtos.UserToken{
			Id:                     token.Id,
			IsActive:               isActive,
			ClientIp:               token.ClientIp,
			Device:                 client.Device.ToString(),
			OperatingSystem:        client.Os.Family,
			OperatingSystemVersion: osVersion,
			Browser:                client.UserAgent.Family,
			BrowserVersion:         browserVersion,
			CreatedAt:              createdAt,
			SeenAt:                 seenAt,
		})
	}

	return JSON(200, result)
}

func (server *HTTPServer) revokeUserAuthTokenInternal(c *models.ReqContext, userID int64, cmd models.RevokeAuthTokenCmd) Response {
	userQuery := models.GetUserByIdQuery{Id: userID}

	if err := bus.Dispatch(&userQuery); err != nil {
		if err == models.ErrUserNotFound {
			return Error(404, "找不到用户", err)
		}
		return Error(500, "无法获得用户", err)
	}

	token, err := server.AuthTokenService.GetUserToken(c.Req.Context(), userID, cmd.AuthTokenId)
	if err != nil {
		if err == models.ErrUserTokenNotFound {
			return Error(404, "未找到用户身份验证令牌", err)
		}
		return Error(500, "无法获得用户身份验证令牌", err)
	}

	if c.UserToken != nil && c.UserToken.Id == token.Id {
		return Error(400, "无法撤消活动用户身份验证令牌", nil)
	}

	err = server.AuthTokenService.RevokeToken(c.Req.Context(), token)
	if err != nil {
		if err == models.ErrUserTokenNotFound {
			return Error(404, "未找到用户身份验证令牌", err)
		}
		return Error(500, "无法撤消用户身份验证令牌", err)
	}

	return JSON(200, util.DynMap{
		"message": "用户身份验证令牌被撤销",
	})
}

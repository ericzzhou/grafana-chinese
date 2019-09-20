package api

import (
	"context"
	"github.com/grafana/grafana/pkg/models"
)

func (server *HTTPServer) AdminProvisioningReloadDasboards(c *models.ReqContext) Response {
	err := server.ProvisioningService.ProvisionDashboards()
	if err != nil && err != context.Canceled {
		return Error(500, "", err)
	}
	return Success("仪表板配置已重新加载")
}

func (server *HTTPServer) AdminProvisioningReloadDatasources(c *models.ReqContext) Response {
	err := server.ProvisioningService.ProvisionDatasources()
	if err != nil {
		return Error(500, "", err)
	}
	return Success("数据源配置已重新加载")
}

func (server *HTTPServer) AdminProvisioningReloadNotifications(c *models.ReqContext) Response {
	err := server.ProvisioningService.ProvisionNotifications()
	if err != nil {
		return Error(500, "", err)
	}
	return Success("通知配置已重新加载")
}

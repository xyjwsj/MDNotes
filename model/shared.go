package model

import "github.com/wailsapp/wails/v3/pkg/application"

type AppInfo struct {
	App *application.App
}

var appInfo AppInfo

func init() {
	appInfo = AppInfo{App: nil}
}

func UpdateApp(app *application.App) {
	appInfo.App = app
}

func FetchAppInfo() *AppInfo {
	return &appInfo
}

package handler

import (
	"changeme/mgr"
	"changeme/model"
	"changeme/util"
)

type License struct {
	DeviceId string `json:"deviceId"`
	Content  string `json:"content"`
	Type     string `json:"type"`
}

type SystemHandler struct {
}

func (system *SystemHandler) ConfigStore(url, username, token string) bool {
	if url == "" || username == "" || token == "" {
		return false
	}
	mgr.ConfigRepository(url, username, token)
	return true
}

func (system *SystemHandler) PreferenceInfo() model.Preference {
	return mgr.PreferenceInfo()
}

func (system *SystemHandler) CreateLicense(license string) bool {
	return mgr.CreateLicence(license)
}

func (system *SystemHandler) Trial(create bool) License {
	return License{
		DeviceId: mgr.UniqueId(),
		Content:  "FSDFDSFDFSD",
		Type:     "production",
	}

	//licence := mgr.ValidateLicence()
	//if licence != "" {
	//	return License{
	//		DeviceId: mgr.UniqueId(),
	//		Content:  licence,
	//		Type:     "production",
	//	}
	//}
	//use := mgr.TrailUse(create)
	//return License{
	//	DeviceId: mgr.UniqueId(),
	//	Content:  use,
	//	Type:     "trial",
	//}
}

func (system *SystemHandler) Start() bool {
	mgr.Start()
	return true
}

func (system *SystemHandler) ScreenFullSwitch() {
	maximised := model.FetchAppInfo().App.CurrentWindow().IsMaximised()
	if !maximised {
		model.FetchAppInfo().App.CurrentWindow().Maximise()
	} else {
		model.FetchAppInfo().App.CurrentWindow().UnMaximise()
	}
}

func (system *SystemHandler) HelpInfo(lang string) string {
	return util.HelpContent(lang)
}

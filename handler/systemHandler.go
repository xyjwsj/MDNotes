package handler

import (
	"changeme/mgr"
	"changeme/model"
)

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

func (system *SystemHandler) Trial(create bool) string {
	licence := mgr.ValidateLicence()
	if licence == "" {
		return mgr.TrailUse(create)
	}
	return ""
}

func (system *SystemHandler) Start() bool {
	mgr.Start()
	return true
}

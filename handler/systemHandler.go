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

package model

import (
	"changeme/util"
)

type RecordInfo struct {
	Uuid     string         `json:"uuid"`
	FileName string         `json:"fileName"`
	Status   int            `json:"status"`
	Size     int64          `json:"size"`
	Tag      string         `json:"tag"`
	SizeStr  string         `json:"sizeStr"`
	Create   *util.Datetime `json:"create"`
	Modify   *util.Datetime `json:"modify"`
	Del      *util.Datetime `json:"del"`
}

type Preference struct {
	Username  string `json:"username"`
	Token     string `json:"token"`
	RemoteUrl string `json:"remoteUrl"`
}

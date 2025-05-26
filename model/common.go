package model

import (
	"changeme/util"
)

type RecordInfo struct {
	Uuid     string         `json:"uuid"`
	FileName string         `json:"fileName"`
	Size     int64          `json:"size"`
	Create   *util.Datetime `json:"create"`
	Modify   *util.Datetime `json:"modify"`
}

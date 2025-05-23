package model

import "time"

type RecordInfo struct {
	Uuid     string     `json:"uuid"`
	FileName string     `json:"fileName"`
	Create   *time.Time `json:"create"`
	Modify   *time.Time `json:"modify"`
}

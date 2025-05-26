package mgr

import (
	"changeme/model"
	"changeme/util"
	"log"
	"time"
)

var recordCache []*model.RecordInfo

func init() {
	path := util.CreatePlatformPath(model.CacheDir, "info.db")
	if !util.IsFileExists(path) {
		recordCache = make([]*model.RecordInfo, 0)
	} else {
		contents, err := util.ReadFileContents(path)
		if err != nil {
			log.Println("ReadFileContents info.db Error", err.Error())
			return
		}
		err = util.Json2Struct(contents, &recordCache)
		if err != nil {
			log.Println("Json2Struct info.db Error", err.Error())
		}
	}
}

func SyncData() {
	path := util.CreatePlatformPath(model.CacheDir, "info.db")
	util.WriteToFile(path, util.Struct2Json(recordCache))
}

func ModifyInfo(key, filename string, size int64) {
	record := findRecord(key)
	now := util.Datetime(time.Now())
	if record != nil {
		if filename != "" {
			record.FileName = filename
		}
		if size >= 0 {
			record.Size = size
		}
		record.Modify = &now
		SyncData()
		return
	}
	return
}

func NewRecord() model.RecordInfo {
	datetime := util.Datetime(time.Now())
	info := model.RecordInfo{
		Uuid:     util.UUID(),
		FileName: "New",
		Create:   &datetime,
		Modify:   nil,
	}
	recordCache = append(recordCache, &info)
	SyncData()
	return info
}

func CacheList() []*model.RecordInfo {
	return recordCache
}

func DeleteFile(fileKey string) bool {
	for idx, item := range recordCache {
		if item.Uuid == fileKey {
			recordCache = append(recordCache[:idx], recordCache[idx+1:]...)
			SyncData()
			return true
		}
	}
	return true
}

func findRecord(key string) *model.RecordInfo {
	for _, itm := range recordCache {
		if itm.Uuid == key {
			return itm
		}
	}
	return nil
}

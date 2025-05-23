package mgr

import (
	"changeme/model"
	"changeme/util"
	"log"
	"time"
)

var recordCache []model.RecordInfo

func init() {
	path := util.CreatePlatformPath(model.CacheDir, "info.db")
	if !util.IsFileExists(path) {
		recordCache = make([]model.RecordInfo, 0)
	}
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

func SyncData() {
	path := util.CreatePlatformPath(model.CacheDir, "info.db")
	util.WriteToFile(path, util.Struct2Json(recordCache))
}

func SaveInfo(key, filename string) {
	record := findRecord(key)
	now := util.Datetime(time.Now())
	if record != nil {
		record.FileName = filename
		record.Modify = &now
		return
	}
	recordCache = append(recordCache, model.RecordInfo{
		Uuid:     key,
		FileName: filename,
		Create:   &now,
	})
	SyncData()
}

func CacheList() []model.RecordInfo {
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
			return &itm
		}
	}
	return nil
}

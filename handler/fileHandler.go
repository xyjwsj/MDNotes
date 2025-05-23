package handler

import (
	"changeme/mgr"
	"changeme/model"
	"changeme/util"
	"log"
)

type FileHandler struct {
}

func (file *FileHandler) SyncFile(fileKey, fileName string, content string) bool {
	err := util.WriteToFile(util.CreatePlatformPath(model.CacheDir, fileKey+".md"), content)
	if err != nil {
		log.Println(err.Error())
		return false
	}
	mgr.SaveInfo(fileKey, fileName)
	return true
}

func (file *FileHandler) DocList() []model.RecordInfo {
	return mgr.CacheList()
}

func (file *FileHandler) FileContent(fileKey string) string {
	contents, err := util.ReadFileContents(util.CreatePlatformPath(model.CacheDir, fileKey+".md"))
	if err != nil {
		log.Println("FileContent Error:" + err.Error())
		return ""
	}
	return contents
}

func (file *FileHandler) CreatFileKey() string {
	return util.UUID()
}

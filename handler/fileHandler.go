package handler

import (
	"changeme/model"
	"changeme/util"
	"log"
)

type FileHandler struct {
}

func (file *FileHandler) SyncFile(fileName string, content string) bool {
	err := util.WriteToFile(util.CreatePlatformPath(model.CacheDir, fileName), content)
	if err != nil {
		log.Println(err.Error())
		return false
	}
	return true
}

func (file *FileHandler) DocList() []string {
	return util.FetchFiles(model.CacheDir, "")
}

func (file *FileHandler) FileContent(fileName string) string {
	contents, err := util.ReadFileContents(util.CreatePlatformPath(model.CacheDir, fileName))
	if err != nil {
		log.Println("FileContent Error:" + err.Error())
		return ""
	}
	return contents
}

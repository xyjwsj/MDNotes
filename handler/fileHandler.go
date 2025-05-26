package handler

import (
	"changeme/mgr"
	"changeme/model"
	"changeme/util"
	"log"
)

type FileHandler struct {
}

func (file *FileHandler) SyncFile(fileKey, content string) bool {
	err := util.WriteToFile(util.CreatePlatformPath(model.CacheDir, "md", fileKey+".md"), content)
	if err != nil {
		log.Println("SyncFile Error:" + err.Error())
		return false
	}
	return true
}

func (file *FileHandler) ModifyName(fileKey, fileName string) bool {
	mgr.SaveInfo(fileKey, fileName)
	return true
}

func (file *FileHandler) DocList() []*model.RecordInfo {
	return mgr.CacheList()
}

func (file *FileHandler) FileContent(fileKey string) string {
	contents, err := util.ReadFileContents(util.CreatePlatformPath(model.CacheDir, "md", fileKey+".md"))
	if err != nil {
		log.Println("FileContent Error:" + err.Error())
		return ""
	}
	return contents
}

func (file *FileHandler) DeleteFile(fileKey string) bool {
	return mgr.DeleteFile(fileKey)
}

func (file *FileHandler) CreateFile() model.RecordInfo {
	return mgr.NewRecord()
}

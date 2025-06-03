package handler

import (
	"changeme/mgr"
	"changeme/model"
	"changeme/util"
	"log"
	"os"
)

type FileHandler struct {
}

func (file *FileHandler) SyncFile(fileKey, content string) string {
	path := util.CreatePlatformPath(model.CacheDir, "md", fileKey+".md")
	err := util.WriteToFile(path, content)
	if err != nil {
		log.Println("SyncFile Error:" + err.Error())
		return ""
	}
	stat, _ := os.Stat(path)
	size := stat.Size()
	mgr.ModifyInfo(fileKey, "", size)
	return util.FileSizeCovert(size)
}

func (file *FileHandler) ModifyName(fileKey, fileName string) bool {
	mgr.ModifyInfo(fileKey, fileName, 0)
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

func (file *FileHandler) ExportFile(all bool, fileKey string) bool {
	if all {
		src := util.CreatePlatformPath(model.CacheDir)
		target := util.CreatePlatformPath(model.UserHomeDir, "Downloads", "Notes")
		util.Copy(src, target)
		return true
	} else {
		src := util.CreatePlatformPath(model.CacheDir, "md", fileKey+".md")
		target := util.CreatePlatformPath(model.UserHomeDir, "Downloads", fileKey+".md")
		util.Copy(src, target)
		return true
	}
}

package handler

import (
	"changeme/mgr"
	"changeme/model"
	"changeme/util"
	"fmt"
	"log"
	"strings"
	"time"
)

type FileHandler struct {
}

func (file *FileHandler) SyncFile(fileKey, content string) string {
	path := util.CreatePlatformPath(model.CacheDir, "md", fileKey+".md")
	mgr.AsyncFile(path, content)
	bytes := []byte(content)
	size := int64(len(bytes))
	go mgr.ModifyInfo(fileKey, "", "", size)
	return util.FileSizeCovert(size)
}

func (file *FileHandler) ModifyName(fileKey, fileName string) bool {
	mgr.ModifyInfo(fileKey, fileName, "", 0)
	return true
}

func (file *FileHandler) ChangeTag(fileKey, tag string) bool {
	if fileKey == "" {
		return false
	}
	mgr.ModifyInfo(fileKey, "", tag, 0)
	return true
}

func (file *FileHandler) DocList() []*model.RecordInfo {
	return mgr.CacheList()
}

func (file *FileHandler) Search(name string) []*model.RecordInfo {
	infos := make([]*model.RecordInfo, 0)
	list := mgr.CacheList()
	if name == "" {
		return list
	}
	for _, item := range list {
		if strings.Contains(item.FileName, name) {
			infos = append(infos, item)
		}
	}
	return infos
}

func (file *FileHandler) FileContent(fileKey string) string {
	path := util.CreatePlatformPath(model.CacheDir, "md", fileKey+".md")
	contents, err := mgr.StartEdit(path)
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
	list := mgr.CacheList()
	if all {
		src := util.CreatePlatformPath(model.CacheDir, "md")
		target := util.CreatePlatformPath(model.UserHomeDir, "Downloads", "Notes")
		for _, item := range list {
			s := util.CreatePlatformPath(src, item.Uuid+".md")
			t := util.CreatePlatformPath(target, fmt.Sprintf("%s-%d.md", item.FileName, time.Now().Unix()))
			util.Copy(s, t)
		}
		util.SelectLocation(target)
		return true
	} else {
		for _, item := range list {
			if item.Uuid == fileKey {
				src := util.CreatePlatformPath(model.CacheDir, "md", fileKey+".md")
				target := util.CreatePlatformPath(model.UserHomeDir, "Downloads", item.FileName+".md")
				util.Copy(src, target)
				util.SelectLocation(target)
			}
		}
		return true
	}
}

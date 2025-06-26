package handler

import (
	"changeme/mgr"
	"changeme/model"
	"changeme/util"
	"fmt"
	"github.com/wailsapp/wails/v3/pkg/application"
	"log"
	"os"
	"strings"
	"time"
)

type FileHandler struct {
}

func (file *FileHandler) SyncFile(fileKey, content string) string {
	path := util.CreatePlatformPath(model.AppDataRoot, "md", fileKey+".md")
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
	path := util.CreatePlatformPath(model.AppDataRoot, "md", fileKey+".md")
	contents, err := mgr.StartEdit(path)
	if err != nil {
		log.Println("FileContent Error:" + err.Error())
		return ""
	}
	return contents
}

func (file *FileHandler) DeleteList() []*model.RecordInfo {
	return mgr.DelList()
}
func (file *FileHandler) DeleteFile(fileKey string) bool {
	return mgr.DeleteFile(fileKey)
}

func (file *FileHandler) Recovery(fileKey string) bool {
	return mgr.RecoveryDel(fileKey)
}

func (file *FileHandler) CreateFile() model.RecordInfo {
	return mgr.NewRecord()
}

func (file *FileHandler) ExportFile(all bool, fileKey string) bool {
	list := mgr.CacheList()
	if all {
		dialog := application.OpenFileDialogWithOptions(&application.OpenFileDialogOptions{
			CanChooseDirectories:    true,
			CanChooseFiles:          false,
			CanCreateDirectories:    true,
			ShowHiddenFiles:         false,
			AllowsMultipleSelection: false,
		})
		if path, err := dialog.PromptForSingleSelection(); err == nil {
			src := util.CreatePlatformPath(model.AppDataRoot, "md")
			for _, item := range list {
				s := util.CreatePlatformPath(src, item.Uuid+".md")
				t := util.CreatePlatformPath(path, fmt.Sprintf("%s-%d.md", item.FileName, time.Now().Unix()))

				err := mgr.ExportFile(s, t)
				if err != nil {
					log.Println(err)
					return false
				}
			}
			return true
		}
		return false

	} else {
		for _, item := range list {
			if item.Uuid == fileKey {
				src := util.CreatePlatformPath(model.AppDataRoot, "md", fileKey+".md")
				//target := util.CreatePlatformPath(model.DownloadDir, item.FileName+".md")

				fileName := item.FileName + ".md"
				dialog := application.SaveFileDialog()

				dialog.SetFilename(item.FileName)
				dialog.AddFilter(item.FileName, "")
				dialog.SetOptions(&application.SaveFileDialogOptions{
					Filename:             fileName,
					CanCreateDirectories: true,
				})

				if path, err := dialog.PromptForSingleSelection(); err == nil {
					err := mgr.ExportFile(src, path)
					if err != nil {
						log.Println(err)
						return false
					}
					return true
				}
				return false
			}
		}
		return true
	}
}

func (file *FileHandler) TypeExport(typ, fileKey, content string) bool {
	list := mgr.CacheList()
	for _, item := range list {
		if item.Uuid == fileKey {
			fileName := item.FileName + ".md"
			if typ == "pdf" {
				fileName = item.FileName + ".pdf"
			}
			if typ == "html" {
				fileName = item.FileName + ".html"
			}
			dialog := application.SaveFileDialog()

			dialog.SetFilename(item.FileName)
			dialog.AddFilter(item.FileName, "")
			dialog.SetOptions(&application.SaveFileDialogOptions{
				Filename:             fileName,
				CanCreateDirectories: true,
			})

			if path, err := dialog.PromptForSingleSelection(); err == nil {
				if typ == "pdf" {
					fileContent := file.FileContent(fileKey)

					err1 := util.MdToPdf(fileContent, path, model.CacheDirMg)
					if err1 != nil {
						return false
					}
					return true
				}
				if typ == "html" {
					err1 := os.WriteFile(path, []byte(content), os.FileMode(0644))
					if err1 != nil {
						return false
					}
					return true
				}
				if typ == "md" {
					fileContent := file.FileContent(fileKey)
					err := os.WriteFile(path, []byte(fileContent), os.FileMode(0644))
					if err != nil {
						log.Println(err)
						return false
					}
					return true
				}
			}
			return false
		}
	}
	return true
}

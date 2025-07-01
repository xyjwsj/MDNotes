package mgr

import (
	"changeme/model"
	"changeme/util"
	"errors"
	"log"
	"os"
	"time"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/config"
	"github.com/go-git/go-git/v5/plumbing/object"
	"github.com/go-git/go-git/v5/plumbing/transport/http"
)

var recordCache []*model.RecordInfo
var category *model.Category
var preference *model.Preference
var startAsync bool

func init() {
	path := util.CreatePlatformPath(model.AppDataRoot, "info.db")
	if !util.Exists(path) {
		recordCache = make([]*model.RecordInfo, 0)
	} else {
		file, err := os.ReadFile(path)
		if err != nil {
			log.Println("ReadFileContents info.db Error", err.Error())
			return
		}

		contents := util.DecryptContent(file, UniqueId())

		err = util.Json2Struct(string(contents), &recordCache)
		if err != nil {
			log.Println("Json2Struct info.db Error", err.Error())
		}
	}

	path = util.CreatePlatformPath(model.AppDataRoot, "preference.db")
	if !util.Exists(path) {
		preference = &model.Preference{
			Username:  "",
			Token:     "",
			RemoteUrl: "",
		}
	} else {
		file, err := os.ReadFile(path)
		if err != nil {
			log.Println("ReadFileContents preference.db Error", err.Error())
			return
		}

		contents := util.DecryptContent(file, UniqueId())
		var pre model.Preference
		err = util.Json2Struct(string(contents), &pre)
		if err != nil {
			log.Println("Json2Struct preference.db Error", err.Error())
		}
		preference = &pre
	}

	path = util.CreatePlatformPath(model.AppDataRoot, "category.db")
	if !util.Exists(path) {
		category = &model.Category{
			Select: "",
			Items:  make([]*model.CategoryItem, 0),
		}
	} else {
		file, err := os.ReadFile(path)
		if err != nil {
			log.Println("ReadFileContents classification.db Error", err.Error())
			return
		}

		contents := util.DecryptContent(file, UniqueId())
		var categoryObj model.Category
		err = util.Json2Struct(string(contents), &categoryObj)
		if err != nil {
			log.Println("Json2Struct info.db Error", err.Error())
		}
		category = &categoryObj
	}

	startAsync = false

	go repository()
}

func Start() {
	log.Println("Task Starting...")
}

func PreferenceInfo() model.Preference {
	return *preference
}

func ConfigRepository(remoteUrl, username, token string) {
	preference.Username = username
	preference.Token = token
	preference.RemoteUrl = remoteUrl
	path := util.CreatePlatformPath(model.AppDataRoot, "preference.db")

	json := util.Struct2Json(preference)
	content, _ := util.EncryptContent([]byte(json), UniqueId())

	_ = os.WriteFile(path, content, os.ModePerm)

	go repository()
}

func repository() {
	if preference.Username == "" || preference.Token == "" || preference.RemoteUrl == "" {
		return
	}

	if startAsync {
		return
	}

	repo, err := git.PlainInitWithOptions(model.AppDataRoot, &git.PlainInitOptions{
		InitOptions: git.InitOptions{
			DefaultBranch: "refs/heads/main",
		},
		Bare:         false,
		ObjectFormat: "",
	})

	if err != nil {
		if errors.Is(err, git.ErrRepositoryAlreadyExists) {
			repo, err = git.PlainOpen(model.AppDataRoot)
		} else {
			log.Println(err.Error())
			return
		}
	}

	if err != nil {
		log.Println("CreateLocal Error:", err.Error())
		return
	}

	// ========== 设置远程仓库地址 ==========
	remoteURL := preference.RemoteUrl
	remotes, _ := repo.Remotes()
	foundOrigin := false
	for _, r := range remotes {
		if r.Config().Name == "origin" {
			foundOrigin = true
			break
		}
	}

	if !foundOrigin {
		_, err = repo.CreateRemote(&config.RemoteConfig{
			Name: "origin",
			URLs: []string{remoteURL},
		})
		if err != nil {
			log.Println("CreateRemote Error:", err)
			return
		}
	}
	// ========== 设置远程仓库地址 END ==========

	auth := &http.BasicAuth{
		Username: preference.Username,
		Password: preference.Token, // 替换为实际 Token
	}

	w, _ := repo.Worktree()

	w.AddGlob(".")

	hash, _ := w.Commit("Auto Commit", &git.CommitOptions{
		Author: &object.Signature{
			Name: preference.Username,
			When: time.Now(),
		},
	})

	if !hash.IsZero() {
		err = w.Pull(&git.PullOptions{
			Auth:          auth,
			RemoteName:    "origin",
			ReferenceName: "refs/heads/main", // 指定要拉取的分支，如 main 或 master
			SingleBranch:  true,              // 只拉取该分支
		})

		if err != nil {
			log.Println("pull error：" + err.Error())
		}
	}

	ticker := time.NewTicker(1 * time.Minute)
	ticker1 := time.NewTicker(10 * time.Second)
	ticker2 := time.NewTicker(2 * time.Minute)

	startAsync = true
	//bb04d8ea5f4dac046b84f99c09547d70
	for {

		select {
		case <-ticker.C:
			_ = w.AddGlob(".") // 添加所有文件
			// 提交配置
			_, _ = w.Commit("Auto Commit", &git.CommitOptions{
				Author: &object.Signature{
					Name: preference.Username,
					When: time.Now(),
				},
			})
			log.Println("Already Commit...")
		case <-ticker2.C:
			_ = repo.Push(&git.PushOptions{
				Auth:       auth,
				RemoteName: "origin",
				RefSpecs:   []config.RefSpec{"refs/heads/main:refs/heads/main"},
			})
			log.Println("Already Push...")
		case <-ticker1.C:
			log.Println("Start Async Task ...")
		}
	}
}

func SyncData() {
	path := util.CreatePlatformPath(model.AppDataRoot, "info.db")
	json := util.Struct2Json(recordCache)
	content, _ := util.EncryptContent([]byte(json), UniqueId())

	_ = os.WriteFile(path, content, os.ModePerm)
}

func ModifyInfo(key, filename, tag string, size int64) {
	log.Println("xxxxx", key, filename, tag, size)
	record := findRecord(key)
	now := util.Datetime(time.Now())
	if record != nil {
		if filename != "" {
			record.FileName = filename
		}
		if tag != "" {
			record.Tag = tag
		}
		if size > 0 {
			log.Println("修改文件大小")
			record.Size = size
			record.SizeStr = util.FileSizeCovert(record.Size)
		}
		record.Modify = &now
		SyncData()
		return
	}
	return
}

func ModifyCategory(fileKey, categoryKey string) {
	record := findRecord(fileKey)
	now := util.Datetime(time.Now())
	if record != nil {
		record.Modify = &now
		record.Category = categoryKey
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
		Status:   1,
		Size:     0,
		SizeStr:  "0 Byte",
		Create:   &datetime,
		Modify:   nil,
		Del:      nil,
	}
	recordCache = append(recordCache, &info)
	SyncData()
	return info
}

func CacheList() []*model.RecordInfo {
	infos := make([]*model.RecordInfo, 0)
	for _, item := range recordCache {
		if category.Select != "" && item.Category != category.Select {
			continue
		}
		if item.Status > 0 {
			infos = append(infos, item)
		}
	}
	return infos
}

func DelList() []*model.RecordInfo {
	infos := make([]*model.RecordInfo, 0)
	for _, item := range recordCache {
		if item.Status == 0 {
			infos = append(infos, item)
		}
	}
	return infos
}

func RecoveryDel(fileKey string) bool {
	for _, item := range recordCache {
		if item.Uuid == fileKey && item.Status == 0 {
			target := util.CreatePlatformPath(model.CacheDel, fileKey+".md")
			if !util.Exists(target) {
				return false
			}
			item.Status = 1
			src := util.CreatePlatformPath(model.CacheDel, fileKey+".md")
			util.Move(src, target)
			SyncData()
			return true
		}
	}
	return false
}

func DeleteFile(fileKey string) bool {
	for _, item := range recordCache {
		if item.Uuid == fileKey {
			datetime := util.Datetime(time.Now())
			item.Del = &datetime
			item.Status = 0
			//recordCache = append(recordCache[:idx], recordCache[idx+1:]...)
			src := util.CreatePlatformPath(model.AppDataRoot, "md", fileKey+".md")
			target := util.CreatePlatformPath(model.CacheDel, fileKey+".md")
			util.Move(src, target)
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

func AllCategory() []*model.CategoryItem {
	return category.Items
}

func AddCategory(tag string) string {
	item := model.CategoryItem{
		Key: util.UUID(),
		Tag: tag,
	}
	category.Items = append(category.Items, &item)
	SyncCategory()
	return item.Key
}

func SelectCategory(key string) {
	category.Select = key
	SyncCategory()
}

func SyncCategory() {
	path := util.CreatePlatformPath(model.AppDataRoot, "category.db")

	json := util.Struct2Json(category)
	content, _ := util.EncryptContent([]byte(json), UniqueId())

	_ = os.WriteFile(path, content, os.ModePerm)
}

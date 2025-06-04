package mgr

import (
	"changeme/model"
	"changeme/util"
	"errors"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/config"
	"github.com/go-git/go-git/v5/plumbing/object"
	"github.com/go-git/go-git/v5/plumbing/transport/http"
	"log"
	"time"
)

var recordCache []*model.RecordInfo
var preference *model.Preference
var startAsync bool

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

	path = util.CreatePlatformPath(model.CacheDir, "preference.db")
	if !util.IsFileExists(path) {
		preference = &model.Preference{
			Username:  "",
			Token:     "",
			RemoteUrl: "",
		}
	} else {
		contents, err := util.ReadFileContents(path)
		if err != nil {
			log.Println("ReadFileContents preference.db Error", err.Error())
			return
		}
		var pre model.Preference
		err = util.Json2Struct(contents, &pre)
		if err != nil {
			log.Println("Json2Struct preference.db Error", err.Error())
		}
		preference = &pre
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
	path := util.CreatePlatformPath(model.CacheDir, "preference.db")
	util.WriteToFile(path, util.Struct2Json(preference))

	go repository()
}

func repository() {
	if preference.Username == "" || preference.Token == "" || preference.RemoteUrl == "" {
		return
	}

	if startAsync {
		return
	}

	repo, err := git.PlainInitWithOptions(model.CacheDir, &git.PlainInitOptions{
		InitOptions: git.InitOptions{
			DefaultBranch: "refs/heads/main",
		},
		Bare:         false,
		ObjectFormat: "",
	})

	if err != nil {
		if errors.Is(err, git.ErrRepositoryAlreadyExists) {
			repo, err = git.PlainOpen(model.CacheDir)
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
			record.SizeStr = util.FileSizeCovert(record.Size)
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
		if item.Status > 0 {
			infos = append(infos, item)
		}
	}
	return infos
}

func DeleteFile(fileKey string) bool {
	for _, item := range recordCache {
		if item.Uuid == fileKey {
			datetime := util.Datetime(time.Now())
			item.Del = &datetime
			item.Status = 0
			//recordCache = append(recordCache[:idx], recordCache[idx+1:]...)
			src := util.CreatePlatformPath(model.CacheDirMd, fileKey+".md")
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

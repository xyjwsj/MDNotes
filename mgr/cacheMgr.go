package mgr

import (
	"changeme/model"
	"changeme/util"
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"github.com/go-git/go-git/v5/plumbing"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/config"
	"github.com/go-git/go-git/v5/plumbing/object"
	"github.com/go-git/go-git/v5/plumbing/transport/http"
)

var recordCache []*model.RecordInfo
var category *model.Category
var preference *model.Preference
var startAsync bool
var (
	syncMu     sync.Mutex
	syncCancel context.CancelFunc
)

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

	syncMu.Lock()
	defer syncMu.Unlock()
	if syncCancel != nil {
		syncCancel() // 取消上一个同步任务
	}
	ctx, cancel := context.WithCancel(context.Background())
	syncCancel = cancel
	go repository(ctx)
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

	syncMu.Lock()
	defer syncMu.Unlock()
	if syncCancel != nil {
		syncCancel() // 取消上一个同步任务
	}
	ctx, cancel := context.WithCancel(context.Background())
	syncCancel = cancel
	go repository(ctx)
}

func repository(ctx context.Context) {
	if preference.Username == "" || preference.Token == "" || preference.RemoteUrl == "" {
		return
	}

	syncMu.Lock()
	if startAsync {
		syncMu.Unlock()
		return
	}
	startAsync = true
	syncMu.Unlock()
	defer func() {
		syncMu.Lock()
		startAsync = false
		syncMu.Unlock()
	}()

	// 固定分支名，使用设备标识 + 用户名区分
	branchId := UniqueId()

	repo, err := openOrCreateRepo(model.AppDataRoot)
	if err != nil {
		log.Println("打开或初始化仓库失败:", err)
		return
	}

	err = setupRemote(repo, preference.RemoteUrl)
	if err != nil {
		log.Println("配置远程仓库失败:", err)
		return
	}

	auth := &http.BasicAuth{
		Username: preference.Username,
		Password: preference.Token,
	}

	w, err := repo.Worktree()
	if err != nil {
		log.Println("获取工作树失败:", err)
		return
	}

	// 切换或创建分支
	err = checkoutBranch(repo, w, branchId)
	if err != nil {
		log.Println("切换分支失败:", err)
		return
	}

	// 第一次拉取远程内容
	err = pullRemote(w, auth, branchId)
	if err != nil {
		log.Println("首次拉取失败:", err)
	}

	// 启动定时任务
	tickerCommit := time.NewTicker(1 * time.Minute)
	tickerPush := time.NewTicker(2 * time.Minute)
	tickerLog := time.NewTicker(10 * time.Second)

	startAsync = true

	for {
		select {
		case <-ctx.Done():
			log.Println("Git 同步任务已取消")
			return
		case <-tickerCommit.C:
			commitChanges(w, auth.Username)
		case <-tickerPush.C:
			pushChanges(repo, auth, branchId)
		case <-tickerLog.C:
			log.Println("Git 同步任务运行中...")
		}
	}
}

// 打开或创建仓库
func openOrCreateRepo(path string) (*git.Repository, error) {
	repo, err := git.PlainOpen(path)
	if err == nil {
		return repo, nil
	}

	if errors.Is(err, git.ErrRepositoryNotExists) {
		// 使用 PlainInit 创建新仓库
		repo, err = git.PlainInit(path, false)
		if err != nil {
			return nil, fmt.Errorf("初始化仓库失败：%w", err)
		}
		return repo, nil
	}
	return nil, fmt.Errorf("打开仓库失败：%w", err)
}

// 设置远程地址
func setupRemote(repo *git.Repository, remoteURL string) error {
	remotes, _ := repo.Remotes()
	foundOrigin := false
	for _, r := range remotes {
		if r.Config().Name == "origin" {
			foundOrigin = true
			break
		}
	}
	if !foundOrigin {
		_, err := repo.CreateRemote(&config.RemoteConfig{
			Name: "origin",
			URLs: []string{remoteURL},
		})
		return err
	}
	return nil
}

// 切换分支，如果不存在则从远程创建跟踪分支
func checkoutBranch(repo *git.Repository, w *git.Worktree, branch string) error {
	refName := plumbing.NewBranchReferenceName(branch)

	// 检查本地是否有未提交的更改
	//status, err := w.Status()
	//if err != nil {
	//	return fmt.Errorf("获取工作区状态失败: %w", err)
	//}
	//if !status.IsClean() {
	//	// 方式1：自动提交
	//	_ = w.AddGlob(".")
	//	_, err := w.Commit("Auto commit before branch switch", &git.CommitOptions{
	//		Author: &object.Signature{
	//			Name: "AutoCommit",
	//			When: time.Now(),
	//		},
	//	})
	//	if err != nil {
	//		return fmt.Errorf("自动提交失败: %w", err)
	//	}
	//}

	// 检查本地是否存在该分支
	branchRef, err := repo.Reference(refName, true)
	if err == nil && branchRef != nil {
		// 本地分支存在，直接切换
		return w.Checkout(&git.CheckoutOptions{
			Branch: refName,
			Create: false,
			Force:  true,
		})
	}

	// 本地分支不存在，尝试 fetch 远程分支
	log.Printf("本地分支 %s 不存在，尝试从远程创建...\n", branch)
	err = fetchRemoteBranch(repo, "origin", branch)
	if err != nil {
		log.Printf("拉取远程分支失败：%v\n", err)
		// 远程也没有该分支，则创建空分支
		return w.Checkout(&git.CheckoutOptions{
			Branch: refName,
			Create: true,
			Force:  true,
		})
	}

	// 手动设置本地分支跟踪远程分支
	err = repo.Storer.SetReference(
		plumbing.NewSymbolicReference(
			refName,
			plumbing.NewRemoteReferenceName("origin", branch),
		),
	)
	if err != nil {
		return err
	}

	// 切换到新建的本地分支
	return w.Checkout(&git.CheckoutOptions{
		Branch: refName,
		Create: false,
		Force:  true,
	})
}

// 拉取远程特定分支
func fetchRemoteBranch(repo *git.Repository, remote string, branch string) error {
	refSpec := config.RefSpec(fmt.Sprintf("refs/heads/%s:refs/remotes/%s/%s", branch, remote, branch))
	return repo.Fetch(&git.FetchOptions{
		RemoteName: remote,
		RefSpecs:   []config.RefSpec{refSpec},
		Force:      true,
	})
}

// 拉取最新提交
func pullRemote(w *git.Worktree, auth *http.BasicAuth, branch string) error {
	err := w.Pull(&git.PullOptions{
		Auth:          auth,
		RemoteName:    "origin",
		ReferenceName: plumbing.NewBranchReferenceName(branch),
		SingleBranch:  true,
	})
	if err != nil && !errors.Is(err, git.NoErrAlreadyUpToDate) {
		return err
	}
	return nil
}

// 提交更改
func commitChanges(w *git.Worktree, author string) {
	status, err := w.Status()
	if err != nil {
		log.Println("获取工作区状态失败:", err)
		return
	}
	if status.IsClean() {
		log.Println("无变更，无需提交")
		return
	}
	_ = w.AddGlob(".")
	hash, err := w.Commit("Auto Commit", &git.CommitOptions{
		Author: &object.Signature{
			Name: author,
			When: time.Now(),
		},
	})
	if err != nil {
		log.Println("提交失败:", err)
		return
	}
	if !hash.IsZero() {
		log.Println("提交成功:", hash.String())
	}
}

// 推送更改
func pushChanges(repo *git.Repository, auth *http.BasicAuth, branch string) {
	err := repo.Push(&git.PushOptions{
		Auth:       auth,
		RemoteName: "origin",
		RefSpecs: []config.RefSpec{
			config.RefSpec(fmt.Sprintf("refs/heads/%s:refs/heads/%s", branch, branch)),
		},
	})
	if err != nil && !errors.Is(err, git.NoErrAlreadyUpToDate) {
		log.Println("推送失败:", err)
	} else {
		log.Println("推送成功")
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

func DeleteCategory(key string) {
	indexRemove := -1
	for idx, itm := range category.Items {
		if itm.Key == key {
			indexRemove = idx
			break
		}
	}
	if indexRemove != -1 {
		category.Items = append(category.Items[:indexRemove], category.Items[indexRemove+1:]...)
	}
	SyncCategory()
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

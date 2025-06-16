package model

import (
	"changeme/util"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
)

const bundleId = "com.allen.mdnote"

const appName = "LiveMark"

var (
	AppDataRoot string
	CacheDirMd  string
	CacheDirMg  string
	CacheDel    string
	DownloadDir string
	TmpDataDir  string
	LogDir      string
)

func init() {

	dir, _ := os.UserConfigDir()
	if util.System() == util.Macos {
		supportData := os.Getenv("HOME")
		if !strings.Contains(supportData, "/Library/Containers") {
			supportData += "/Library/Containers/" + bundleId + "/Data"
		}
		AppDataRoot = util.CreatePlatformPath(supportData, "Library", "Application Support", appName)
		TmpDataDir = util.CreatePlatformPath(supportData, "Library", "Caches", appName)
		if !util.Exists(TmpDataDir) {
			os.MkdirAll(TmpDataDir, os.ModePerm)
		}
		DownloadDir = util.CreatePlatformPath(supportData, "Downloads")
		LogDir = util.CreatePlatformPath(supportData, "Library", "Logs", appName)
		if !util.Exists(LogDir) {
			os.MkdirAll(LogDir, os.ModePerm)
		}
	} else {
		AppDataRoot = util.CreatePlatformPath(dir, appName)
		home, err := os.UserHomeDir()
		if err != nil {
			fmt.Println(err)
		}
		DownloadDir = home
	}
	if !util.Exists(AppDataRoot) {
		os.MkdirAll(AppDataRoot, os.ModePerm)
	}
	CacheDirMd = util.CreatePlatformPath(AppDataRoot, "md")
	if !util.Exists(CacheDirMd) {
		err := os.MkdirAll(CacheDirMd, os.ModePerm)
		if err != nil {
			fmt.Println(err)
		}
	}

	CacheDirMg = util.CreatePlatformPath(AppDataRoot, "image")
	if !util.Exists(CacheDirMg) {
		err := os.Mkdir(CacheDirMg, os.ModePerm)
		if err != nil {
			fmt.Println(err)
		}
	}

	CacheDel = util.CreatePlatformPath(AppDataRoot, "del")
	if !util.Exists(CacheDel) {
		err := os.Mkdir(CacheDel, os.ModePerm)
		if err != nil {
			fmt.Println(err)
		}
	}

	initLogger()
}

func initLogger() {
	logFilePath := filepath.Join(LogDir, "app.log")
	logFile, err := os.OpenFile(logFilePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		fmt.Println("无法打开日志文件:", err)
		return
	}
	log.SetOutput(logFile)
}

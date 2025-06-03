package model

import (
	"changeme/util"
	"fmt"
	"os"
)

var (
	CacheDir    string
	UserHomeDir string
)

func init() {
	dir, _ := os.UserCacheDir()
	CacheDir = util.CreatePlatformPath(dir, "MDNote", "data")
	if !util.Exists(CacheDir) {
		err := os.MkdirAll(CacheDir, os.ModePerm)
		if err != nil {
			fmt.Println(err)
		}
	}
	CacheDirMd := util.CreatePlatformPath(CacheDir, "md")
	if !util.Exists(CacheDirMd) {
		err := os.MkdirAll(CacheDirMd, os.ModePerm)
		if err != nil {
			fmt.Println(err)
		}
	}

	CacheDirMg := util.CreatePlatformPath(CacheDir, "image")
	if !util.Exists(CacheDirMg) {
		err := os.Mkdir(CacheDirMg, os.ModePerm)
		if err != nil {
			fmt.Println(err)
		}
	}

	home, err := os.UserHomeDir()
	if err != nil {
		fmt.Println(err)
	}
	UserHomeDir = home
}

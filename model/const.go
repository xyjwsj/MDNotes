package model

import (
	"changeme/util"
	"fmt"
	"os"
)

var (
	CacheDir string
)

func init() {
	dir, _ := os.UserCacheDir()
	CacheDir = util.CreatePlatformPath(dir, "MDNote", "data")
	if !util.Exists(CacheDir) {
		err := os.Mkdir(CacheDir, os.ModePerm)
		if err != nil {
			fmt.Println(err)
		}
	}
}

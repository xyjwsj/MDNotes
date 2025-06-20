package main

import (
	"changeme/mgr"
	"changeme/model"
	"changeme/util"
	"fmt"
	"io/fs"
	"log"
	"os"
	"strings"
	"testing"
)

func TestGit(t *testing.T) {
}

func TestCopy(t *testing.T) {
	fileKey := "ce9c888d-9e09-4077-a6f1-449c5b7d4610"
	src := util.CreatePlatformPath(model.AppDataRoot, "md", fileKey+".md")
	target := util.CreatePlatformPath(model.DownloadDir, fileKey+".md")
	util.Copy(src, target)
}

func TestLicence(t *testing.T) {
	license, err := mgr.GenerateLicense(mgr.Production, "/Users/wushaojie/Documents/wsj/application/mdNote/license/private.pem", 30)
	if err != nil {
		log.Println(err)
	}
	fmt.Println(util.Base64Encode(license, true))
	//mgr.ValidateLicence()
	//use := mgr.TrailUse(false)
	//log.Println(use)
	//mgr.TrialLicense()

	//
	//encode := util.Base64Encode(license, true)
	//log.Println(encode)
	//
	err = mgr.ValidateLicense(license)
	if err != nil {
		log.Panic(err)
	}
}

func TestCreateLicense(t *testing.T) {
	str := "f7ftCXNWVG6y0O8vPF6Q32IIHVwpGr78KU9L2JqJLLmh/ooK9uloHmGaMJIomChEssuc8U6GVSUywhvDJKbyd//QG+IybchDbb7nXNUcJ1oWNJ0ysLlB//HyTvS/ujzGk1ErBzY03kEYMjV/Zrm0MbS85mS3p3N4LPV3rrdK67SY5Nxq/X5trGepZV6B0ak5d13Bvk76Oz6kXmzGNC1epg+GExOPV5WF0rL2V6thLZH2mqeGYtqirJRXCHPi94LLMGQchR0sVxBrtWsX+5qmlwR5iSbJwkWgH/wATahxhEiGq7KkGc/MSjgw4F04rjrvk6KoNYq+eLgkKBwYQjDKvg=="
	licence := mgr.CreateLicence(str)
	log.Println(licence)
}

func TestAssets(t *testing.T) {
	err := fs.WalkDir(vditorAssets, ".", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		fmt.Printf("文件: %s\n", path)
		return nil
	})
	if err != nil {
		panic(err)
	}
}

func TestCache(t *testing.T) {
	path := util.CreatePlatformPath(model.AppDataRoot, "md", "903b573e-a70c-4cc3-b37a-b4539bebf0d2.md")
	contents, err := mgr.StartEdit(path)
	if err != nil {
		log.Println("FileContent Error:" + err.Error())
	}
	log.Println(contents)
}

func TestPdf(t *testing.T) {

}

func TestMoveData(t *testing.T) {
	dir, _ := os.UserCacheDir()
	CacheDir := util.CreatePlatformPath(dir, "MDNOte", "data")
	newCache := util.CreatePlatformPath(dir, "LiveMark", "data")

	//str := ""

	if util.Exists(CacheDir) {
		curPath := util.CreatePlatformPath(CacheDir)
		curPath1 := util.CreatePlatformPath(newCache)
		if !util.Exists(curPath1) {
			_ = os.MkdirAll(newCache, os.ModePerm)
		}

		readDir, _ := os.ReadDir(curPath)
		for _, item := range readDir {
			if item.IsDir() {
				continue
			}
			if strings.HasPrefix(item.Name(), ".") {
				continue
			}
			info, _ := item.Info()
			path := util.CreatePlatformPath(curPath, info.Name())
			file, _ := os.ReadFile(path)
			content := util.DecryptContent(file, mgr.UniqueId())
			_ = os.WriteFile(util.CreatePlatformPath(curPath1, item.Name()), content, os.ModePerm)
			log.Println(path + ":" + string(content))
		}
	}
}

func TestCatFile(t *testing.T) {
	dir, _ := os.UserCacheDir()
	newCache := util.CreatePlatformPath(dir, "LiveMark", "data")

	str := ""

	curPath := util.CreatePlatformPath(newCache, str)
	if !util.Exists(curPath) {
		_ = os.MkdirAll(newCache, os.ModePerm)
	}
	readDir, _ := os.ReadDir(curPath)
	for _, item := range readDir {
		if item.IsDir() {
			continue
		}
		info, _ := item.Info()
		path := util.CreatePlatformPath(curPath, info.Name())
		file, _ := os.ReadFile(path)
		content := util.DecryptContent(file, mgr.UniqueId())
		log.Println(path + ":" + string(content))
	}
}

func TestExport(t *testing.T) {
	target := util.CreatePlatformPath(model.DownloadDir, "Export.pdf")
	//903b573e-a70c-4cc3-b37a-b4539bebf0d2
	src := util.CreatePlatformPath(model.AppDataRoot, "md", "903b573e-a70c-4cc3-b37a-b4539bebf0d2.md")

	originContent := mgr.OriginContent(src)

	err := util.MdToPdf(originContent, target)
	if err != nil {
		log.Println(err)
	}
}

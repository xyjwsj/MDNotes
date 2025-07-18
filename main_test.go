package main

import (
	"changeme/mgr"
	"changeme/model"
	"changeme/util"
	"fmt"
	"io/fs"
	"log"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestGit(t *testing.T) {
}

func TestUniqueId(t *testing.T) {
	mgr.UniqueId()
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

func TestRepository(t *testing.T) {
	mgr.ConfigRepository("https://gitee.com/xyjwsj/note.git", "xyjwsj", "bb04d8ea5f4dac046b84f99c09547d70")
	for {
	}
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
	src := util.CreatePlatformPath(model.AppDataRoot, "md", "1e35abac-8f33-4d9e-9255-2a63fed70e25.md")

	originContent := mgr.OriginContent(src)

	err := util.MdToPdf(originContent, target, model.CacheDirMg)
	if err != nil {
		log.Println(err)
	}
}

func TestMoveDataNew(t *testing.T) {
	filepath.Walk("/Users/wushaojie/Downloads/note-e04366721a40cf8739183bbf6b7eee72", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			log.Printf("访问文件 %s 出错: %v\n", path, err)
			return err
		}

		// 判断是否是文件，并且后缀为 .db 或 .md
		if !info.IsDir() && (strings.HasSuffix(info.Name(), ".db") || strings.HasSuffix(info.Name(), ".md")) {
			fmt.Printf("处理文件: %s\n", path)

			// 读取文件内容
			originalData, err := os.ReadFile(path)
			if err != nil {
				log.Printf("读取文件 %s 失败: %v\n", path, err)
				return err
			}

			// 解密原始内容
			decryptedData := util.DecryptContent(originalData, "e04366721a40cf8739183bbf6b7eee72")

			// 再次加密内容
			encryptedData, err := util.EncryptContent(decryptedData, mgr.UniqueId())
			if err != nil {
				log.Printf("加密文件 %s 失败: %v\n", path, err)
				return err
			}

			// 覆盖写回加密后的数据
			err = os.WriteFile(path, encryptedData, os.ModePerm)
			if err != nil {
				log.Printf("写入文件 %s 失败: %v\n", path, err)
				return err
			}

			log.Printf("文件 %s 已重新加密。\n", path)
		}

		return nil
	})
}

func TestDecryptData(t *testing.T) {
	filepath.Walk("/Users/wushaojie/Downloads/note-e04366721a40cf8739183bbf6b7eee72", func(path string, info os.FileInfo, err error) error {
		//filepath.Walk("/Users/wushaojie/Library/Containers/com.allen.mdnote/Data/Library/Application Support/LiveMark", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			log.Printf("访问文件 %s 出错: %v\n", path, err)
			return err
		}

		// 判断是否是文件，并且后缀为 .db 或 .md
		if !info.IsDir() && (strings.HasSuffix(info.Name(), ".db") || strings.HasSuffix(info.Name(), ".md")) {
			fmt.Printf("处理文件: %s\n", path)

			// 读取文件内容
			originalData, err := os.ReadFile(path)
			if err != nil {
				log.Printf("读取文件 %s 失败: %v\n", path, err)
				return err
			}

			// 解密原始内容
			decryptedData := util.DecryptContent(originalData, mgr.UniqueId())

			log.Printf("文件 \n%s\n", decryptedData)
		}

		return nil
	})
}

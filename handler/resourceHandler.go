package handler

import (
	"changeme/model"
	"changeme/util"
	"encoding/base64"
	"fmt"
	"log"
	"os"
	"path"
	"strings"
	"time"
)

type ResourceHandler struct {
}

func (handler *ResourceHandler) UploadImage(fileName, data string) string {
	// 去除 data:image/png;base64, 前缀
	base64Data := strings.ReplaceAll(data, "data:image/png;base64,", "")
	base64Data = strings.ReplaceAll(base64Data, "data:image/jpeg;base64,", "")

	// 解码 Base64
	decoded, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		log.Printf("base64 decode error: %v \n", err)
		return ""
	}

	year := time.Now().Year()
	month := time.Now().Format("01") //time.Now().Month().String()
	day := time.Now().Day()

	dir := fmt.Sprintf("%s/%d/%s/%d/", model.CacheDirMg, year, month, day)

	_ = os.MkdirAll(path.Dir(dir), 0744)

	fileId := util.UUID()

	outputPath := fmt.Sprintf("/api/resource/%d/%s/%d/%s", year, month, day, fileId)
	if err := os.WriteFile(util.CreatePlatformPath(dir, fileId), decoded, 0644); err != nil {
		log.Printf("file write error: %v \n", err)
		return ""
	}

	return outputPath
}

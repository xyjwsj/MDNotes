package mgr

import (
	"changeme/model"
	"changeme/util"
	"fmt"
	"mime/multipart"
	"os"
	"path"
	"time"
)

func ImagePath() string {
	return util.CreatePlatformPath(model.CacheDir, "image")
}

func SaveFile(multiFile multipart.File) (string, error) {
	year := time.Now().Year()
	month := time.Now().Format("01") //time.Now().Month().String()
	day := time.Now().Day()

	dir := fmt.Sprintf("%s/%d/%s/%d/", ImagePath(), year, month, day)

	_ = os.MkdirAll(path.Dir(dir), 0744)

	fileName, _, err := util.CreateFileTypeToDir(dir, multiFile)
	if err != nil {
		return "", err
	}

	sprintf := fmt.Sprintf("/api/resource/%d/%s/%d/%s", year, month, day, fileName)

	return sprintf, nil
}

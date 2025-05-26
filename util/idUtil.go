package util

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"github.com/google/uuid"
	"io"
	"os"
)

func UUID() string {
	return uuid.New().String()
}

func FileMD5(fileName string) string {
	pFile, err := os.Open(fileName)
	if err != nil {
		fmt.Errorf("打开文件失败，filename=%v, err=%v", fileName, err)
		return ""
	}
	defer pFile.Close()
	md5h := md5.New()
	_, _ = io.Copy(md5h, pFile)

	return hex.EncodeToString(md5h.Sum(nil))
}

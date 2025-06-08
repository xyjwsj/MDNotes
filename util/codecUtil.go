package util

import (
	"crypto/md5"
	"fmt"
	"io"
)

// MD5 md5 加密
//
// 待加密字符串
func MD5(data string) string {
	w := md5.New()
	_, _ = io.WriteString(w, data)
	md5str := fmt.Sprintf("%x", w.Sum(nil))
	return md5str
}

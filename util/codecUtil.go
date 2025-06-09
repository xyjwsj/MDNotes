package util

import (
	"crypto/md5"
	"encoding/base64"
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

func Base64Encode(data string, std bool) string {
	if !std {
		return base64.RawStdEncoding.EncodeToString([]byte(data))
	}
	return base64.StdEncoding.EncodeToString([]byte(data))
}

// Base64Decode urlDecode 解码
//
// data 数据
func Base64Decode(data string, std bool) (string, error) {
	var sDec []byte
	var err error
	if !std {
		sDec, err = base64.RawStdEncoding.DecodeString(data)
	} else {
		sDec, err = base64.StdEncoding.DecodeString(data)
	}
	if err != nil {
		return "", err
	}
	return string(sDec), nil
}

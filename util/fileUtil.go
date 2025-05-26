package util

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"mime/multipart"
	"os"
	"path"
	"path/filepath"
	"strings"
)

func ReadFileContents(filePath string) (string, error) {
	result, err := os.ReadFile(filePath)
	if err != nil {
		return "", err
	}
	return string(result), nil
}

func ParseObject(filePath string, v interface{}) error {
	contents, err := ReadFileContents(filePath)
	if err != nil {
		return err
	}
	err = json.Unmarshal([]byte(contents), v)
	return err
}

func CreateFile(filePath string, data multipart.File) error {
	out, err := os.Create(filePath)
	defer out.Close()
	if err != nil {
		return err
	}
	_, err = io.Copy(out, data)
	if err != nil {
		return err
	}
	return nil
}

// 判断所给路径文件/文件夹是否存在
func Exists(path string) bool {
	_, err := os.Stat(path) //os.Stat获取文件信息
	if err != nil {
		if os.IsExist(err) {
			return true
		}
		return false
	}
	return true
}

// 判断所给路径是否为文件夹
func IsDir(path string) bool {
	s, err := os.Stat(path)
	if err != nil {
		return false
	}
	return s.IsDir()
}

func IsFileExists(filename string) bool {
	file, err := os.Open(filename)
	defer file.Close()
	if err != nil {
		if os.IsNotExist(err) {
			return false
		}
	}
	return true
}

func WriteToFile(fileName string, content string) error {
	f, err := os.OpenFile(fileName, os.O_WRONLY|os.O_TRUNC|os.O_CREATE, 0644)
	if err != nil {
		fmt.Println("file create failed. err: " + err.Error())
	} else {
		// offset
		//os.Truncate(filename, 0) //clear
		n, _ := f.Seek(0, os.SEEK_END)
		_, err = f.WriteAt([]byte(content), n)
		fmt.Println("write succeed!")
		defer f.Close()
	}
	return err
}

// Copy
//
// copy file or directory
//
// src source of copy file or dir
//
// dst destination of file or dir
func Copy(src, dst string) error {
	return CopyOverride(src, dst, false)
}

// CopyOverride
//
// copy file or directory
//
// src source of copy file or dir
//
// dst destination of file or dir
//
// override content
func CopyOverride(src, dst string, override bool) error {
	file, err := os.Stat(src)
	if err != nil {
		return err
	}

	if file.IsDir() {
		if list, err := ioutil.ReadDir(src); err == nil {
			for _, item := range list {
				if err = Copy(filepath.Join(src, item.Name()), filepath.Join(dst, item.Name())); err != nil {
					return err
				}
			}
		}
	} else {
		p := filepath.Dir(dst)
		if _, err = os.Stat(p); err != nil {
			if err = os.MkdirAll(p, os.ModePerm); err != nil {
				return err
			}
		}

		fileSrc, err1 := os.Open(src)
		if err1 != nil {
			return err1
		}

		defer fileSrc.Close()

		if override || !Exists(dst) {
			out, err2 := os.Create(dst)
			if err2 != nil {
				return err2
			}

			_, err = io.Copy(out, fileSrc)
			out.Close()
		}

		return err
	}
	return nil
}

// Move
//
// move src to dst
//
// src source file or dir path
//
// dst destination file or dir path
func Move(src, dst string) error {
	file, err := os.Stat(src)
	if err != nil {
		return err
	}

	if file.IsDir() {
		list, err := ioutil.ReadDir(src)
		if err == nil {
			for _, item := range list {
				if err = Move(filepath.Join(src, item.Name()), filepath.Join(dst, item.Name())); err != nil {
					return err
				}
			}
			os.Remove(src)
		} else {
			if os.IsPermission(err) {
				log.Println("权限不足")
			}
		}
	} else {
		dir := filepath.Dir(dst)
		if !Exists(dir) {
			_ = os.MkdirAll(dir, os.ModePerm)
		}
		if Exists(dst) {
			_ = os.Remove(dst)
		}
		err = os.Rename(src, dst)
		if err != nil {
			log.Println(err.Error())
			return err
		}
		_ = os.Remove(src)

		srcDir := filepath.Dir(src)

		deleteEmptyDir(srcDir)
	}
	return nil
}

func deleteEmptyDir(dir string) {
	list, _ := ioutil.ReadDir(dir)
	if len(list) == 0 {
		os.Remove(dir)
		deleteEmptyDir(filepath.Dir(dir))
	}
}

func FetchFiles(folder, suffix string) (filesList []string) {
	files, _ := os.ReadDir(folder)
	for _, file := range files {
		if file.IsDir() {
			FetchFiles(folder+"/"+file.Name(), suffix)
		} else {
			if suffix == "" {
				filesList = append(filesList, file.Name())
				continue
			}
			fileSuffix := path.Ext(file.Name())
			if strings.HasSuffix(fileSuffix, suffix) {
				filesList = append(filesList, file.Name())
			}
		}
	}

	return
}

func CreateFileTypeToDir(fileDir string, data multipart.File) (string, []byte, error) {
	filePath := fileDir + "/" + UUID()
	out, err := os.Create(filePath)
	if err != nil {
		out.Close()
		return "", nil, err
	}

	var fileType = make([]byte, 10)

	_, err = data.Read(fileType)
	if err != nil {
		out.Close()
		return "", nil, err
	}

	out.Write(fileType)

	_, err = io.Copy(out, data)

	out.Close()
	if err != nil {
		return "", nil, err
	}

	md5 := FileMD5(filePath)

	newPath := fileDir + "/" + md5

	os.Rename(filePath, newPath)

	return md5, fileType, nil
}

func FileSizeCovert(size int64) string {

	if size < 1024 {
		return fmt.Sprintf("%d 字节", size)
	}
	if size < 1024*1024 {
		return fmt.Sprintf("%.2f KB", float64(size/1024.0))
	}
	if size < 1024*1024*1024 {
		return fmt.Sprintf("%.2f KB", float64(size/1024.0/1024))
	}
	if size < 1024*1024*1024*1024 {
		return fmt.Sprintf("%.2f MB", float64(size/1024.0/1024/1024))
	}
	return fmt.Sprintf("%.2f GB", float64(size/1024.0/1024/1024/1024))
}

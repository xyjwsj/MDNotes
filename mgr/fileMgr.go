package mgr

import (
	"changeme/model"
	"changeme/util"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"os"
	"path"
	"sync"
	"time"
)

var operate *Operator

type Operator struct {
	EditeFile *os.File
	UniqueId  string
	Change    bool
	content   []byte
}

func (op *Operator) UpdateContent(content []byte) {
	if len(op.content) != len(content) {
		op.content = content
		op.Change = true
	}
}

func (op *Operator) Content() string {
	return string(op.content)
}

var fileQueue chan *Operator
var syncM sync.Mutex

func init() {
	fileQueue = make(chan *Operator, 100)
	syncM = sync.Mutex{}
	go startFlushDisk()
}

func ImagePath() string {
	return util.CreatePlatformPath(model.AppDataRoot, "image")
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

func AsyncFile(path, content string) {
	syncM.Lock()
	defer syncM.Unlock()
	if operate != nil {
		if operate.UniqueId == path {
			operate.UpdateContent([]byte(content))
			return
		}
	}
	_, _ = StartEdit(path)
	operate.UpdateContent([]byte(content))
}

func StartEdit(path string) (string, error) {
	if operate != nil {
		if path == operate.UniqueId {
			return operate.Content(), nil
		}
		addDiskCloseTask(operate)
	}

	syncM.Lock()
	defer syncM.Unlock()
	editFile, err := util.OpenFileByPath(path)
	if err != nil {
		return "", err
	}

	operate = &Operator{
		EditeFile: editFile,
		UniqueId:  path,
		Change:    false,
	}

	file, err := io.ReadAll(editFile)
	if err != nil {
		addDiskCloseTask(operate)
		return "", err
	}

	content := util.DecryptContent(file, UniqueId())

	operate.UpdateContent(content)

	return operate.Content(), nil
}

func addDiskCloseTask(op *Operator) {
	if fileQueue != nil {
		fileQueue <- op
	}
}

func startFlushDisk() {
	ticker := time.NewTicker(5 * time.Second)
	for {
		select {
		case <-ticker.C:
			if operate != nil {
				if !operate.Change {
					continue
				}
				cleanWrite(operate)
				operate.Change = false
			}
		case op := <-fileQueue:
			if op.Change {
				cleanWrite(op)
				operate.Change = false
			}
			op.EditeFile.Close()
			op.EditeFile = nil
			op = nil
		}
	}
}

func cleanWrite(op *Operator) {
	// 清空文件
	err := op.EditeFile.Truncate(0)
	if err != nil {
		log.Println("Truncate failed:", err)
	}

	content, err := util.EncryptContent(op.content, UniqueId())
	if err != nil {
		log.Println("Encrypt failed:", err)
	}
	log.Println("Encrypt New Content ...")

	_, err = op.EditeFile.WriteAt(content, 0)
	if err != nil {
		log.Println("Write failed:", err)
	}
	log.Println("Write New Content ...")
}

func ExportFile(source, target string) error {
	editFile, err := util.OpenFileByPath(source)
	if err != nil {
		return err
	}

	file, err := io.ReadAll(editFile)
	if err != nil {
		return err
	}

	content := util.DecryptContent(file, UniqueId())

	return os.WriteFile(target, content, os.ModePerm)
}

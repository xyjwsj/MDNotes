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
	"time"
)

var operates map[string]*Operator

type ModifyItem struct {
	UniqueId string // 修改item
	Content  string // 修改内容
}

type Operator struct {
	EditeFile       *os.File // 编辑的文件
	UniqueId        string   // 文件路径/唯一id
	Change          bool     // 内容是否变动
	ModifyTimestamp int64    // 修改时间戳
	content         []byte   // 当前文件内容
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

var modifyQueue chan ModifyItem
var stopQueue chan int

func init() {
	modifyQueue = make(chan ModifyItem, 100)
	operates = make(map[string]*Operator, 30)
	stopQueue = make(chan int, 1)
	Register(func() {
		stopQueue <- 1
	})
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
	if modifyQueue != nil {
		select {
		case modifyQueue <- ModifyItem{
			UniqueId: path,
			Content:  content,
		}:
		default:
			// 队列已满，可以选择丢弃或记录日志
			log.Println("modifyQueue is full, task dropped")
		}
	}
}

func StartEdit(path string) (string, error) {
	if op, ok := operates[path]; ok {
		if op.UniqueId == path {
			return op.Content(), nil
		}
	}

	editFile, err := util.OpenFileByPath(path)
	if err != nil {
		return "", err
	}

	file, err := io.ReadAll(editFile)
	if err != nil {
		editFile.Close()
		return "", err
	}

	content := util.DecryptContent(file, UniqueId())

	operates[path] = &Operator{
		EditeFile:       editFile,
		UniqueId:        path,
		Change:          false,
		content:         content,
		ModifyTimestamp: time.Now().Unix(),
	}

	return operates[path].Content(), nil
}

func startFlushDisk() {
	ticker := time.NewTicker(5 * time.Second)
	for {
		select {
		case <-ticker.C:
			for _, item := range operates {
				if item.Change {
					truncateWrite(item)
					item.Change = false
				} else if time.Now().Unix()-30 > item.ModifyTimestamp {
					log.Println("Over 30 second， close file " + item.UniqueId)
					item.EditeFile.Close()
					delete(operates, item.UniqueId)
					item.EditeFile = nil
					item = nil
				}
			}
		case item := <-modifyQueue:
			if _, ok := operates[item.UniqueId]; !ok {
				StartEdit(item.UniqueId)
			}
			op := operates[item.UniqueId]
			op.content = []byte(item.Content)
			op.Change = true
			op.ModifyTimestamp = time.Now().Unix()
		case <-stopQueue:
			log.Println("Start Clean System...")
			for _, item := range operates {
				if item.Change {
					truncateWrite(item)
				}
				item.EditeFile.Close()
				log.Println("Close Application， close file " + item.UniqueId)
				delete(operates, item.UniqueId)
				item.EditeFile = nil
				item = nil
			}
		}
	}
}

func truncateWrite(op *Operator) {
	// 清空文件（0 表示清空到第 0 字节）
	if err := op.EditeFile.Truncate(0); err != nil {
		log.Printf("Truncate failed: %v", err)
		return // 或根据上下文处理错误
	}

	// 生成加密内容
	encryptionKey := UniqueId() // 提前生成密钥便于调试
	content, err := util.EncryptContent(op.content, encryptionKey)
	if err != nil {
		log.Printf("Encrypt failed (key=%s): %v", encryptionKey, err)
		return
	}
	log.Printf("Encrypted new content with key: %s", encryptionKey)

	// 写入加密内容（需重置文件偏移量）
	if _, err := op.EditeFile.Seek(0, 0); err != nil { // 确保从文件头写入
		log.Printf("Seek reset failed: %v", err)
		return
	}

	if _, err := op.EditeFile.Write(content); err != nil { // 直接使用 Write 更简洁
		log.Printf("Write failed: %v", err)
		return
	}
	log.Println("New content written successfully")

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

func OriginContent(source string) string {
	editFile, err := util.OpenFileByPath(source)
	if err != nil {
		return ""
	}

	file, err := io.ReadAll(editFile)
	if err != nil {
		return ""
	}

	return string(util.DecryptContent(file, UniqueId()))
}

package main

import (
	"changeme/mgr"
	"changeme/model"
	"changeme/util"
	"embed"
	"io"
	"log"
	"net/http"
	"path/filepath"
	"strings"
)

//go:embed all:vditor/dist
var vditorAssets embed.FS

func ImageApi(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 示例：拦截 /api 请求
		path := r.URL.Path
		if strings.HasPrefix(path, "/mdNotes/vditor") {
			absPath := strings.TrimPrefix(path, "/mdNotes/vditor")
			join := filepath.Join("vditor", absPath)
			join = strings.ReplaceAll(join, `\`, `/`)
			file, err := vditorAssets.ReadFile(join)
			if err != nil {
				http.NotFound(w, r)
				log.Println(absPath + " Read File Error:" + err.Error())
				return
			}
			ext := filepath.Ext(join)
			switch ext {
			case ".js":
				w.Header().Set("Content-Type", "application/javascript")
			case ".css":
				w.Header().Set("Content-Type", "text/css")
			case ".png":
				w.Header().Set("Content-Type", "image/png")
			case ".woff2":
				w.Header().Set("Content-Type", "font/woff2")
			default:
				w.Header().Set("Content-Type", "application/octet-stream")
			}

			w.Write(file)
			return
		}
		if strings.HasPrefix(path, "/api/upload") {
			if r.Method == "OPTIONS" {
				w.Header().Set("Access-Control-Allow-Origin", "*")
				w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
				w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Upload-Token")
				w.WriteHeader(http.StatusOK)
				return
			}
			contentType := r.Header.Get("Content-Type")
			log.Printf("Content-Type: %s", contentType)
			switch {
			case strings.Contains(contentType, "application/json"):
				body, _ := io.ReadAll(r.Body)
				bodyStr := string(body)
				var data map[string]string
				_ = util.Json2Struct(bodyStr, &data)
				if url, ok := data["url"]; ok {
					saveFile, err := mgr.SaveInternetImag(url)
					if err != nil {
						w.WriteHeader(500)
						return
					}
					w.WriteHeader(200)
					w.Write([]byte(util.Struct2Json(map[string]string{
						"originUrl": url,
						"url":       saveFile,
					})))
					return
				}
			case strings.Contains(contentType, "application/x-www-form-urlencoded"):
				log.Println("表单提交")
			case strings.Contains(contentType, "multipart/form-data"):
				// 设置最大内存为 10MB
				r.Body = http.MaxBytesReader(w, r.Body, 10<<20)
				r.ParseMultipartForm(100)
				mForm := r.MultipartForm
				f := mForm.File
				if len(f) > 0 {
					log.Println("文件存在...")
					for k, _ := range f {
						file, _, _ := r.FormFile(k)
						if file == nil {
							log.Println("文件数据获取出错 int")
							w.WriteHeader(404)
							return
						}
						saveFile, err := mgr.SaveFile(file)
						if err != nil {
							w.WriteHeader(500)
							return
						}
						w.WriteHeader(200)
						w.Write([]byte(saveFile))
						return
					}
				}
				log.Println("文件数据获取出错 out")
				w.WriteHeader(404)
				return
			default:
				log.Println("未知内容类型")
			}
			// 响应客户端
			w.WriteHeader(http.StatusInternalServerError)
		}

		if strings.HasPrefix(path, "/api/resource") {
			path = strings.ReplaceAll(path, "/api/resource/", "")
			platformPath := util.CreatePlatformPath(model.CacheDirMg, path)
			fileType := util.GetFileType(platformPath)
			log.Println("xxxxxx1111" + platformPath + "---" + fileType)

			w.Header().Set("Content-Type", "image/"+fileType)

			w.Header().Set("Cache-Control", "public, max-age=31536000")
			http.ServeFile(w, r, platformPath)
			return
		}

		// 其他请求继续交给默认处理器
		next.ServeHTTP(w, r)
	})
}

func createInternetImgResponse(url string) map[string]any {
	result := map[string]any{
		"msg":  "",
		"code": 0,
	}
	saveFile, err := mgr.SaveInternetImag(url)
	if err != nil {
		result["code"] = -1
		result["msg"] = err.Error()
		return result
	}
	data := map[string]string{
		"originalURL": url,
		"url":         saveFile,
	}
	result["data"] = data
	return result
}

package main

import (
	"changeme/mgr"
	"changeme/util"
	"embed"
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
		}

		if strings.HasPrefix(path, "/api/resource") {
			path = strings.ReplaceAll(path, "/api/resource/", "")
			platformPath := util.CreatePlatformPath(mgr.ImagePath(), path)
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

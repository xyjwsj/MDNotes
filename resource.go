package main

import (
	"changeme/mgr"
	"changeme/util"
	"log"
	"net/http"
	"strings"
)

func ImageApi(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 示例：拦截 /api 请求
		path := r.URL.Path
		log.Println("xxxxxxxx" + r.URL.Path)
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

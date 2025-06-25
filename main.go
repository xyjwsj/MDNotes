package main

import (
	"changeme/handler"
	"changeme/mgr"
	"changeme/model"
	"embed"
	_ "embed"
	"log"
	"runtime"
	"time"

	"github.com/wailsapp/wails/v3/pkg/application"
)

// Wails uses Go's `embed` package to embed the frontend files into the binary.
// Any files in the frontend/dist folder will be embedded into the binary and
// made available to the frontend.
// See https://pkg.go.dev/embed for more information.

//go:embed all:frontend/dist
var assets embed.FS

// main function serves as the application's entry point. It initializes the application, creates a window,
// and starts a goroutine that emits a time-based event every second. It subsequently runs the application and
// logs any error that might occur.
func main() {

	defer func() {
		if err := recover(); err != nil {
			log.Printf("Panic recovered: %v", err)
		}
	}()

	// Create a new Wails application by providing the necessary options.
	// Variables 'Name' and 'Description' are for application metadata.
	// 'Assets' configures the asset server with the 'FS' variable pointing to the frontend files.
	// 'Bind' is a list of Go struct instances. The frontend has access to the methods of these instances.
	// 'Mac' options tailor the application when running an macOS.
	app := application.New(application.Options{
		Name:        "LiveMark",
		Description: "A demo of using raw HTML & CSS",
		Services: []application.Service{
			application.NewService(&handler.FileHandler{}),
			application.NewService(&handler.SystemHandler{}),
			application.NewService(&handler.ResourceHandler{}),
		},
		Assets: application.AssetOptions{
			Handler:    application.AssetFileServerFS(assets),
			Middleware: ImageApi,
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
		Windows: application.WindowsOptions{
			DisableQuitOnLastWindowClosed: false,
		},
	})

	// Create a new window with the necessary options.
	// 'Title' is the title of the window.
	// 'Mac' options tailor the window when running on macOS.
	// 'BackgroundColour' is the background colour of the window.
	// 'URL' is the URL that will be loaded into the webview.
	app.NewWebviewWindowWithOptions(application.WebviewWindowOptions{
		Title:  "LiveMark",
		Width:  1050,
		Height: 850,
		Mac: application.MacWindow{
			InvisibleTitleBarHeight: 50,
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                application.MacTitleBarHiddenInset,
		},
		Windows: application.WindowsWindow{
			DisableFramelessWindowDecorations: true,
			BackdropType:                      application.None,
		},
		BackgroundColour: application.NewRGB(27, 38, 54),
		URL:              "/",
	})

	app.OnWindowCreation(func(window application.Window) {
		if runtime.GOOS == "windows" {

		}
	})

	app.OnShutdown(func() {
		// 创建一个超时通道，防止无限等待
		done := make(chan bool, 1)
		go func() {
			defer close(done)

			// 执行你的清理逻辑
			mgr.NotifyEvent()

			// 如果有其他资源需要释放，也可以在这里调用
			// e.g: db.Close(), fileMgr.FlushAll(), etc
		}()

		// 设置最大等待时间（例如 5 秒）
		select {
		case <-done:
			log.Println("Cleanup completed.")
		case <-time.After(5 * time.Second):
			log.Println("Cleanup timeout exceeded. Force shutdown.")
		}
	})

	//// 创建菜单
	//menu := app.NewMenu()
	//
	//// 文件菜单
	//_ = menu.Add("文件")
	//
	//app.SetMenu(menu)

	// Create a goroutine that emits an event containing the current time every second.
	// The frontend can listen to this event and update the UI accordingly.
	go func() {
		for {
			now := time.Now().Format(time.RFC1123)
			app.EmitEvent("time", now)
			time.Sleep(time.Second)
		}
	}()

	model.UpdateApp(app)

	// Run the application. This blocks until the application has been exited.
	err := app.Run()

	// If an error occurred while running the application, log it and exit.
	if err != nil {
		log.Fatal(err)
	}
}

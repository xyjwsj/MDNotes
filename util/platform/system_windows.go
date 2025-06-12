//go:build windows

package platform

import "syscall"

func GetMetricInfo() *ScreenInfo {
	return &ScreenInfo{
		Width:  systemMetrics(0),
		Height: systemMetrics(1),
	}
}

func systemMetrics(nIndex int) int {
	ret, _, _ := syscall.NewLazyDLL(`User32.dll`).NewProc(`GetSystemMetrics`).Call(uintptr(nIndex))
	return int(ret)
}

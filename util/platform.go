package util

import (
	"log"
	"strings"
)

func OpenLocation(path string) {
	if CurrentOsType() != WINDOWS {
		log.Println("OpenLocation Macos:", path)
		ExecuteShell("open " + path)
	} else {
		path = strings.ReplaceAll(path, "/", "\\")
		log.Println("OpenLocation Windows:", path)
		ExecuteShell("start explorer " + path)
	}
}

func SelectLocation(path string) {
	if CurrentOsType() != WINDOWS {
		log.Println("OpenLocation Macos:", path)
		ExecuteShell("open -R " + path)
	} else {
		path = strings.ReplaceAll(path, "/", "\\")
		log.Println("OpenLocation Windows:", path)
		ExecuteShell("start explorer /select," + path)
	}
}

func SystemName() string {
	if CurrentOsType() != WINDOWS {
		return "macosx"
	} else {
		return "windows"
	}
}

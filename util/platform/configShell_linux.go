//go:build linux

package platform

import (
	"os/exec"
	"syscall"
)

func ConfigShell(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{Foreground: false}
}

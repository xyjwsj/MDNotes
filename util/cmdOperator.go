package util

import (
	"bufio"
	"changeme/util/platform"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"runtime"
	"syscall"
)

type OsType string

const (
	MACOS   OsType = "mac"
	WINDOWS OsType = "windows"
	LINUX   OsType = "linux"
)

var logMsgQueue chan<- string
var signalQueue chan os.Signal

func ConfigMsgQueue(queue chan<- string) {
	log.Println("配置命令行输出队列...")
	logMsgQueue = queue
}

func ConfigSignalQueue(queue chan os.Signal) {
	log.Println("配置命令行信号队列...")
	signalQueue = queue
}

func CurrentOsType() OsType {
	os := runtime.GOOS
	if os == "darwin" {
		return MACOS
	}
	if os == "linux" {
		return LINUX
	}
	return WINDOWS
}

func ExecuteConsoleAsync(console bool, shell string) error {
	log.Println("ExecuteShell method execute:  " + shell)

	var command *exec.Cmd

	if CurrentOsType() != WINDOWS {
		command = exec.Command("/bin/sh", "-c", shell)
	} else {
		command = exec.Command("cmd", "/c", shell)
	}

	platform.ConfigShell(command)

	stdIn, _ := command.StdinPipe()
	defer stdIn.Close()

	if signalQueue != nil {
		log.Println("命令行监听信号队列...")
		go func(cmd *exec.Cmd, writer io.WriteCloser) {
			for signal := range signalQueue {
				switch signal {
				case os.Interrupt:
					log.Printf("Interrupt Command Address of %p start...\n", cmd)
					if CurrentOsType() == MACOS {
						cmd.Process.Signal(syscall.SIGINT)
					}
					if CurrentOsType() == WINDOWS {
						cmdStr := `{"command":"EXIT"}`
						_, err := io.WriteString(writer, cmdStr+"\n")
						if err != nil {
							log.Println(err)
						}
					}

					log.Printf("Interrupt Command Address of %p end...\n", cmd)
					return
				case os.Kill:
					log.Println("Kill")
					if CurrentOsType() == MACOS {
						cmd.Process.Signal(syscall.SIGKILL)
					}
					if CurrentOsType() == WINDOWS {
						cmdStr := `{"command":"EXIT"}`
						_, err := io.WriteString(writer, cmdStr+"\n")
						if err != nil {
							log.Println(err)
						}
					}
					return
				}
			}
		}(command, stdIn)
	}

	stdout, err := command.StdoutPipe()
	defer stdout.Close()

	if err != nil {
		pushLogQueue(err.Error())
		log.Println("err:" + err.Error())
	}
	errReader, err := command.StderrPipe()

	//开启错误处理
	go handlerErr(errReader)

	if err != nil {
		pushLogQueue(err.Error())
		log.Println(err)
		return err
	}

	err = command.Start()
	//err = command.Run()
	if nil != err {
		pushLogQueue(err.Error())
		if console {
			log.Println(err)
		}
		return err
	}

	//fmt.Println("Process PID:", command.Process.Pid)
	log.Printf("Command Address of %p\n", command)

	go func() {
		in := bufio.NewScanner(stdout)
		for in.Scan() {
			pushLogQueue(string(in.Bytes()))
			if console {
				log.Println(string(in.Bytes()))
			}
		}
	}()

	err = command.Wait()
	if nil != err {
		pushLogQueue(err.Error())
		log.Println(err)
		return err
	}
	return nil
}

func ExecuteShellConsoleAsync(shell string, console bool) error {
	log.Println("ExecuteShell method execute:  " + shell)

	var command *exec.Cmd

	if CurrentOsType() != WINDOWS {
		command = exec.Command("/bin/bash", "-c", shell)
	} else {
		command = exec.Command("cmd", "/c", shell)
	}

	platform.ConfigShell(command)

	stdout, err := command.StdoutPipe()

	if err != nil {
		pushLogQueue(err.Error())
		log.Println("err:" + err.Error())
	}
	errReader, err := command.StderrPipe()

	//开启错误处理
	go handlerErr(errReader)

	if err != nil {
		pushLogQueue(err.Error())
		log.Println(err)
		return err
	}

	err = command.Start()
	if nil != err {
		pushLogQueue(err.Error())
		if console {
			log.Println(err)
		}
		return err
	}

	//fmt.Println("Process PID:", command.Process.Pid)

	in := bufio.NewScanner(stdout)
	for in.Scan() {
		pushLogQueue(string(in.Bytes()))
		if console {
			log.Println(string(in.Bytes()))
		}
	}

	err = command.Wait()
	if nil != err {
		pushLogQueue(err.Error())
		log.Println(err)
		return err
	}
	return nil
}

func ExecuteShellAsync(shell string, out bool) error {
	log.Println("ExecuteShell method execute:  " + shell)

	var command *exec.Cmd

	if CurrentOsType() != WINDOWS {
		command = exec.Command("/bin/bash", "-c", shell)
	} else {
		command = exec.Command("cmd", "/c", shell)
	}

	platform.ConfigShell(command)

	stdout, err := command.StdoutPipe()

	if err != nil {
		pushLogQueue(err.Error())
		log.Println("err:" + err.Error())
	}
	errReader, err := command.StderrPipe()

	//开启错误处理
	go handlerErr(errReader)

	if err != nil {
		pushLogQueue(err.Error())
		log.Println(err)
		return err
	}

	err = command.Start()
	if nil != err {
		pushLogQueue(err.Error())
		log.Println(err)
		return err
	}

	//fmt.Println("Process PID:", command.Process.Pid)

	if out {
		in := bufio.NewScanner(stdout)
		for in.Scan() {
			pushLogQueue(string(in.Bytes()))
			log.Println(string(in.Bytes()))
		}
	}

	err = command.Wait()
	if nil != err {
		pushLogQueue(err.Error())
		log.Println(err)
		return err
	}
	return nil
}

func ExecuteShell(shell string) ([]string, error) {
	return nil, ExecuteShellAsync(shell, true)
}

// ExecuteShellSync execute shell cmd, return result and error info
//
// shell prepare execute cmd
//
// return string and error
func ExecuteShellSync(shell string) ([]string, error) {
	log.Println("ExecuteShell method execute:  " + shell)

	result := make([]string, 0)

	var command *exec.Cmd

	if CurrentOsType() != WINDOWS {
		command = exec.Command("/bin/bash", "-c", shell)
	} else {
		command = exec.Command("cmd", "/c", shell)
	}

	platform.ConfigShell(command)

	stdout, err := command.StdoutPipe()

	if err != nil {
		pushLogQueue(err.Error())
		log.Println("err:" + err.Error())
	}
	errReader, err := command.StderrPipe()

	//开启错误处理
	go handlerErr(errReader)

	if err != nil {
		log.Println(err)
		return nil, err
	}

	err = command.Start()
	if nil != err {
		pushLogQueue(err.Error())
		log.Println(err)
		return nil, err
	}

	//fmt.Println("Process PID:", command.Process.Pid)

	in := bufio.NewScanner(stdout)
	for in.Scan() {
		pushLogQueue(string(in.Bytes()))
		log.Println(string(in.Bytes()))
		result = append(result, string(in.Bytes()))
	}

	err = command.Wait()
	if nil != err {
		pushLogQueue(err.Error())
		log.Println(err)
		return nil, err
	}
	return result, nil
}

// 开启一个协程来错误
func handlerErr(errReader io.ReadCloser) {
	in := bufio.NewScanner(errReader)
	for in.Scan() {
		pushLogQueue(string(in.Bytes()))
		fmt.Errorf(string(in.Bytes()))
	}
}

func pushLogQueue(data string) {
	if logMsgQueue != nil {
		logMsgQueue <- data
	}
}

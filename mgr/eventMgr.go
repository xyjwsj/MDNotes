package mgr

type Handler func()

var systemRegister []Handler

func init() {
	systemRegister = make([]Handler, 0)
}

func Register(register Handler) {
	systemRegister = append(systemRegister, register)
}

func NotifyEvent() {
	for _, register := range systemRegister {
		register()
	}
}

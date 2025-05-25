const SameDay = (source: Date, target: Date) => {
    return source.getMonth() === target.getMonth() && source.getFullYear() === target.getFullYear() && source.getDay() === target.getDay()
}

export {
    SameDay
}
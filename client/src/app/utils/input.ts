export const onChangeFn = (fn: (v: string) => void) => (e: { currentTarget: { value: string } }) => {
    fn(e.currentTarget.value)
}

export const onSubmitFn = (fn: () => void) => (e: { preventDefault: () => void }) => {
    e.preventDefault()
    fn()
}

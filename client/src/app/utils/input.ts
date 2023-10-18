export const onChangeFn = (fn: (v: string) => void) => (e: { currentTarget: { value: string } }) => {
    fn(e.currentTarget.value)
}

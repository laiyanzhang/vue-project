// 为所有非 .vue 的 JS/TS 模块提供基本类型
declare module '@/utils/*' {
  const value: unknown
  export default value
}
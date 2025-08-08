module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-essential",
    "@vue/typescript/recommended",
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  globals: {
    "$t": "readonly",  // 添加这一行
    "$i18n": "readonly" // 如果需要也可以添加
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "vue/multi-word-component-names": "off",
    semi: "off",
    "@typescript-eslint/semi": "off",
    "vue/no-v-model-argument": "off",
    "@typescript-eslint/no-explicit-any": "off"
  },
}

/// <reference types="vite/client" />

declare module '*.PNG' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

declare module '*.mp4' {
  const src: string
  export default src
}

declare module '*.md?raw' {
  const content: string
  export default content
}

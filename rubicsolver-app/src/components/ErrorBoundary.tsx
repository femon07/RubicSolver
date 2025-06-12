import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(error, info)
  }

  render() {
    if (this.state.hasError) {
      return <div>予期せぬエラーが発生しました。ページを再読み込みしてください。</div>
    }
    return this.props.children
  }
}

export default ErrorBoundary

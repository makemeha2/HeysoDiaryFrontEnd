import { useState } from 'react'

export default function Login() {
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')

  function onSubmit(e) {
    e.preventDefault()
    alert(`로그인 요청\nID: ${id}`)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-sand/50 bg-white/80 p-8 shadow-soft">
        <h1 className="mb-6 text-2xl font-bold text-clay">로그인</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-id" className="mb-1 block text-sm text-clay/80">
              아이디
            </label>
            <input
              id="login-id"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full rounded-xl border border-sand/60 bg-white/90 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber/40"
              placeholder="이메일 또는 아이디"
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="login-pw" className="mb-1 block text-sm text-clay/80">
              비밀번호
            </label>
            <input
              id="login-pw"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full rounded-xl border border-sand/60 bg-white/90 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber/40"
              placeholder="비밀번호"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-amber px-4 py-3 font-semibold text-white hover:opacity-95 active:opacity-90"
          >
            로그인
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-clay/60">
          <div className="h-px flex-1 bg-sand/60" />
          <span>또는</span>
          <div className="h-px flex-1 bg-sand/60" />
        </div>

        <button
          type="button"
          className="w-full rounded-xl border border-sand/60 bg-white/90 px-4 py-3 text-clay hover:bg-white"
          onClick={() => alert('구글 로그인 (추가 예정)')}
        >
          <span className="inline-flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden className="-mt-px">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.64,6.053,29.084,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,14,24,14c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.64,6.053,29.084,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.136,0,9.8-1.97,13.304-5.181l-6.146-5.203C29.104,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.524,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.146,5.616c0,0,0,0,0,0l6.146,5.203 C36.971,39.064,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            <span>Google로 로그인</span>
          </span>
        </button>

        <div className="mt-6 flex items-center justify-between text-sm">
          <button
            className="text-clay/70 hover:text-clay"
            onClick={() => alert('회원가입 (추가 예정)')}
          >
            회원가입
          </button>

          <div className="flex items-center text-clay/70">
            <button
              className="text-amber hover:opacity-90"
              onClick={() => alert('계정 찾기 (추가 예정)')}
            >
              계정찾기
            </button>
            <span className="mx-2 select-none text-sand/70">|</span>
            <button
              className="text-amber hover:opacity-90"
              onClick={() => alert('비밀번호 찾기 (추가 예정)')}
            >
              비밀번호 찾기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


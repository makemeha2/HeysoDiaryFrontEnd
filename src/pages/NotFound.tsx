import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 text-foreground">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="mt-2 text-3xl font-semibold">페이지를 찾을 수 없습니다</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          이 경로는 사용자 사이트 리뉴얼 범위에서 제거되었거나 존재하지 않습니다.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          홈으로 이동
        </Link>
      </div>
    </main>
  );
}

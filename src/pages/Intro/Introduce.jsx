import logoImg from '@assets/heysoDiaryLogo.png';
import diaryShot from '@assets/screen_capture_1.png';

const Introduce = () => {
  return (
    <div className="py-10">
      {/* HERO */}
      <section className="rounded-3xl border border-sand/50 bg-white/70 p-8 shadow-soft">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay/50">About</p>

            <h1 className="mt-3 text-3xl font-bold text-clay">
              조용히 쓰면, AI 친구가 한마디 남겨줘요.
            </h1>

            <p className="mt-4 text-base leading-relaxed text-clay/80">
              Heyso Diary는 하루의 감정과 생각을 부담 없이 기록하는 개인 일기 서비스입니다. 글을
              쓰고 저장하면, AI가 친구처럼 짧은 댓글로 오늘의 흐름을 함께 정리해 줍니다. 과한
              기능보다 <span className="font-semibold text-clay">꾸준히 쓰기 쉬운 경험</span>과
              <span className="font-semibold text-clay"> 안전한 보관</span>을 가장 우선합니다.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-sand/50 bg-linen/70 px-5 py-2.5 text-sm font-semibold text-clay shadow-soft transition hover:bg-linen"
              >
                오늘 일기 쓰기
              </a>
              <a
                href="/aichat"
                className="inline-flex items-center justify-center rounded-full border border-sand/50 bg-white/70 px-5 py-2.5 text-sm font-semibold text-clay/80 shadow-soft transition hover:bg-white"
              >
                AI Chat 사용해보기
              </a>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-xs text-clay/60">
              <span className="rounded-full border border-sand/40 bg-white/70 px-3 py-1">
                일기 작성 후 AI 댓글
              </span>
              <span className="rounded-full border border-sand/40 bg-white/70 px-3 py-1">
                잔잔한 UI · 집중 방해 최소화
              </span>
              <span className="rounded-full border border-sand/40 bg-white/70 px-3 py-1">
                프라이버시 우선
              </span>
            </div>
          </div>

          {/* LOGO */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-sand/40 bg-linen/60 p-6 shadow-soft">
              <div className="flex items-center justify-center">
                <img
                  src={logoImg}
                  alt="Heyso Diary logo"
                  className="h-auto w-full max-w-[320px] select-none"
                  draggable={false}
                />
              </div>
              <p className="mt-4 text-center text-xs text-clay/60">
                “기록은 조용히, 응원은 따뜻하게.”
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SHOWCASE - 캡처 활용 */}
      <section className="mt-8 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-sand/50 bg-white/70 p-7 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay/50">
              AI Comment
            </p>
            <h2 className="mt-3 text-xl font-semibold text-clay">
              일기를 저장하면, AI가 “한마디”를 남깁니다.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-clay/70">
              오늘 글의 분위기와 핵심 포인트를 짚어주고, 무리 없는 작은 제안을 건네요. 부담스럽지
              않게, 하지만 혼자 쓰는 느낌은 덜어주는 형태를 목표로 합니다.
            </p>

            <div className="mt-5 rounded-2xl border border-sand/40 bg-linen/70 p-5">
              <p className="text-sm font-semibold text-clay/80">이런 분께 특히 좋아요</p>
              <ul className="mt-3 space-y-2 text-sm text-clay/70">
                <li>• 일기를 쓰지만 “정리가 잘 됐는지” 확신이 없을 때</li>
                <li>• 습관을 만들고 싶지만 과한 앱 기능이 피곤할 때</li>
                <li>• 누군가에게 털어놓긴 어렵지만 반응은 조금 받고 싶을 때</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-sand/50 bg-white/70 p-4 shadow-soft">
            <div className="overflow-hidden rounded-2xl border border-sand/40 bg-white">
              <img
                src={diaryShot}
                alt="Heyso Diary AI comment screenshot"
                className="h-auto w-full"
                draggable={false}
              />
            </div>
            <p className="mt-3 px-2 text-xs text-clay/60">
              실제 화면 예시: 일기 작성 후 우측에서 AI 댓글을 확인할 수 있어요.
            </p>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-sand/40 bg-white/70 p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-clay">AI가 남기는 작은 댓글</h2>
          <p className="mt-3 text-sm leading-relaxed text-clay/70">
            일기를 읽고 짧게 응답해주는 “친구 같은 코멘트”로 기록의 만족감을 높입니다. 과장 없이,
            차분하게.
          </p>
        </div>

        <div className="rounded-2xl border border-sand/40 bg-white/70 p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-clay">기록의 약속</h2>
          <p className="mt-3 text-sm leading-relaxed text-clay/70">
            일기는 사적인 공간이어야 합니다. 필요한 권한과 최소한의 정보로 서비스를 운영하며, 안전한
            보관을 우선합니다.
          </p>
        </div>

        <div className="rounded-2xl border border-sand/40 bg-white/70 p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-clay">지속 가능한 루틴</h2>
          <p className="mt-3 text-sm leading-relaxed text-clay/70">
            매일 3분, 나를 돌아보는 시간. 복잡한 기능 대신 오래 쓰기 쉬운 경험을 만들어 갑니다.
          </p>
        </div>
      </section>

      {/* AI CHAT ROADMAP */}
      <section className="mt-8 rounded-3xl border border-sand/50 bg-white/70 p-8 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay/50">AI Chat</p>
        <h2 className="mt-3 text-xl font-semibold text-clay">
          질문하면 답해주는 AI, 그리고 “일기 특화”로 계속 진화합니다.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-clay/70">
          Heyso Diary의 AI Chat은 단순한 대화형 챗봇을 목표로 하지 않습니다. 기록을 바탕으로
          감정·루틴·회고에 더 잘 맞는 방향으로 지속적으로 개발하여, 장기적으로는{' '}
          <span className="font-semibold text-clay">일기 맥락에서 더 특화된 경험</span>을 제공할
          예정입니다.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-sand/40 bg-linen/70 p-5">
            <p className="text-sm font-semibold text-clay/80">지금 가능한 것</p>
            <p className="mt-2 text-sm text-clay/70">
              일기 내용 기반 질문, 요약/정리, 다음 행동 제안
            </p>
          </div>
          <div className="rounded-2xl border border-sand/40 bg-linen/70 p-5">
            <p className="text-sm font-semibold text-clay/80">가까운 업데이트</p>
            <p className="mt-2 text-sm text-clay/70">
              더 정확한 문맥 회고, 연관 기록 탐색, 개인화된 톤/피드백
            </p>
          </div>
          <div className="rounded-2xl border border-sand/40 bg-linen/70 p-5">
            <p className="text-sm font-semibold text-clay/80">장기 목표</p>
            <p className="mt-2 text-sm text-clay/70">
              “일기와 루틴”에 특화된 도우미로 진화 (ChatGPT의 범용성을 넘어)
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="mt-8 rounded-3xl border border-sand/50 bg-white/70 p-8 shadow-soft">
        <h2 className="text-xl font-semibold text-clay">연락 채널</h2>
        <p className="mt-3 text-sm text-clay/70">
          제안, 문의, 피드백은 언제든 환영합니다. 특히 “AI 댓글이 이런 톤이면 좋겠다” 같은 의견이 큰
          도움이 됩니다.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-sand/40 bg-linen/70 p-5">
            <p className="text-sm font-semibold text-clay/80">카카오톡</p>
            <p className="mt-2 text-base font-medium text-clay">
              <a href="https://open.kakao.com/o/stZRPOei" target="_blank" rel="noreferrer">
                Heyso Diary
              </a>
            </p>
            <p className="mt-2 text-xs text-clay/60">카카오톡 검색에서 아이디를 입력해 주세요.</p>
          </div>

          <div className="rounded-2xl border border-sand/40 bg-linen/70 p-5">
            <p className="text-sm font-semibold text-clay/80">이메일</p>
            <p className="mt-2 text-base font-medium text-clay">makemeha2@gmail.com</p>
            <p className="mt-2 text-xs text-clay/60">48시간 이내에 답변드리겠습니다.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Introduce;

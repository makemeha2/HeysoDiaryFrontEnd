# Codex 개발용 Agents 규칙 (agents.md)

Codex로 프로젝트를 개발할 때 일관된 코드 스타일과 파일 구조를 유지하기 위한 규칙을 정의합니다. 특히 **React JSX 파일 개발 시 import/export 규칙을 명확히** 하기 위해 아래 가이드를 따릅니다.

---

## 📌 JSX 파일 생성 규칙

### ✔ 함수 작성 방식 규칙 (추가)

- 기본적으로 **Arrow Function** 또는 **Function Expression** 방식을 우선적으로 사용한다.
- 다만, **성능적인 이유** 또는 **필요한 경우**에는 **Function Declaration 방식도 허용**한다.
- Codex는 상황에 맞게 가장 적절한 방식을 선택할 수 있으나, 특별한 이유가 없다면 아래 우선순위를 따른다:
  1. **Arrow Function**
  2. **Function Expression**
  3. **Function Declaration** (필요한 경우에만)
     JSX 기반 컴포넌트 파일을 생성할 때는 아래 형식을 반드시 사용합니다.

### ✔ 기본 구조

```jsx
const {
  파일명,
} = () => {
  return <div>{/* 컴포넌트 내용 */}</div>;
};

export default { 파일명 };
```

### ✔ 규칙 설명

- 컴포넌트 이름은 **파일명과 동일하게** 한다.
- 함수형 컴포넌트는 `const {파일명} = () => { ... }` 형태로 선언한다.
- 마지막 줄에는 **`export default {파일명};`** 규칙을 따른다.
- 반드시 **중괄호 없이** default export를 하지 않는다.

---

## 📌 Agents 행동 규칙

Codex가 자동으로 코드를 생성할 때 아래 원칙을 지켜야 한다.

### 1. **파일명 기반 자동 네이밍**

- Codex는 JSX 파일을 생성할 때 파일명을 기준으로 컴포넌트 이름을 자동 설정해야 한다.
- 파일명이 `LoginForm.jsx`라면 컴포넌트 이름은 `LoginForm`이어야 한다.

### 2. **일관된 export 형식 유지**

- 모든 JSX 컴포넌트는 `export default 파일명;` 형식으로 마무리해야 한다.
- 헷갈리기 쉬운 아래 예시는 금지한다:

  ```jsx
  export default function LoginForm() {}
  ```

  ```jsx
  const LoginForm = () => {};
  export default LoginForm;
  ```

  반드시 아래 형태만 허용:

  ```jsx
  const LoginForm = () => {};
  export default LoginForm;
  ```

### 3. **프레임워크 내 일관성 보장**

- 모든 pages, components, layouts 폴더 내 JSX 파일은 동일한 규칙을 따른다.
- 코드 리뷰 시 Codex가 자동으로 규칙을 검증하고 필요한 경우 수정안을 제시한다.

---

## 📌 예시 모음

### ✔ `Home.jsx`

```jsx
const Home = () => {
  return <h1>홈 화면</h1>;
};

export default Home;
```

### ✔ `UserCard.jsx`

```jsx
const UserCard = ({ name }) => {
  return <div>{name}</div>;
};

export default UserCard;
```

---

## 📌 Codex 명령 프롬프트 가이드

Codex에게 아래처럼 요청하면 자동으로 규칙을 적용한 코드를 생성한다.

### 예시 프롬프트

```
새로운 컴포넌트 ProfileCard.jsx 만들어줘.
규칙: const {파일명} = () => {} export default {파일명}; 적용해줘.
```

Codex는 자동으로 아래와 같은 형태로 생성해야 한다:

```jsx
const ProfileCard = () => {
  return <div>ProfileCard</div>;
};

export default ProfileCard;
```

---

## 📌 응답 언어 규칙 (Language Policy)

- Codex는 **모든 설명, 해설, 코멘트, 이유 설명을 반드시 한국어로 작성한다.**
- 코드 내부의 키워드, API 명칭, 라이브러리 이름은 영어를 유지한다.
- 주석은 기본적으로 한국어로 작성한다.
- 아래 항목은 예외 없이 한국어로 설명해야 한다:
  - 코드 생성 이유
  - 설계 의도
  - 선택한 구현 방식의 장단점
  - 수정 사항 요약
  - 성능 또는 구조 관련 설명

❌ 금지:

- “Here is…”
- “This code does…”
- “You can see that…”
- 기타 영어 설명 문장

✅ 허용:

- 코드 자체 (JS/TS/JSX 등)
- 변수명, 함수명, 라이브러리명

## ✔ 결론

이 문서는 Codex와 함께 개발할 때 **일관성과 가독성을 높이고 유지보수를 쉽게** 하기 위한 가이드입니다. 필요한 경우 이 규칙은 업데이트될 수 있습니다.

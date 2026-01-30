import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

// Tailwind CSS 클래스 이름을 합쳐주는 유틸 함수
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

dayjs.locale('ko');

// 날짜/시간을 'YYYY-MM-DD HH:mm' 형태로 표시
const formatDateTime = (value) => {
  if (!value) return '-';
  const d = dayjs(value);
  return d.isValid() ? d.format('YYYY-MM-DD HH:mm') : '-';
};

// 날짜를 요일 포함 'YYYY-MM-DD (ddd)' 형태로 표시
const formatDateWithWeekday = (value) => {
  if (!value) return '';
  const d = dayjs(value);
  return d.isValid() ? d.format('YYYY-MM-DD (ddd)') : '';
};

// 날짜만 'YYYY-MM-DD' 형태로 표시
const formatDate = (value) => {
  if (!value) return '';
  const d = dayjs(value);
  return d.isValid() ? d.format('YYYY-MM-DD') : '';
};

// 월 키 'YYYY-MM' 형태로 표시
const formatMonthKey = (value) => {
  if (!value) return '';
  const d = dayjs(value);
  return d.isValid() ? d.format('YYYY-MM') : '';
};

export { formatDateTime, formatDateWithWeekday, formatDate, formatMonthKey };

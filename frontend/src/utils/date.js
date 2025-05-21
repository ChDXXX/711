import dayjs from 'dayjs';

export function formatCreatedAt(ts, fmt = 'YYYY-MM-DD') {
  if (!ts) return '—';

  //Firestore Timestamp（真正的对象，带 toDate()）
  if (typeof ts.toDate === 'function') {
    return dayjs(ts.toDate()).format(fmt);
  }

  // 被序列化后的 {_seconds, _nanoseconds}
  if (ts._seconds !== undefined) {
    return dayjs.unix(ts._seconds).format(fmt);
  }
  if (ts.seconds !== undefined) {
    return dayjs.unix(ts.seconds).format(fmt);
  }

  // 直接存了 epoch 毫秒
  if (typeof ts === 'number') {
    return dayjs(ts).format(fmt);
  }

  // ISO 字符串
  if (typeof ts === 'string') {
    const d = dayjs(ts);
    return d.isValid() ? d.format(fmt) : '—';
  }

  // 其余情况
  return '—';
}
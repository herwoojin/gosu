export default function Offline() {
  return (
    <div className="flex min-h-[80dvh] flex-col items-center justify-center gap-2 px-6 text-center">
      <div className="text-xl font-bold text-ink">오프라인 상태예요</div>
      <p className="text-sm text-muted">네트워크 연결을 확인한 뒤 다시 시도해 주세요.</p>
    </div>
  );
}

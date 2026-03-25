import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, X, Sparkles, BookOpen } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DetailStep {
  label: string;
  description: string;
  targetId?: string;
}

interface SidebarStep {
  sidebarItemId: string;
  routePath: string;
  title: string;
  description: string;
  details: DetailStep[];
}

// ─── Tour Data ────────────────────────────────────────────────────────────────

const TOUR_STEPS: SidebarStep[] = [
  {
    sidebarItemId: 'sidebar-item-overview',
    routePath: 'overview',
    title: '📊 Tổng quan',
    description: 'Đây là trang chủ của bạn. Xem doanh thu, đơn hàng mới và các thống kê quan trọng tại đây.',
    details: [
      { label: 'Thẻ thống kê', description: 'Các ô số liệu ở đầu trang cho bạn thấy tổng đơn hàng, sản phẩm đang bán, combo, hộp mù và số dư ví.', targetId: 'tour-overview-stats' },
      { label: 'Bảng sản phẩm', description: 'Phần giữa trang liệt kê nhanh các sản phẩm, combo và hộp mù. Bấm vào tab để chuyển loại.', targetId: 'tour-overview-products' },
      { label: 'Đơn hàng gần đây', description: 'Cột bên phải hiển thị 5 đơn hàng mới nhất. Bấm "Xem Tất Cả" để vào trang quản lý đơn hàng.', targetId: 'tour-overview-orders' },
      { label: 'Chi tiết tài chính', description: 'Phần dưới cho thấy số dư khả dụng và số dư đóng băng. Bấm "Rút tiền" để chuyển tiền về ngân hàng.', targetId: 'tour-overview-finance' },
    ],
  },
  {
    sidebarItemId: 'sidebar-item-products',
    routePath: 'products',
    title: '🌿 Sản phẩm',
    description: 'Thêm, chỉnh sửa và quản lý tất cả nông sản của bạn. Bạn cũng có thể tạo combo và hộp bí ẩn ở đây.',
    details: [
      { label: 'Tab Nông Sản / Combo / Hộp Mù', description: 'Bấm vào 3 tab ở đầu trang để chuyển giữa danh sách nông sản, túi combo và hộp mù.', targetId: 'tour-products-tabs' },
      { label: 'Nút Thêm sản phẩm mới', description: 'Bấm nút xanh góc trên phải để thêm sản phẩm mới, tạo combo hoặc tạo hộp mù tùy theo tab đang chọn.', targetId: 'tour-products-add-btn' },
      { label: 'Tìm kiếm & Lọc', description: 'Dùng ô tìm kiếm để tìm theo tên hoặc ID. Dùng bộ lọc để lọc theo danh mục và trạng thái.', targetId: 'tour-products-search' },
      { label: 'Thao tác sản phẩm', description: 'Mỗi dòng có 3 nút: ✏️ Chỉnh sửa, 👁️ Ẩn/Hiện, 🗑️ Xóa. Hãy cẩn thận khi xóa vì không thể hoàn tác.', targetId: 'tour-products-table' },
    ],
  },
  {
    sidebarItemId: 'sidebar-item-orders',
    routePath: 'orders',
    title: '🛒 Đơn hàng',
    description: 'Xem và xử lý các đơn hàng từ khách mua. Nhớ xác nhận đơn hàng sớm để khách không phải chờ lâu nhé!',
    details: [
      { label: 'Tab trạng thái đơn hàng', description: 'Các tab ở đầu giúp lọc đơn theo trạng thái: Chờ xác nhận, Đang chuẩn bị, Đang giao, Đã giao, Đã hủy.', targetId: 'tour-orders-tabs' },
      { label: 'Xác nhận đơn hàng', description: 'Khi có đơn mới (màu vàng "Chờ xác nhận"), bấm nút "Chuẩn bị hàng" để xác nhận và bắt đầu đóng gói.', targetId: 'tour-orders-list' },
      { label: 'Liên hệ & Hủy đơn', description: 'Bấm "Liên hệ KH" để nhắn tin với khách. Bấm "Hủy đơn" nếu không thể giao hàng.', targetId: 'tour-orders-list' },
    ],
  },
  {
    sidebarItemId: 'sidebar-item-reviews',
    routePath: 'reviews',
    title: '⭐ Đánh giá',
    description: 'Xem phản hồi của khách hàng về sản phẩm của bạn. Đánh giá tốt giúp cửa hàng bán được nhiều hơn.',
    details: [
      { label: 'Danh sách đánh giá', description: 'Tất cả đánh giá từ khách hàng được hiển thị ở đây, bao gồm số sao và bình luận.' },
      { label: 'Điểm trung bình', description: 'Điểm đánh giá trung bình ảnh hưởng trực tiếp đến thứ hạng hiển thị của cửa hàng trên sàn.' },
    ],
  },
  {
    sidebarItemId: 'sidebar-item-notifications',
    routePath: 'notifications',
    title: '🔔 Thông báo',
    description: 'Nhận thông báo về đơn hàng mới, thanh toán và các cập nhật quan trọng từ hệ thống.',
    details: [
      { label: 'Danh sách thông báo', description: 'Tất cả thông báo từ hệ thống hiển thị ở đây. Thông báo chưa đọc sẽ được đánh dấu nổi bật.' },
    ],
  },
  {
    sidebarItemId: 'sidebar-item-farmer-disputes',
    routePath: 'farmer-disputes',
    title: '⚖️ Khiếu nại',
    description: 'Nếu có tranh chấp với khách hàng, bạn có thể xử lý tại đây. Hãy giải quyết nhanh để bảo vệ uy tín cửa hàng.',
    details: [
      { label: 'Danh sách khiếu nại', description: 'Các khiếu nại từ khách hàng về đơn hàng của bạn được liệt kê ở đây.' },
      { label: 'Phản hồi khiếu nại', description: 'Bấm vào từng khiếu nại để xem chi tiết và gửi phản hồi. Phản hồi nhanh giúp tăng điểm uy tín.' },
    ],
  },
  {
    sidebarItemId: 'sidebar-item-profile',
    routePath: 'profile',
    title: '👤 Hồ sơ cá nhân',
    description: 'Cập nhật thông tin cửa hàng, ảnh đại diện và các thông tin liên hệ của bạn.',
    details: [
      { label: 'Thông tin cửa hàng', description: 'Cập nhật tên cửa hàng, mô tả, địa chỉ và số điện thoại liên hệ.' },
      { label: 'Ảnh đại diện', description: 'Tải lên logo cửa hàng để khách hàng dễ nhận biết. Ảnh rõ nét giúp tăng độ tin cậy.' },
      { label: 'Thông tin ngân hàng', description: 'Cập nhật tài khoản ngân hàng để nhận tiền khi rút từ ví.' },
    ],
  },
  {
    sidebarItemId: 'sidebar-item-messages',
    routePath: 'messages',
    title: '💬 Tin nhắn',
    description: 'Trò chuyện trực tiếp với khách hàng. Trả lời nhanh giúp tăng tỷ lệ chốt đơn hàng.',
    details: [
      { label: 'Danh sách hội thoại', description: 'Bên trái là danh sách các cuộc trò chuyện với khách hàng. Bấm vào để mở hội thoại.' },
      { label: 'Khung chat', description: 'Gõ tin nhắn vào ô bên dưới và bấm gửi. Bạn có thể gửi ảnh và file đính kèm.' },
    ],
  },
  {
    sidebarItemId: 'sidebar-item-wallet',
    routePath: 'wallet',
    title: '💰 Ví tiền',
    description: 'Xem số dư và lịch sử giao dịch. Bạn có thể rút tiền về tài khoản ngân hàng tại đây.',
    details: [
      { label: 'Tổng doanh thu & Đã rút', description: 'Hai thẻ đầu trang hiển thị tổng doanh thu từ trước đến nay và tổng số tiền đã rút thành công.', targetId: 'tour-wallet-cards' },
      { label: 'Yêu cầu rút tiền', description: 'Bấm nút "Yêu cầu rút tiền" góc trên phải, điền số tiền và thông tin ngân hàng rồi xác nhận.', targetId: 'tour-wallet-withdraw-btn' },
      { label: 'Lịch sử giao dịch', description: 'Bảng bên dưới liệt kê tất cả các lần rút tiền, trạng thái và ngày xử lý.', targetId: 'tour-wallet-history' },
    ],
  },
];

const STORAGE_KEY = 'farmer_onboarding_done_v2';
const TOOLTIP_W = 288; // w-72 = 288px
const TOOLTIP_H = 260; // ước tính chiều cao tooltip
const GAP = 14;        // khoảng cách giữa highlight và tooltip

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface Rect { top: number; left: number; width: number; height: number }

function getRect(id: string): Rect | null {
  const el = document.getElementById(id);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top - 6, left: r.left - 6, width: r.width + 12, height: r.height + 12 };
}

/**
 * Tính vị trí tooltip sao cho luôn nằm trong viewport.
 * Ưu tiên: phải → trái → dưới → trên → giữa màn hình
 */
function calcTooltipPos(rect: Rect): React.CSSProperties {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const centerY = rect.top + rect.height / 2;

  // Thử bên PHẢI
  if (rect.left + rect.width + GAP + TOOLTIP_W <= vw) {
    const top = Math.min(Math.max(centerY - TOOLTIP_H / 2, 12), vh - TOOLTIP_H - 12);
    return { top, left: rect.left + rect.width + GAP };
  }

  // Thử bên TRÁI
  if (rect.left - GAP - TOOLTIP_W >= 0) {
    const top = Math.min(Math.max(centerY - TOOLTIP_H / 2, 12), vh - TOOLTIP_H - 12);
    return { top, left: rect.left - GAP - TOOLTIP_W };
  }

  // Thử bên DƯỚI
  const centerX = rect.left + rect.width / 2;
  if (rect.top + rect.height + GAP + TOOLTIP_H <= vh) {
    const left = Math.min(Math.max(centerX - TOOLTIP_W / 2, 12), vw - TOOLTIP_W - 12);
    return { top: rect.top + rect.height + GAP, left };
  }

  // Thử bên TRÊN
  if (rect.top - GAP - TOOLTIP_H >= 0) {
    const left = Math.min(Math.max(centerX - TOOLTIP_W / 2, 12), vw - TOOLTIP_W - 12);
    return { top: rect.top - GAP - TOOLTIP_H, left };
  }

  // Fallback: giữa màn hình
  return {
    top: vh / 2 - TOOLTIP_H / 2,
    left: vw / 2 - TOOLTIP_W / 2,
  };
}

/** Đợi element xuất hiện trong DOM, tối đa maxMs */
function waitForElement(id: string, maxMs = 1200): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const el = document.getElementById(id);
    if (el) { resolve(el); return; }

    const start = Date.now();
    const check = () => {
      const found = document.getElementById(id);
      if (found) { resolve(found); return; }
      if (Date.now() - start > maxMs) { resolve(null); return; }
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  });
}

async function scrollAndGetRect(id: string): Promise<Rect | null> {
  const el = await waitForElement(id);
  if (!el) return null;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  // Đợi scroll animation (~350ms)
  await new Promise(r => setTimeout(r, 360));
  return getRect(id);
}

// ─── Component ────────────────────────────────────────────────────────────────

type Phase = 'sidebar' | 'detail';

interface Props { onNavigate: (path: string) => void }

const OnboardingTour: React.FC<Props> = ({ onNavigate }) => {
  const [visible, setVisible] = useState(false);
  const [sidebarIdx, setSidebarIdx] = useState(0);
  const [detailIdx, setDetailIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('sidebar');
  const [highlight, setHighlight] = useState<Rect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [opacity, setOpacity] = useState(1);

  // Refs để tránh stale closure
  const sIdx = useRef(0);
  const dIdx = useRef(0);
  const phaseRef = useRef<Phase>('sidebar');
  sIdx.current = sidebarIdx;
  dIdx.current = detailIdx;
  phaseRef.current = phase;

  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  }, []);

  // ── Áp rect + tính tooltip position ────────────────────────────────────
  const applyRect = useCallback((rect: Rect | null) => {
    if (!rect) {
      setHighlight(null);
      setTooltipStyle({
        top: window.innerHeight / 2 - TOOLTIP_H / 2,
        left: window.innerWidth / 2 - TOOLTIP_W / 2,
      });
    } else {
      setHighlight(rect);
      setTooltipStyle(calcTooltipPos(rect));
    }
  }, []);

  // ── Fade out → thực hiện fn → fade in ──────────────────────────────────
  const withFade = useCallback((fn: () => Promise<void> | void) => {
    setOpacity(0);
    setTimeout(async () => {
      await fn();
      setOpacity(1);
    }, 180);
  }, []);

  // ── Focus sidebar item ──────────────────────────────────────────────────
  const focusSidebar = useCallback(async (idx: number) => {
    const rect = await scrollAndGetRect(TOUR_STEPS[idx].sidebarItemId);
    applyRect(rect);
  }, [applyRect]);

  // ── Navigate → đợi element → focus ─────────────────────────────────────
  const navigateAndFocus = useCallback(async (path: string, targetId?: string) => {
    onNavigate(path);
    if (targetId) {
      const rect = await scrollAndGetRect(targetId);
      applyRect(rect);
    } else {
      // Không có target → đợi trang render rồi focus sidebar item hiện tại
      await new Promise(r => setTimeout(r, 400));
      applyRect(null);
    }
  }, [onNavigate, applyRect]);

  // ── Init ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => {
      setVisible(true);
      focusSidebar(0);
    }, 700);
    return () => clearTimeout(t);
  }, [focusSidebar]);

  // ── Sidebar: Tiếp tục ───────────────────────────────────────────────────
  const handleSidebarNext = useCallback(() => {
    const cur = sIdx.current;
    if (cur >= TOUR_STEPS.length - 1) { dismiss(); return; }
    withFade(async () => {
      const next = cur + 1;
      setSidebarIdx(next);
      setPhase('sidebar');
      await navigateAndFocus(TOUR_STEPS[next].routePath);
      await focusSidebar(next);
    });
  }, [dismiss, withFade, navigateAndFocus, focusSidebar]);

  // ── Sidebar: Chi tiết ───────────────────────────────────────────────────
  const handleSidebarDetail = useCallback(() => {
    const cur = sIdx.current;
    const step = TOUR_STEPS[cur];
    withFade(async () => {
      setDetailIdx(0);
      setPhase('detail');
      await navigateAndFocus(step.routePath, step.details[0]?.targetId);
    });
  }, [withFade, navigateAndFocus]);

  // ── Detail: Tiếp tục ────────────────────────────────────────────────────
  const handleDetailNext = useCallback(() => {
    const si = sIdx.current;
    const di = dIdx.current;
    const maxD = TOUR_STEPS[si].details.length - 1;
    if (di < maxD) {
      withFade(async () => {
        const next = di + 1;
        setDetailIdx(next);
        const targetId = TOUR_STEPS[si].details[next].targetId;
        if (targetId) {
          const rect = await scrollAndGetRect(targetId);
          applyRect(rect);
        } else {
          applyRect(null);
        }
      });
    } else {
      handleDetailSkip();
    }
  }, [withFade, applyRect]); // eslint-disable-line

  // ── Detail: Bỏ qua → sang sidebar tiếp ────────────────────────────────
  const handleDetailSkip = useCallback(() => {
    const cur = sIdx.current;
    if (cur >= TOUR_STEPS.length - 1) { dismiss(); return; }
    withFade(async () => {
      const next = cur + 1;
      setSidebarIdx(next);
      setDetailIdx(0);
      setPhase('sidebar');
      await navigateAndFocus(TOUR_STEPS[next].routePath);
      await focusSidebar(next);
    });
  }, [dismiss, withFade, navigateAndFocus, focusSidebar]);

  if (!visible) return null;

  const currentSidebar = TOUR_STEPS[sidebarIdx];
  const currentDetail = currentSidebar.details[detailIdx];
  const isLastSidebar = sidebarIdx === TOUR_STEPS.length - 1;
  const isLastDetail = detailIdx === currentSidebar.details.length - 1;

  return createPortal(
    <>
      {/* ── Overlay ── */}
      <div className="fixed inset-0 z-[9998] pointer-events-none" style={{ transition: 'opacity 0.18s' }}>
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <mask id="tour-mask">
              <rect width="100%" height="100%" fill="white" />
              {highlight && (
                <rect
                  x={highlight.left} y={highlight.top}
                  width={highlight.width} height={highlight.height}
                  rx="14" fill="black"
                  style={{ transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)' }}
                />
              )}
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.50)" mask="url(#tour-mask)" />
        </svg>
      </div>

      {/* ── Highlight border ── */}
      {highlight && (
        <div
          className="fixed z-[9999] pointer-events-none rounded-[14px] border-2 border-primary"
          style={{
            top: highlight.top, left: highlight.left,
            width: highlight.width, height: highlight.height,
            transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
            animation: 'tour-pulse 1.8s ease-in-out infinite',
          }}
        />
      )}

      {/* ── Tooltip ── */}
      <div
        className="fixed z-[10000] pointer-events-auto"
        style={{
          ...tooltipStyle,
          width: TOOLTIP_W,
          transition: 'top 0.28s cubic-bezier(0.4,0,0.2,1), left 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.18s ease',
          opacity,
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-primary/10 to-green-50 px-5 pt-4 pb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {phase === 'detail'
                ? <BookOpen className="size-4 text-primary shrink-0" />
                : <Sparkles className="size-4 text-primary shrink-0" />
              }
              <p className="text-[10px] font-black text-primary uppercase tracking-widest truncate">
                {phase === 'sidebar'
                  ? `Mục ${sidebarIdx + 1}/${TOUR_STEPS.length}`
                  : `Chi tiết ${detailIdx + 1}/${currentSidebar.details.length}`
                }
              </p>
            </div>
            <button onClick={dismiss} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0" title="Thoát">
              <X className="size-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4">
            <h3 className="text-sm font-black text-gray-900 mb-1.5">
              {phase === 'sidebar' ? currentSidebar.title : currentDetail.label}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {phase === 'sidebar' ? currentSidebar.description : currentDetail.description}
            </p>
          </div>

          {/* Progress dots */}
          <div className="px-5 pb-2 flex gap-1.5">
            {(phase === 'sidebar' ? TOUR_STEPS : currentSidebar.details).map((_, i) => {
              const active = phase === 'sidebar' ? sidebarIdx : detailIdx;
              return (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === active ? 'bg-primary w-5' : i < active ? 'bg-primary/40 w-2' : 'bg-gray-200 w-2'
                  }`}
                />
              );
            })}
          </div>

          {/* Actions */}
          <div className="px-5 pb-5 pt-2 flex gap-2">
            {phase === 'sidebar' ? (
              <>
                <button onClick={dismiss} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-400 hover:bg-gray-50 transition-colors">
                  Không cần
                </button>
                <button onClick={handleSidebarDetail} className="flex-1 py-2.5 rounded-xl border border-primary/30 text-xs font-bold text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1">
                  <BookOpen className="size-3.5" /> Chi tiết
                </button>
                <button onClick={handleSidebarNext} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-black flex items-center justify-center gap-1 hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30">
                  {isLastSidebar ? 'Xong' : 'Tiếp'}{!isLastSidebar && <ChevronRight className="size-3.5" />}
                </button>
              </>
            ) : (
              <>
                <button onClick={handleDetailSkip} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-400 hover:bg-gray-50 transition-colors">
                  Bỏ qua
                </button>
                <button onClick={handleDetailNext} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-black flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30">
                  {isLastDetail ? 'Xong mục này' : 'Tiếp tục'}<ChevronRight className="size-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mũi tên — chỉ hiện khi tooltip ở bên phải element */}
        {highlight && tooltipStyle.left !== undefined &&
          Number(tooltipStyle.left) > highlight.left + highlight.width && (
          <div
            className="absolute -left-2 pointer-events-none"
            style={{
              top: Math.min(Math.max((Number(tooltipStyle.top ?? 0) > 0
                ? highlight.top + highlight.height / 2 - Number(tooltipStyle.top)
                : TOOLTIP_H / 2) - 8, 16), TOOLTIP_H - 32),
              width: 0, height: 0,
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderRight: '8px solid white',
              filter: 'drop-shadow(-2px 0 2px rgba(0,0,0,0.07))',
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes tour-pulse {
          0%,100% { box-shadow: 0 0 0 4px rgba(34,197,94,0.18); }
          50%      { box-shadow: 0 0 0 10px rgba(34,197,94,0.06); }
        }
      `}</style>
    </>,
    document.body
  );
};

export default OnboardingTour;

/**
 * Enterprise Client-Side Inspection & Source Protection
 * Restricts DevTools keyboard shortcuts, right-click context inspection,
 * and page source dumping across the application.
 */

let toastTimeout = null;

function showSecurityNotice(message = 'Developer inspection is restricted on this platform.') {
  if (typeof document === 'undefined') return;

  const existingToast = document.getElementById('security-inspect-lock-toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.id = 'security-inspect-lock-toast';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('data-testid', 'security-lock-toast');
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.right = '24px';
  toast.style.zIndex = '999999';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '10px';
  toast.style.padding = '12px 18px';
  toast.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
  toast.style.color = '#ffffff';
  toast.style.border = '1px solid rgba(255, 255, 255, 0.15)';
  toast.style.borderRadius = '16px';
  toast.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(255, 255, 255, 0.1)';
  toast.style.backdropFilter = 'blur(16px)';
  toast.style.webkitBackdropFilter = 'blur(16px)';
  toast.style.fontSize = '12px';
  toast.style.fontWeight = '600';
  toast.style.fontFamily = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";
  toast.style.letterSpacing = '-0.01em';
  toast.style.pointerEvents = 'none';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(10px) scale(0.96)';
  toast.style.transition = 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)';

  toast.innerHTML = `
    <span style="display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:8px; background:rgba(239, 68, 68, 0.2); color:#f87171; font-size:13px;">
      🔒
    </span>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0) scale(1)';
  });

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.96)';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  }, 2500);
}

/**
 * Pure evaluation function for restricted inspection shortcuts
 */
export function isRestrictedInspectKey(key, { ctrlKey = false, metaKey = false, shiftKey = false, keyCode = 0 } = {}) {
  if (key === 'F12' || keyCode === 123) return true;
  const isCtrlOrMeta = Boolean(ctrlKey || metaKey);
  if (isCtrlOrMeta && shiftKey) {
    const k = (key || '').toUpperCase();
    if (['I', 'J', 'C', 'K', 'E'].includes(k)) return true;
  }
  if (isCtrlOrMeta && (key === 'u' || key === 'U' || keyCode === 85)) return true;
  return false;
}

/**
 * Initializes global protection against inspecting code
 */
export function initInspectProtection() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  // 1. Disable Right-Click Context Menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    showSecurityNotice('Right-click context menu is restricted.');
    return false;
  };

  // 2. Block DevTools & Source Inspection Keyboard Shortcuts
  const handleKeyDown = (e) => {
    if (isRestrictedInspectKey(e.key, {
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey,
      keyCode: e.keyCode
    })) {
      e.preventDefault();
      e.stopPropagation();
      showSecurityNotice('Developer DevTools and code inspection are restricted.');
      return false;
    }

    // Ctrl+S (Save webpage HTML)
    const isCtrlOrMeta = e.ctrlKey || e.metaKey;
    if (isCtrlOrMeta && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
      const activeEl = document.activeElement;
      if (!activeEl || !['INPUT', 'TEXTAREA'].includes(activeEl.tagName)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }
  };

  // 3. Block Dragging of DOM content
  const handleDragStart = (e) => {
    if (e.target && e.target.nodeName !== 'A') {
      e.preventDefault();
    }
  };

  // Attach listeners with capture = true to intercept before other handlers
  document.addEventListener('contextmenu', handleContextMenu, true);
  window.addEventListener('keydown', handleKeyDown, true);
  document.addEventListener('dragstart', handleDragStart, true);

  return () => {
    document.removeEventListener('contextmenu', handleContextMenu, true);
    window.removeEventListener('keydown', handleKeyDown, true);
    document.removeEventListener('dragstart', handleDragStart, true);
  };
}

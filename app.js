const storageKey = 'simple-ledger-v1';
const APP_VERSION = '20260814-recovery-code';
const categoryMeta = {
  餐饮: { icon: '🍜', className: 'food' }, 交通: { icon: '🚕', className: 'transport' }, 购物: { icon: '🛍️', className: 'shopping' },
  居住: { icon: '🏠', className: 'home' }, 娱乐: { icon: '🎬', className: 'shopping' }, 医疗: { icon: '💊', className: 'home' },
  工资: { icon: '💰', className: 'transport' }, 兼职: { icon: '✨', className: 'transport' }, 其他: { icon: '✦', className: '' }
};
const expenseCategories = ['餐饮', '交通', '购物', '居住', '娱乐', '医疗', '其他'];
const incomeCategories = ['工资', '兼职', '其他'];
const defaultCategoryIcons = { 餐饮: '🍜', 交通: '🚕', 购物: '🛍️', 居住: '🏠', 娱乐: '🎬', 医疗: '💊', 工资: '💰', 兼职: '✨', 其他: '✦' };
const iconChoices = [
  // 餐饮
  '🍜', '🍚', '🍔', '🍕', '🍣', '🍱', '🥗', '🥩', '🍞', '🥐', '🍰', '🍎', '🍊', '🍉', '🍓', '🥦', '🥛', '☕', '🧋', '🥤', '🍺', '🍷', '🥡',
  // 交通与出行
  '🚕', '🚌', '🚇', '🚆', '🚄', '🚲', '🛵', '🚗', '🚙', '🚚', '⛽', '🅿️', '✈️', '🛫', '🛬', '⛴️', '🗺️', '🧳',
  // 购物与日用
  '🛍️', '🛒', '🧺', '👕', '👗', '👟', '🧥', '🎒', '💄', '💍', '🎁', '💐', '🧴', '🧻', '🧼', '🧽', '🧹', '🪥', '🧸', '📦',
  // 居住与数码
  '🏠', '🏢', '🔑', '🛏️', '🚿', '🛋️', '🪑', '💡', '🔧', '🪛', '🔌', '📱', '💻', '🖥️', '⌨️', '🖨️', '🎧', '📷',
  // 娱乐、健康与教育
  '🎬', '🎮', '🎵', '🎤', '🎟️', '🎞️', '📺', '📚', '📝', '🎓', '⚽', '🏀', '🏋️', '🏊', '🧘', '🏥', '🦷', '💉', '💊',
  // 家庭、宠物与通用
  '🐶', '🐱', '🐾', '👶', '🍼', '🌴', '🎉', '❤️', '💰', '💳', '🏦', '🧾', '📶', '🌐', '✨', '✦', '➕'
];
const defaultAccounts = [
  { id: 'cash', name: '现金', type: '现金', balance: 680.50 },
  { id: 'bank', name: '招商银行', type: '银行卡', balance: 12680.00 },
  { id: 'wallet', name: '微信钱包', type: '电子钱包', balance: 1380.20 }
];
const seedRecords = [
  { id: 'r1', type: 'expense', amount: 35.00, category: '餐饮', account: '微信钱包', date: '2026-08-12', note: '午餐 · 沙县小吃' },
  { id: 'r2', type: 'expense', amount: 28.50, category: '交通', account: '微信钱包', date: '2026-08-11', note: '地铁和公交' },
  { id: 'r3', type: 'expense', amount: 199.00, category: '购物', account: '招商银行', date: '2026-08-10', note: '日用品补货' },
  { id: 'r4', type: 'income', amount: 12500.00, category: '工资', account: '招商银行', date: '2026-08-05', note: '八月工资' },
  { id: 'r5', type: 'expense', amount: 3200.00, category: '居住', account: '招商银行', date: '2026-08-01', note: '八月房租' },
  { id: 'r6', type: 'expense', amount: 68.00, category: '娱乐', account: '微信钱包', date: '2026-08-01', note: '电影票' }
];
const defaultState = { activeView: 'dashboard', selectedMonth: currentMonthKey(), monthSelectionMode: 'auto', chartYear: new Date().getFullYear(), categoryChartType: 'bar', trendChartType: 'bar', records: seedRecords, accounts: defaultAccounts, budgets: { 餐饮: 1200, 交通: 500, 购物: 1000, 居住: 3500, 娱乐: 500 }, categories: { expense: expenseCategories, income: incomeCategories }, categoryIcons: defaultCategoryIcons };
function normalizeState(nextState) {
  const savedState = nextState || {};
  const normalized = { ...structuredClone(defaultState), ...savedState };
  // 没有主动选择过历史月份时，自动跟随自然月，避免跨月后仍停留在旧月份。
  normalized.monthSelectionMode = savedState.monthSelectionMode === 'manual' ? 'manual' : 'auto';
  if (normalized.monthSelectionMode === 'auto') normalized.selectedMonth = currentMonthKey();
  if (!/^\d{4}-\d{2}$/.test(String(normalized.selectedMonth || ''))) normalized.selectedMonth = currentMonthKey();
  normalized.chartYear = normalized.monthSelectionMode === 'auto'
    ? new Date().getFullYear()
    : Number(normalized.chartYear) || Number(normalized.selectedMonth?.slice(0, 4)) || new Date().getFullYear();
  normalized.categoryChartType = normalized.categoryChartType === 'pie' ? 'pie' : 'bar';
  normalized.trendChartType = normalized.trendChartType === 'table' ? 'table' : 'bar';
  normalized.records = Array.isArray(normalized.records) ? normalized.records.map((record, index, records) => ({
    ...record,
    id: record.id || `r-${index + 1}`,
    createdAt: record.createdAt || new Date(`${record.date || `${normalized.selectedMonth || new Date().toISOString().slice(0, 7)}-01`}T12:00:00`).getTime() + (records.length - index)
  })) : [];
  normalized.accounts = Array.isArray(normalized.accounts) ? normalized.accounts : structuredClone(defaultAccounts);
  normalized.budgets = normalized.budgets && typeof normalized.budgets === 'object' ? normalized.budgets : {};
  normalized.categories = normalized.categories && typeof normalized.categories === 'object' ? normalized.categories : {};
  normalized.categories.expense = Array.isArray(normalized.categories.expense) ? [...new Set(normalized.categories.expense)] : [...expenseCategories];
  normalized.categories.income = Array.isArray(normalized.categories.income) ? [...new Set(normalized.categories.income)] : [...incomeCategories];
  if (!normalized.categories.expense.includes('其他')) normalized.categories.expense.push('其他');
  if (!normalized.categories.income.includes('其他')) normalized.categories.income.push('其他');
  normalized.categoryIcons = normalized.categoryIcons && typeof normalized.categoryIcons === 'object' ? normalized.categoryIcons : {};
  [...normalized.categories.expense, ...normalized.categories.income, ...normalized.records.map(record => record.category)].filter(Boolean).forEach(category => {
    if (!normalized.categoryIcons[category]) normalized.categoryIcons[category] = defaultCategoryIcons[category] || '✦';
  });
  return normalized;
}
let state = normalizeState(loadState());
let transactionType = 'expense';
let editingRecordId = null;
let toastTimer;
let cloudClient = null;
let cloudSession = null;
let cloudSyncTimer = null;
let cloudHydrating = false;
let recoveryEmail = sessionStorage.getItem('ledger-recovery-email') || '';
let recoveryCooldownTimer = null;

function loadState() { try { const saved = JSON.parse(localStorage.getItem(storageKey)); return saved ? { ...defaultState, ...saved } : structuredClone(defaultState); } catch { return structuredClone(defaultState); } }
function cloudConfigured() { return Boolean(window.LEDGER_CLOUD_CONFIG?.supabaseUrl && window.LEDGER_CLOUD_CONFIG?.supabaseAnonKey); }
async function ensureCloudClient() {
  if (cloudClient) return cloudClient;
  if (!window.LEDGER_CLOUD_CONFIG?.supabaseUrl || !window.LEDGER_CLOUD_CONFIG?.supabaseAnonKey) return null;
  if (!window.supabase?.createClient && window.supabaseReady) await window.supabaseReady;
  if (!window.supabase?.createClient) return null;
  cloudClient = window.supabase.createClient(window.LEDGER_CLOUD_CONFIG.supabaseUrl, window.LEDGER_CLOUD_CONFIG.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  return cloudClient;
}
function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
  if (cloudSession && !cloudHydrating) queueCloudSync();
}
function queueCloudSync() {
  clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(() => syncCloudState(), 700);
}
async function syncCloudState() {
  if (!cloudClient || !cloudSession || cloudHydrating) return;
  const { error } = await cloudClient.from('ledger_data').upsert({ user_id: cloudSession.user.id, state, updated_at: new Date().toISOString() });
  if (error) { updateCloudUI('云端同步失败'); console.error(error); return; }
  updateCloudUI('已同步');
}
async function hydrateCloud() {
  if (!cloudClient || !cloudSession) return;
  cloudHydrating = true;
  const { data, error } = await cloudClient.from('ledger_data').select('state').eq('user_id', cloudSession.user.id).maybeSingle();
  if (error) { cloudHydrating = false; updateCloudUI('读取云端失败'); console.error(error); return; }
  if (data?.state && typeof data.state === 'object') {
    state = normalizeState(data.state);
    localStorage.setItem(storageKey, JSON.stringify(state));
    renderAll();
    showToast('已从云端恢复账本');
  } else {
    await syncCloudState();
    showToast('已将本机账本保存到云端');
  }
  cloudHydrating = false;
  updateCloudUI('已登录');
}
function updateCloudUI(status) {
  const statusEl = document.getElementById('cloudStatus');
  const sidebarStatusEl = document.getElementById('cloudStatusSidebar');
  const userEl = document.getElementById('cloudUser');
  const loginFields = document.getElementById('cloudLoginFields');
  const signedInActions = document.getElementById('cloudSignedInActions');
  const userCard = document.getElementById('userCard');
  const label = cloudConfigured() ? (status || (cloudSession ? '已登录' : '未登录')) : '未配置云端';
  if (statusEl) statusEl.textContent = label;
  if (sidebarStatusEl) sidebarStatusEl.textContent = cloudSession?.user?.email || (cloudConfigured() ? '点击登录并同步' : '请先配置云端');
  if (userEl) { userEl.textContent = cloudSession?.user?.email || ''; userEl.hidden = !cloudSession; }
  if (loginFields) loginFields.hidden = Boolean(cloudSession);
  if (signedInActions) signedInActions.hidden = !cloudSession;
  if (userCard) userCard.classList.toggle('cloud-connected', Boolean(cloudSession));
}
function cloudPanel(panel) {
  const panels = ['cloudLoginFields', 'cloudForgotFields', 'cloudUpdatePasswordFields', 'cloudSignedInActions'];
  panels.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.hidden = id !== panel;
  });
}
function showCloudLogin() {
  cloudPanel(cloudSession ? 'cloudSignedInActions' : 'cloudLoginFields');
  document.getElementById('cloudEmailInput')?.focus();
}
function showCloudForgot() {
  const email = document.getElementById('cloudEmailInput')?.value.trim() || recoveryEmail;
  const resetEmail = document.getElementById('cloudResetEmailInput');
  if (resetEmail && email) resetEmail.value = email;
  cloudPanel('cloudForgotFields');
  resetEmail?.focus();
}
function showCloudPasswordUpdate() {
  cloudPanel('cloudUpdatePasswordFields');
  document.getElementById('cloudNewPasswordInput')?.focus();
}
function setRecoveryHint(message, type = '') {
  const hint = document.getElementById('cloudRecoveryHint');
  if (!hint) return;
  hint.textContent = message;
  hint.classList.toggle('is-error', type === 'error');
  hint.classList.toggle('is-success', type === 'success');
}
function startRecoveryCooldown(seconds = 60) {
  const button = document.querySelector('[data-action=\"cloud-send-reset\"]');
  let remaining = seconds;
  clearInterval(recoveryCooldownTimer);
  if (button) button.disabled = true;
  const update = () => {
    if (!button) return;
    if (remaining <= 0) {
      button.disabled = false;
      button.textContent = '重新发送验证码';
      clearInterval(recoveryCooldownTimer);
      return;
    }
    button.textContent = `重新发送（${remaining}s）`;
    remaining -= 1;
  };
  update();
  recoveryCooldownTimer = setInterval(update, 1000);
}
function recoveryFlowDetected() {
  const params = new URLSearchParams(location.search);
  return params.get('type') === 'recovery' || location.hash.includes('type=recovery');
}
function openCloudAuth() {
  if (!cloudConfigured()) { showToast('请先配置 Supabase 云端服务'); return; }
  document.getElementById('cloudModal').hidden = false;
  showCloudLogin();
}
async function sendPasswordReset() {
  if (!(await ensureCloudClient())) return showToast('云端服务正在连接，请稍后重试');
  const email = document.getElementById('cloudResetEmailInput')?.value.trim();
  if (!email) return showToast('请输入注册邮箱');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showToast('请输入正确的邮箱地址');
  const button = document.querySelector('[data-action=\"cloud-send-reset\"]');
  if (button?.disabled) return;
  const { error } = await cloudClient.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}${location.pathname}` });
  if (error) {
    const message = /rate limit/i.test(error.message || '')
      ? '邮件发送次数已达到限制，请稍后再试'
      : (error.message || '验证码发送失败');
    setRecoveryHint(message, 'error');
    return showToast(message);
  }
  recoveryEmail = email;
  sessionStorage.setItem('ledger-recovery-email', email);
  document.getElementById('cloudResetCodeInput')?.focus();
  setRecoveryHint('验证码已发送，请查收邮件并输入 6 位数字验证码。', 'success');
  startRecoveryCooldown(60);
  showToast('验证码已发送，请查收邮箱');
}
async function verifyRecoveryCode() {
  if (!(await ensureCloudClient())) return showToast('云端服务正在连接，请稍后重试');
  const email = document.getElementById('cloudResetEmailInput')?.value.trim() || recoveryEmail;
  const token = document.getElementById('cloudResetCodeInput')?.value.trim().replace(/\s/g, '');
  if (!email) return showToast('请输入注册邮箱');
  if (!/^\d{6}$/.test(token || '')) return showToast('请输入邮件中的 6 位验证码');
  setRecoveryHint('正在验证验证码…');
  const { data, error } = await cloudClient.auth.verifyOtp({ email, token, type: 'recovery' });
  if (error) {
    const message = /expired|invalid|otp/i.test(error.message || '')
      ? '验证码无效或已过期，请重新发送验证码'
      : (error.message || '验证码验证失败');
    setRecoveryHint(message, 'error');
    return showToast(message);
  }
  recoveryEmail = email;
  sessionStorage.setItem('ledger-recovery-email', email);
  cloudSession = data.session || cloudSession;
  updateCloudUI('验证码验证成功');
  showCloudPasswordUpdate();
  setRecoveryHint('验证成功，请设置新的登录密码。', 'success');
}
async function updateCloudPassword() {
  if (!(await ensureCloudClient())) return showToast('云端服务正在连接，请稍后重试');
  const password = document.getElementById('cloudNewPasswordInput').value;
  const confirmPassword = document.getElementById('cloudConfirmPasswordInput').value;
  if (password.length < 6) return showToast('新密码至少需要 6 位');
  if (password !== confirmPassword) return showToast('两次输入的新密码不一致');
  const { error } = await cloudClient.auth.updateUser({ password });
  if (error) return showToast(error.message || '密码修改失败');
  document.getElementById('cloudNewPasswordInput').value = '';
  document.getElementById('cloudConfirmPasswordInput').value = '';
  showCloudLogin();
  showToast('密码已更新，请使用新密码登录');
}
async function signInCloud() {
  if (!(await ensureCloudClient())) return showToast('云端服务正在连接，请稍后重试');
  const email = document.getElementById('cloudEmailInput').value.trim();
  const password = document.getElementById('cloudPasswordInput').value;
  if (!email || password.length < 6) return showToast('请输入邮箱和至少 6 位密码');
  const { data, error } = await cloudClient.auth.signInWithPassword({ email, password });
  if (error) {
    const message = /invalid login credentials/i.test(error.message || '')
      ? '邮箱或密码不正确；请确认手机输入法没有自动添加空格，并使用与电脑完全相同的密码'
      : (error.message || '登录失败');
    return showToast(message);
  }
  cloudSession = data.session;
  closeModals(); updateCloudUI('登录成功'); await hydrateCloud();
}
async function signUpCloud() {
  if (!(await ensureCloudClient())) return showToast('云端服务正在连接，请稍后重试');
  const email = document.getElementById('cloudEmailInput').value.trim();
  const password = document.getElementById('cloudPasswordInput').value;
  if (!email || password.length < 6) return showToast('请输入邮箱和至少 6 位密码');
  const { data, error } = await cloudClient.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}${location.pathname}` } });
  if (error) return showToast(error.message || '注册失败');
  if (!data.session) return showToast('注册成功，请先去邮箱完成验证');
  cloudSession = data.session;
  closeModals(); updateCloudUI('注册成功'); await hydrateCloud();
}
async function signOutCloud() {
  if (!cloudClient) return;
  const { error } = await cloudClient.auth.signOut();
  if (error) return showToast(error.message || '退出失败');
  cloudSession = null; updateCloudUI('未登录'); showToast('已退出云端账号');
}
async function initCloud() {
  updateCloudUI();
  if (!window.LEDGER_CLOUD_CONFIG?.supabaseUrl || !window.LEDGER_CLOUD_CONFIG?.supabaseAnonKey) return;
  const client = await ensureCloudClient();
  if (!client) { updateCloudUI('云端连接失败'); return; }
  const { data, error } = await client.auth.getSession();
  if (error) { updateCloudUI('云端连接失败'); console.error(error); return; }
  cloudSession = data.session;
  updateCloudUI();
  if (recoveryFlowDetected()) {
    document.getElementById('cloudModal').hidden = false;
    if (cloudSession) showCloudPasswordUpdate();
  } else if (cloudSession) {
    await hydrateCloud();
  }
  client.auth.onAuthStateChange((event, session) => {
    cloudSession = session;
    updateCloudUI();
    if (event === 'PASSWORD_RECOVERY' || recoveryFlowDetected()) {
      document.getElementById('cloudModal').hidden = false;
      showCloudPasswordUpdate();
    }
  });
}
function esc(value) { return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function money(value) { return `¥${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function monthLabel(month) { const [year, monthNum] = month.split('-'); return `${year}年${Number(monthNum)}月`; }
function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
function currentDateKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
function currentMonthRecords() { return state.records.filter(record => record.date.startsWith(state.selectedMonth)); }
function expenses(records = currentMonthRecords()) { return records.filter(record => record.type === 'expense').reduce((sum, record) => sum + Number(record.amount), 0); }
function incomes(records = currentMonthRecords()) { return records.filter(record => record.type === 'income').reduce((sum, record) => sum + Number(record.amount), 0); }
function totalAssets() { return state.accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0); }
function meta(category) { const fallback = categoryMeta[category] || categoryMeta.其他; return { ...fallback, icon: state.categoryIcons?.[category] || fallback.icon }; }
function icon(category) { const item = meta(category); return `<span class="category-icon ${item.className}">${item.icon}</span>`; }
function dateText(date) { const d = new Date(`${date}T00:00:00`); return `${d.getMonth() + 1}月${d.getDate()}日`; }
function typeText(type) { return type === 'income' ? '收入' : type === 'transfer' ? '转账' : '支出'; }
function signedAmount(record) { return `${record.type === 'income' ? '+' : record.type === 'transfer' ? '' : '-'}${money(record.amount)}`; }
function showToast(message) { const toast = document.getElementById('toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2400); }
function activePage(view) { const safeView = view === 'accounts' ? 'dashboard' : view; if (state.activeView !== safeView) { state.activeView = safeView; saveState(); } document.querySelectorAll('.page').forEach(page => page.classList.toggle('active', page.id === `view-${safeView}`)); document.querySelectorAll('.nav-item, .settings-link').forEach(item => item.classList.toggle('active', item.dataset.view === safeView)); const names = { dashboard: '总览', records: '账目', budget: '预算', settings: '设置' }; document.getElementById('breadcrumbCurrent').textContent = names[safeView] || names.dashboard; }
function allBudgetCategories() {
  return [...new Set([
    ...(state.categories?.expense || expenseCategories),
    ...Object.keys(state.budgets || {})
  ])].filter(Boolean);
}
function renderBudgetCategoryOptions(selected = '') {
  const select = document.getElementById('budgetCategory');
  if (!select) return;
  const categories = allBudgetCategories();
  select.innerHTML = categories.map(category => `<option value="${esc(category)}">${meta(category).icon} ${esc(category)}</option>`).join('');
  if (selected && categories.includes(selected)) select.value = selected;
}
function renderBudgetIconPicker(selected = '') {
  const picker = document.getElementById('budgetIconPicker');
  const hidden = document.getElementById('budgetIcon');
  if (!picker || !hidden) return;
  const current = selected || hidden.value || '✦';
  hidden.value = current;
  picker.innerHTML = iconChoices.map(item => `<button type="button" class="icon-choice ${item === current ? 'active' : ''}" data-budget-icon="${esc(item)}" aria-label="选择图标 ${esc(item)}">${item}</button>`).join('');
}
function openBudgetCategoryEditor() {
  const form = document.getElementById('budgetForm');
  budgetReturnCategory = form?.elements.category?.value || '';
  budgetReturnAmount = form?.elements.amount?.value || '';
  reopenBudgetAfterCategoryEditor = true;
  openCategoryEditor('expense');
  document.getElementById('budgetModal').hidden = true;
}
function renderAll() { activePage(state.activeView); renderDashboard(); renderRecords(); renderBudget(); renderSettings(); document.getElementById('recordBadge').textContent = state.records.length || ''; }
function heading(eyebrow, title, desc, actions = '') { return `<div class="page-heading"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${desc ? `<p>${desc}</p>` : ''}</div><div class="heading-actions">${actions}</div></div>`; }
function recordRow(record, compact = false) { return `<div class="record-row">${icon(record.category)}<div class="record-main"><strong>${esc(record.note || record.category)}</strong><small>${esc(record.category)} · ${esc(record.account)} · ${dateText(record.date)}</small></div><span class="record-amount ${record.type}">${signedAmount(record)}</span>${compact ? '' : `<button class="delete-record" data-action="delete-record" data-id="${record.id}" title="删除">×</button>`}</div>`; }
function categoryStats() { const map = {}; currentMonthRecords().filter(r => r.type === 'expense').forEach(r => { map[r.category] = (map[r.category] || 0) + Number(r.amount); }); return Object.entries(map).sort((a, b) => b[1] - a[1]); }
function availableRecordCategories() { const usedCategories = state.records.map(record => record.category); return [...new Set(usedCategories.map(category => String(category || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-CN')); }
function renderDashboard() {
  const records = currentMonthRecords();
  const expense = expenses(records);
  const stats = categoryStats();
  const max = stats[0]?.[1] || 1;
  const categoryTotal = stats.reduce((sum, [, value]) => sum + Number(value), 0);
  const pieColors = ['#5b82f3', '#8c7cf0', '#43b692', '#f2a65a', '#ee7f84', '#62b4d8', '#9aa8bc'];
  let pieOffset = 0;
  const pieGradient = categoryTotal ? stats.map(([, value], index) => {
    const start = pieOffset;
    pieOffset += Number(value) / categoryTotal * 100;
    return `${pieColors[index % pieColors.length]} ${start}% ${pieOffset}%`;
  }).join(', ') : '#e9eef8 0 100%';
  const year = Number(state.chartYear) || new Date().getFullYear();
  const monthlyExpenses = Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, '0');
    return expenses(state.records.filter(record => record.type === 'expense' && record.date.startsWith(`${year}-${month}`)));
  });
  const chartMax = Math.max(...monthlyExpenses, 100);
  const axisStep = Math.max(1, Math.ceil(chartMax / 4 / 100) * 100);
  const axisMax = axisStep * 4;
  const axisLabels = [axisMax, axisStep * 3, axisStep * 2, axisStep, 0];
  const currentMonth
 = Number(state.selectedMonth.slice(5, 7)) - 1;
  const budgetItems = Object.entries(state.budgets).map(([category, budget]) => {
    const spent = stats.find(stat => stat[0] === category)?.[1] || 0;
    return { category, budget: Number(budget), spent };
  });

  document.getElementById('view-dashboard').innerHTML = `<div class="dashboard-actions-only"><button class="secondary-button" data-action="switch-view" data-view="records">查看全部账目</button><button class="primary-button" data-action="open-add">＋ 记一笔</button></div>
    <div class="summary-grid"><div class="summary-card main expense-summary-card"><div class="summary-card-glow"></div><div class="summary-label"><span class="summary-kicker"><i></i>本月支出</span></div><div class="summary-card-content"><div><div class="summary-value">${money(expense)}</div><div class="summary-foot">共 ${records.filter(record => record.type === 'expense').length} 笔支出</div></div><button type="button" class="summary-mini-chart" data-action="scroll-to-trend" aria-label="查看支出趋势" title="查看支出趋势"><span style="height:34%"></span><span style="height:52%"></span><span style="height:43%"></span><span style="height:74%"></span><span style="height:60%"></span><span style="height:88%"></span></button></div></div></div>
    <div class="dashboard-stack">
      <div class="panel category-distribution-panel"><div class="panel-header"><div><h2 class="panel-title">支出分类</h2><p class="panel-subtitle">${monthLabel(state.selectedMonth)}的钱都花在哪里</p></div><div class="panel-header-actions"><select class="chart-type-select" id="categoryChartType" aria-label="选择支出分类图表类型"><option value="bar" ${state.categoryChartType === 'bar' ? 'selected' : ''}>条形图</option><option value="pie" ${state.categoryChartType === 'pie' ? 'selected' : ''}>饼图</option></select><button class="link-button" data-action="switch-view" data-view="budget">查看预算 →</button></div></div>${state.categoryChartType === 'pie' ? `<div class="category-pie-layout"><div class="category-pie" style="background: conic-gradient(${pieGradient})"><div class="category-pie-hole"><strong>${money(categoryTotal)}</strong><small>本月支出</small></div></div><div class="category-legend-list">${stats.length ? stats.map(([category, value], index) => `<div class="category-legend-item"><span><i style="background:${pieColors[index % pieColors.length]}"></i>${esc(category)}</span><strong>${Math.round(value / categoryTotal * 100)}%</strong></div>`).join('') : '<div class="empty-state">本月还没有支出。</div>'}</div></div>` : `<div class="category-list">${stats.length ? stats.map(([category, value]) => `<div class="category-line">${icon(category)}<div class="category-info"><div class="category-info-head"><span>${esc(category)}</span><span>${money(value)}</span></div><div class="progress"><span style="width:${Math.min(100, value / max * 100)}%"></span></div></div></div>`).join('') : '<div class="empty-state">本月还没有支出。</div>'}</div>`}</div>
      <div class="panel"><div class="panel-header"><div><h2 class="panel-title">预算进度</h2><p class="panel-subtitle">${monthLabel(state.selectedMonth)}分类预算</p></div><button class="link-button" data-action="switch-view" data-view="budget">管理 →</button></div><div class="dashboard-budget-grid">${budgetItems.map(({ category, budget, spent }) => `<div class="category-line">${icon(category)}<div class="category-info"><div class="category-info-head"><span>${esc(category)}</span><span>${budget ? Math.round(spent / budget * 100) : 0}%</span></div><small class="budget-progress-meta">已用 ${money(spent)} / 预算 ${money(budget)}</small><div class="progress ${spent > budget ? 'orange' : ''}"><span style="width:${Math.min(100, budget ? spent / budget * 100 : 0)}%"></span></div></div></div>`).join('')}</div></div>
      <div class="panel trend-panel" id="trendPanel"><div class="panel-header"><div><h2 class="panel-title">支出趋势</h2><p class="panel-subtitle">${year}年每月支出变化</p></div><div class="trend-controls"><select class="chart-type-select" id="trendChartType" aria-label="选择趋势展示方式"><option value="bar" ${state.trendChartType === 'bar' ? 'selected' : ''}>柱状图</option><option value="table" ${state.trendChartType === 'table' ? 'selected' : ''}>表格</option></select><label class="chart-year-control"><span>选择年份</span><input id="chartYear" type="number" min="2000" max="2100" step="1" value="${year}" aria-label="选择趋势年份" /></label></div></div>${state.trendChartType === 'table' ? `<div class="trend-table-wrap"><table class="trend-table"><thead><tr><th>月份</th><th>支出金额</th><th>占全年</th></tr></thead><tbody>${monthlyExpenses.map((value, index) => `<tr class="${index === currentMonth && year === Number(state.selectedMonth.slice(0, 4)) ? 'current' : ''}"><td>${index + 1}月</td><td>${money(value)}</td><td>${monthlyExpenses.reduce((sum, item) => sum + item, 0) ? Math.round(value / monthlyExpenses.reduce((sum, item) => sum + item, 0) * 100) : 0}%</td></tr>`).join('')}<tr class="trend-total"><th>年度合计</th><th>${money(monthlyExpenses.reduce((sum, item) => sum + item, 0))}</th><th>100%</th></tr></tbody></table></div>` : `<div class="bar-chart-with-axis"><div class="chart-axis">${axisLabels.map(label => `<span>${money(label).replace('¥','')}</span>`).join('')}</div><div class="bar-chart" style="--chart-axis-max:${axisMax}">${monthlyExpenses.map((value, index) => `<div class="chart-column"><div class="bar-track"><span class="bar ${year === Number(state.selectedMonth.slice(0, 4)) && index === currentMonth ? 'current' : ''}" style="height:${Math.max(2, value / axisMax * 100)}%" data-tooltip="${index + 1}月 · ${money(value)}" tabindex="0" role="img" aria-label="${index + 1}月支出 ${money(value)}"></span></div><span class="bar-label">${index + 1}月</span></div>`).join('')}</div></div><div class="chart-legend"><span><i class="legend-dot"></i>支出</span></div>`}</div>
    </div>`;
  document.getElementById('trendChartType')?.addEventListener('change', event => {
    state.trendChartType = event.target.value === 'table' ? 'table' : 'bar';
    saveState();
    renderDashboard();
  });
  document.getElementById('categoryChartType')?.addEventListener('change', event => {
    state.categoryChartType = event.target.value === 'pie' ? 'pie' : 'bar';
    saveState();
    renderDashboard();
  });
  document.getElementById('chartYear').addEventListener('change', event => {
    const nextYear = Math.min(2100, Math.max(2000, Number(event.target.value) || new Date().getFullYear()));
    state.chartYear = nextYear;
    saveState();
    renderDashboard();
  });
}
function renderRecords() {
  const records = [...state.records]
    .filter(r => r.date.startsWith(state.selectedMonth))
    .sort((a, b) => {
      const dateOrder = String(b.date || '').localeCompare(String(a.date || ''));
      if (dateOrder) return dateOrder;
      const createdOrder = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      return createdOrder || String(b.id || '').localeCompare(String(a.id || ''));
    });
  const query = document.getElementById('recordSearch')?.value?.trim().toLowerCase() || ''; const filter = document.getElementById('recordFilter')?.value || '全部';
  const matchedRecords = records.filter(r => (!query || `${r.note}${r.category}`.toLowerCase().includes(query)) && (filter === '全部' || r.type === filter || r.category === filter));
  const filtered = matchedRecords;
  document.getElementById('view-records').innerHTML = `${heading('', '账目', '记录、搜索和管理每一笔收入与支出。', '<button class="primary-button" data-action="open-add">＋ 记一笔</button>')}
    <div class="page-card"><div class="toolbar"><div class="record-toolbar-search ${query ? 'expanded' : ''}"><button type="button" class="search-toggle" data-action="toggle-record-search" aria-label="打开搜索">⌕</button><input id="recordSearch" placeholder="搜索备注或分类" value="${esc(query)}" aria-label="搜索账目" /></div><div class="record-toolbar-filters"><select class="filter-select" id="recordFilter"><option value="全部" ${filter === '全部' ? 'selected' : ''}>全部类型</option><option value="expense" ${filter === 'expense' ? 'selected' : ''}>支出</option><option value="income" ${filter === 'income' ? 'selected' : ''}>收入</option>${availableRecordCategories().map(category => `<option value="${esc(category)}" ${filter === category ? 'selected' : ''}>${esc(category)}</option>`).join('')}</select><input class="filter-select" type="month" id="monthFilter" value="${state.selectedMonth}" aria-label="选择月份" /></div></div>
      <table class="records-table"><thead><tr><th>账目</th><th>日期</th><th>金额</th><th>操作</th></tr></thead><tbody>${filtered.length ? filtered.map(r => `<tr><td><div class="table-category">${icon(r.category)}<div><strong>${esc(r.note || r.category)}</strong><small class="mobile-note">${esc(r.category)}</small></div></div></td><td>${dateText(r.date)}</td><td class="table-amount ${r.type === 'income' ? 'positive' : ''}">${signedAmount(r)}</td><td><div class="record-actions"><button class="edit-record" data-action="edit-record" data-id="${r.id}" title="编辑" aria-label="编辑账目">✎</button><button class="delete-record" data-action="delete-record" data-id="${r.id}" title="删除" aria-label="删除账目">×</button></div></td></tr>`).join('') : '<tr><td colspan="4"><div class="empty-state">没有找到符合条件的账目。</div></td></tr>'}</tbody></table></div>`;
  document.getElementById('recordSearch').addEventListener('input', renderRecords);
  document.getElementById('recordFilter').addEventListener('change', renderRecords);
  const monthFilter = document.getElementById('monthFilter');
  if (monthFilter) {
    // iOS 原生月份选择器的“还原”会恢复 defaultValue，这里固定为当前月份。
    monthFilter.defaultValue = currentMonthKey();
  }
  monthFilter.addEventListener('change', event => {
    state.selectedMonth = event.target.value || currentMonthKey();
    state.monthSelectionMode = state.selectedMonth === currentMonthKey() ? 'auto' : 'manual';
    if (state.monthSelectionMode === 'auto') state.chartYear = new Date().getFullYear();
    saveState();
    renderAll();
  });
  if (query) setTimeout(() => document.getElementById('recordSearch')?.focus(), 0);
}
function budgetCategories() {
  return [...new Set([
    ...Object.keys(state.budgets || {}),
    ...(state.categories?.expense || expenseCategories)
  ])].filter(Boolean);
}
function renderBudget() {
  const stats = Object.fromEntries(categoryStats());
  const totalBudget = Object.values(state.budgets).reduce((a, b) => a + Number(b), 0);
  const spent = Object.values(stats).reduce((a, b) => a + Number(b), 0);
  const percent = totalBudget ? Math.round(spent / totalBudget * 100) : 0;
  const budgetCards = Object.entries(state.budgets).map(([category, budget]) => {
    const used = stats[category] || 0;
    const numericBudget = Number(budget) || 0;
    const usage = numericBudget ? Math.round(used / numericBudget * 100) : 0;
    const over = used > numericBudget;
    return `<div class="budget-card" data-budget-category="${esc(category)}">
      <div class="budget-card-content"><div class="budget-card-head">${icon(category)}<div><strong>${esc(category)}</strong><small>已用 ${money(used)} / 预算 ${money(numericBudget)}</small></div><span class="budget-percent ${over ? 'negative' : ''}">${usage}%</span></div>
      <div class="progress ${over ? 'orange' : ''}"><span style="width:${Math.min(100, numericBudget ? used / numericBudget * 100 : 0)}%"></span></div></div>
      <button type="button" class="budget-swipe-delete" data-action="delete-budget" data-category="${esc(category)}" aria-label="删除${esc(category)}预算">删除</button>
    </div>`;
  }).join('');
  document.getElementById('view-budget').innerHTML = `${heading('MONTHLY PLAN', '预算', '', '<button class="primary-button" data-action="open-budget-editor">＋ 新建预算</button>')}
    <div class="budget-layout"><div class="page-card"><div class="panel-header budget-panel-header"><div><h2 class="panel-title">分类预算</h2><p class="panel-subtitle">${monthLabel(state.selectedMonth)} · 已支出 ${money(spent)}</p></div><div class="budget-month-control"><label for="budgetMonthFilter">查看月份</label><input class="filter-select" type="month" id="budgetMonthFilter" value="${state.selectedMonth}" aria-label="选择预算月份" /></div></div><div class="budget-list">${budgetCards || '<div class="empty-state">还没有设置预算，点击上方按钮添加一个吧。</div>'}</div></div><div class="budget-hero"><p class="eyebrow">BUDGET HEALTH</p><h2 class="panel-title">${monthLabel(state.selectedMonth)}预算状态</h2><div class="budget-ring" style="background:conic-gradient(var(--blue) 0 ${Math.min(100, percent)}%, #dfe7ff ${Math.min(100, percent)}% 100%)"><div class="budget-ring-content"><strong>${percent}%</strong><small>预算使用率</small></div></div><div class="budget-stat"><span>总预算</span><strong>${money(totalBudget)}</strong></div><div class="budget-stat"><span>已支出</span><strong>${money(spent)}</strong></div><div class="budget-stat"><span>剩余可用</span><strong class="positive">${money(totalBudget - spent)}</strong></div></div></div>`;
  const budgetMonthFilter = document.getElementById('budgetMonthFilter');
  if (budgetMonthFilter) {
    budgetMonthFilter.defaultValue = currentMonthKey();
    budgetMonthFilter.addEventListener('change', event => {
      state.selectedMonth = event.target.value || currentMonthKey();
      state.monthSelectionMode = state.selectedMonth === currentMonthKey() ? 'auto' : 'manual';
      if (state.monthSelectionMode === 'auto') state.chartYear = new Date().getFullYear();
      saveState();
      renderAll();
    });
  }
}
function openBudgetEditor(category = '') {
  const form = document.getElementById('budgetForm');
  if (!form) return;
  form.reset();
  form.elements.originalCategory.value = category;
  renderBudgetCategoryOptions(category);
  const available = allBudgetCategories();
  const selectedCategory = category || available.find(item => !Object.prototype.hasOwnProperty.call(state.budgets, item)) || available[0] || '';
  form.elements.category.value = selectedCategory;
  form.elements.amount.value = category ? Number(state.budgets[category]) : '';
  const selectedIcon = state.categoryIcons?.[selectedCategory] || meta(selectedCategory).icon;
  form.elements.icon.value = selectedIcon;
  renderBudgetIconPicker(selectedIcon);
  document.getElementById('budgetModalTitle').textContent = category ? '修改预算' : '新建预算';
  document.getElementById('budgetModal').hidden = false;
}
function saveBudget(form) {
  const category = form.elements.category.value.trim();
  const originalCategory = form.elements.originalCategory.value.trim();
  const amount = Number(form.elements.amount.value);
  const selectedIcon = form.elements.icon.value || meta(category).icon;
  if (!category) return showToast('请选择预算类型');
  if (!Number.isFinite(amount) || amount <= 0) return showToast('请输入大于 0 的预算金额');
  if (!originalCategory && Object.prototype.hasOwnProperty.call(state.budgets, category)) return showToast('这个预算类型已经存在');
  if (originalCategory && originalCategory !== category && Object.prototype.hasOwnProperty.call(state.budgets, category)) return showToast('这个预算类型已经存在');
  if (originalCategory && originalCategory !== category) delete state.budgets[originalCategory];
  state.budgets[category] = amount;
  state.categoryIcons[category] = selectedIcon;
  saveState();
  closeModals();
  renderAll();
  showToast(originalCategory ? '预算已更新' : '预算已创建');
}
function deleteBudget(category) {
  if (!Object.prototype.hasOwnProperty.call(state.budgets, category)) return;
  if (!confirm(`确定删除“${category}”预算吗？已有账目不会被删除。`)) return;
  delete state.budgets[category];
  saveState();
  renderAll();
  showToast('预算已删除');
}

function renderSettings() {
  document.getElementById('view-settings').innerHTML = `${heading('PREFERENCES', '设置', '管理你的账本数据与使用偏好。', '')}<div class="page-card"><div class="settings-list"><div class="setting-row"><div><strong>数据备份</strong><small>将所有账目和账户导出为 JSON 文件</small></div><button class="secondary-button" data-action="export-data">导出数据</button></div><div class="setting-row"><div><strong>恢复数据</strong><small>从之前导出的 JSON 或 CSV 文件恢复账目</small></div><button class="secondary-button" data-action="import-data">导入数据</button></div><div class="setting-row"><div><strong>每周记账提醒</strong><small>在浏览器中显示轻量提醒</small></div><button class="toggle on" data-action="toggle-reminder" aria-label="切换提醒"></button></div><div class="setting-row"><div><strong>清空所有数据</strong><small>删除本机保存的全部账目和自定义账户</small></div><button class="danger-button" data-action="clear-data">清空数据</button></div></div></div>`;
}
function transactionCategories() { return state.categories[transactionType === 'income' ? 'income' : 'expense'] || expenseCategories; }
function renderTransactionCategories(selected = document.getElementById('transactionCategory')?.value || (transactionType === 'income' ? '工资' : '餐饮')) {
  const categories = transactionCategories();
  const category = categories.includes(selected) ? selected : categories[0];
  const input = document.getElementById('transactionCategory');
  const picker = document.getElementById('transactionCategoryPicker');
  const preview = document.getElementById('selectedCategoryPreview');
  if (!input || !picker || !preview) return;
  input.value = category;
  picker.innerHTML = `${categories.map(item => `<button type="button" class="category-choice ${item === category ? 'active' : ''}" data-category="${esc(item)}"><span class="category-choice-icon ${meta(item).className}">${meta(item).icon}</span><span>${esc(item)}</span></button>`).join('')}<button type="button" class="category-choice edit-category-choice" data-action="open-category-editor"><span class="category-choice-icon edit-icon">＋</span><span>编辑</span></button>`;
  preview.innerHTML = `${icon(category).replace('category-icon', 'selected-category-icon')}<strong>${esc(category)}</strong>`;
}
let categoryEditorType = 'expense';
let reopenBudgetAfterCategoryEditor = false;
let budgetReturnCategory = '';
let budgetReturnAmount = '';
function iconPicker(category, selectedIcon) {
  return `<div class="icon-picker">${iconChoices.map(item => `<button type="button" class="icon-choice ${item === selectedIcon ? 'active' : ''}" data-action="select-category-icon" data-category="${esc(category)}" data-icon="${esc(item)}" aria-label="选择${esc(item)}">${item}</button>`).join('')}</div>`;
}
function renderAddIconPicker() {
  const picker = document.getElementById('categoryAddIconPicker');
  if (!picker) return;
  const selected = document.querySelector('#categoryForm [name="icon"]')?.value || '✦';
  picker.innerHTML = iconChoices.map(item => `<button type="button" class="icon-choice ${item === selected ? 'active' : ''}" data-action="select-add-category-icon" data-icon="${esc(item)}">${item}</button>`).join('');
}
function renderCategoryEditor() {
  const list = document.getElementById('categoryEditorList');
  if (!list) return;
  const defaults = categoryEditorType === 'income' ? incomeCategories : expenseCategories;
  const categories = state.categories[categoryEditorType] || defaults;
  list.innerHTML = categories.map(category => {
    const isOther = category === '其他';
    const selectedIcon = meta(category).icon;
    return `<div class="category-editor-row"><div class="category-editor-main"><button type="button" class="category-editor-symbol ${meta(category).className}" data-action="toggle-icon-picker" data-category="${esc(category)}" aria-label="编辑${esc(category)}图标">${selectedIcon}</button><input class="field-input category-name-input" value="${esc(category)}" data-old-category="${esc(category)}" ${isOther ? 'readonly' : ''} /><div class="category-editor-actions"><button type="button" class="category-save-button" data-action="save-category" data-category="${esc(category)}">保存</button><button type="button" class="category-delete-button" data-action="delete-category" data-category="${esc(category)}" ${isOther ? 'disabled title="其他是默认兜底分类"' : ''}>删除</button></div></div>${iconPicker(category, selectedIcon)}</div>`;
  }).join('');
  document.querySelectorAll('.category-editor-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.categoryType === categoryEditorType));
  renderAddIconPicker();
}
function openCategoryEditor(type = '') {
  categoryEditorType = type || (transactionType === 'income' ? 'income' : 'expense');
  renderCategoryEditor();
  document.getElementById('categoryModal').hidden = false;
}
function saveCategory(category) {
  const input = document.querySelector(`.category-name-input[data-old-category="${CSS.escape(category)}"]`);
  const next = input?.value.trim();
  if (!next) return showToast('分类名称不能为空');
  if (next !== category && state.categories[categoryEditorType].includes(next)) return showToast('分类名称已存在');
  const selectedIcon = state.categoryIcons[category] || '✦';
  state.categories[categoryEditorType] = state.categories[categoryEditorType].map(item => item === category ? next : item);
  state.categoryIcons[next] = selectedIcon;
  if (reopenBudgetAfterCategoryEditor && budgetReturnCategory === category) budgetReturnCategory = next;
  if (next !== category) delete state.categoryIcons[category];
  state.records.forEach(record => { if (record.category === category && record.type === categoryEditorType) record.category = next; });
  if (state.budgets[category] !== undefined) { state.budgets[next] = state.budgets[category]; delete state.budgets[category]; }
  saveState(); renderCategoryEditor(); renderTransactionCategories(next); renderAll(); showToast('分类已更新');
}
function deleteCategory(category) {
  if (category === '其他') return showToast('“其他”是默认兜底分类，不能删除');
  if ((state.categories[categoryEditorType] || []).length <= 1) return showToast('至少保留一个分类');
  if (!confirm(`确定删除“${category}”分类吗？已有账目会保留原名称。`)) return;
  state.categories[categoryEditorType] = state.categories[categoryEditorType].filter(item => item !== category);
  if (reopenBudgetAfterCategoryEditor && budgetReturnCategory === category) budgetReturnCategory = '';
  delete state.categoryIcons[category];
  saveState(); renderCategoryEditor(); renderTransactionCategories(); renderAll(); showToast('分类已删除');
}
function fillTransactionForm() {
  const form = document.getElementById('transactionForm');
  const accountInput = document.getElementById('transactionAccount');
  if (accountInput) accountInput.value = state.accounts[0]?.name || '';
  const selectedCategory = transactionType === 'income' ? '工资' : '餐饮';
  renderTransactionCategories(selectedCategory);
  document.querySelectorAll('.type-option').forEach(button => button.classList.toggle('active', button.dataset.type === transactionType));
  form.classList.toggle('transfer-mode', transactionType === 'transfer');
}
function openAdd() {
  transactionType = 'expense';
  editingRecordId = null;
  const form = document.getElementById('transactionForm');
  form.reset();
  form.elements.date.value = currentDateKey();
  document.getElementById('transactionNoteField').classList.remove('visible');
  document.getElementById('noteButtonText').textContent = '备注';
  fillTransactionForm();
  document.getElementById('transactionModal').hidden = false;
  setTimeout(() => form.elements.amount.focus(), 20);
}
function openEditRecord(id) {
  const record = state.records.find(item => item.id === id);
  if (!record) return;
  editingRecordId = id;
  transactionType = record.type;
  const form = document.getElementById('transactionForm');
  form.reset();
  form.elements.amount.value = record.amount;
  form.elements.date.value = record.date;
  form.elements.note.value = record.note || '';
  form.elements.account.value = record.account || state.accounts[0]?.name || '';
  document.getElementById('transactionNoteField').classList.toggle('visible', Boolean(record.note));
  document.getElementById('noteButtonText').textContent = record.note ? '已备注' : '备注';
  fillTransactionForm();
  form.elements.account.value = record.account || state.accounts[0]?.name || '';
  renderTransactionCategories(record.category);
  document.getElementById('transactionModal').hidden = false;
  setTimeout(() => form.elements.amount.focus(), 20);
}
function closeModals() {
  document.querySelectorAll('.modal-layer').forEach(layer => layer.hidden = true);
  document.getElementById('cloudModal')?.setAttribute('hidden', '');
  cloudPanel('cloudLoginFields');
  editingRecordId = null;
  reopenBudgetAfterCategoryEditor = false;
  budgetReturnCategory = '';
  budgetReturnAmount = '';
}
function closeCategoryEditor(returnToBudget = true) {
  document.getElementById('categoryModal').hidden = true;
  if (!returnToBudget || !reopenBudgetAfterCategoryEditor) {
    reopenBudgetAfterCategoryEditor = false;
    budgetReturnCategory = '';
    budgetReturnAmount = '';
    return;
  }
  const category = allBudgetCategories().includes(budgetReturnCategory) ? budgetReturnCategory : '';
  const amount = budgetReturnAmount;
  reopenBudgetAfterCategoryEditor = false;
  budgetReturnCategory = '';
  budgetReturnAmount = '';
  openBudgetEditor(category);
  const form = document.getElementById('budgetForm');
  if (form && amount !== '') form.elements.amount.value = amount;
}
function deleteRecord(id) { const record = state.records.find(r => r.id === id); if (!record) return; if (!confirm(`确定删除“${record.note || record.category}”这笔账吗？`)) return; state.records = state.records.filter(r => r.id !== id); const account = state.accounts.find(a => a.name === record.account); if (account) account.balance += record.type === 'income' ? -Number(record.amount) : Number(record.amount); saveState(); renderAll(); showToast('账目已删除'); }
function exportData() { const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `西瓜账本备份-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(link.href); showToast('数据已导出'); }
function importData(file) { const reader = new FileReader(); reader.onload = () => { try { const imported = JSON.parse(reader.result); if (!Array.isArray(imported.records) || !Array.isArray(imported.accounts)) throw new Error(); state = { ...defaultState, ...imported }; saveState(); renderAll(); showToast('数据已恢复'); } catch { showToast('文件格式不正确'); } }; reader.readAsText(file); }
function handleAction(element) { const action = element.dataset.action; if (action === 'open-cloud-auth') { if (cloudSession) { openCloudAuth(); } else { openCloudAuth(); } return; } if (action === 'cloud-sign-in') { signInCloud(); return; } if (action === 'cloud-sign-up') { signUpCloud(); return; } if (action === 'cloud-show-forgot') { showCloudForgot(); return; } if (action === 'cloud-show-login') { showCloudLogin(); return; } if (action === 'cloud-send-reset') { sendPasswordReset(); return; } if (action === 'cloud-verify-reset') { verifyRecoveryCode(); return; } if (action === 'cloud-update-password') { updateCloudPassword(); return; } if (action === 'cloud-sign-out') { signOutCloud(); return; } if (action === 'cloud-sync-now') { syncCloudState(); return; } if (action === 'scroll-to-trend') { document.getElementById('trendPanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; } if (action === 'switch-view') { state.activeView = element.dataset.view; saveState(); renderAll(); document.getElementById('sidebar').classList.remove('open'); window.scrollTo({ top: 0, behavior: 'smooth' }); } else if (action === 'open-add') openAdd(); else if (action === 'close-modal') closeModals(); else if (action === 'delete-record') deleteRecord(element.dataset.id); else if (action === 'edit-record') openEditRecord(element.dataset.id); else if (action === 'open-account') { document.getElementById('accountForm').reset(); document.getElementById('accountModal').hidden = false; } else if (action === 'export-data') exportData(); else if (action === 'import-data') document.getElementById('importInput').click(); else if (action === 'clear-data') { if (confirm('确定清空所有数据吗？此操作无法撤销。')) { localStorage.removeItem(storageKey); state = structuredClone(defaultState); renderAll(); showToast('已恢复为示例账本'); } } else if (action === 'toggle-reminder') element.classList.toggle('on'); else if (action === 'focus-note') { document.getElementById('transactionNoteField').classList.add('visible'); document.getElementById('noteButtonText').textContent = '已备注'; document.querySelector('#transactionForm [name="note"]').focus(); } else if (action === 'open-category-editor') openCategoryEditor(); else if (action === 'toggle-record-search') { const box = document.querySelector('.record-toolbar-search'); box?.classList.toggle('expanded'); if (box?.classList.contains('expanded')) document.getElementById('recordSearch')?.focus(); } else if (action === 'open-budget-category-editor') openBudgetCategoryEditor(); else if (action === 'close-category-editor') closeCategoryEditor(); else if (action === 'open-budget-editor') openBudgetEditor(); else if (action === 'edit-budget') openBudgetEditor(element.dataset.category); else if (action === 'delete-budget') deleteBudget(element.dataset.category); else if (action === 'save-category') saveCategory(element.dataset.category); else if (action === 'delete-category') deleteCategory(element.dataset.category); else if (action === 'toggle-icon-picker') {
  const row = element.closest('.category-editor-row');
  document.querySelectorAll('.category-editor-row .icon-picker.open').forEach(picker => { if (picker !== row?.querySelector('.icon-picker')) picker.classList.remove('open'); });
  row?.querySelector('.icon-picker')?.classList.toggle('open');
} else if (action === 'select-category-icon') {
  const category = element.dataset.category;
  const selectedIcon = element.dataset.icon;
  state.categoryIcons[category] = selectedIcon;
  const row = element.closest('.category-editor-row');
  const symbol = row?.querySelector('.category-editor-symbol');
  if (symbol) symbol.textContent = selectedIcon;
  row?.querySelectorAll('.icon-choice').forEach(choice => choice.classList.toggle('active', choice.dataset.icon === selectedIcon));
  saveState();
  renderTransactionCategories(document.getElementById('transactionCategory')?.value);
  renderAll();
  showToast('图标已更新');
} else if (action === 'toggle-add-icon-picker') {
  document.getElementById('categoryAddIconPicker')?.classList.toggle('open');
} else if (action === 'select-add-category-icon') {
  const iconValue = element.dataset.icon;
  const form = document.getElementById('categoryForm');
  if (form?.elements.icon) form.elements.icon.value = iconValue;
  const preview = document.getElementById('categoryAddIcon');
  if (preview) preview.textContent = iconValue;
  form?.querySelectorAll('#categoryAddIconPicker .icon-choice').forEach(choice => choice.classList.toggle('active', choice.dataset.icon === iconValue));
  document.getElementById('categoryAddIconPicker')?.classList.remove('open');
} else if (action === 'select-budget-icon') {
  const iconValue = element.dataset.icon;
  const form = document.getElementById('budgetForm');
  if (form?.elements.icon) form.elements.icon.value = iconValue;
  form?.querySelectorAll('#budgetIconPicker .icon-choice').forEach(choice => choice.classList.toggle('active', choice.dataset.icon === iconValue));
} else if (action === 'toast') showToast(element.dataset.message || '已完成'); }

function evaluateAmountExpression(expression) {
  const source = String(expression || '').replace(/\s+/g, '');
  if (!source || !/^-?\d+(?:\.\d+)?(?:[+-]\d+(?:\.\d+)?)*$/.test(source)) return NaN;
  const terms = source.match(/(?:^|[+-])\d+(?:\.\d+)?/g) || [];
  let total = Number(terms.shift());
  for (const term of terms) {
    const operator = term[0];
    const number = Number(term.slice(1));
    if (!Number.isFinite(number)) return NaN;
    total = operator === '+' ? total + number : total - number;
  }
  return Number(total.toFixed(2));
}

function handlePadKey(key) {
  const input = document.querySelector('#transactionForm [name="amount"]');
  if (!input) return;
  let value = input.value || '';
  const lastSegment = () => value.split(/[+-]/).pop() || '';
  if (key === 'clear') value = '';
  else if (key === 'backspace') value = value.slice(0, -1);
  else if (key === '.') {
    if (!lastSegment().includes('.')) {
      if (!value || /[+-]$/.test(value)) value += '0.';
      else value += '.';
    }
  } else if (key === '+' || key === '-') {
    if (!value && key === '-') value = '-';
    else if (value && /[+-]$/.test(value)) value = value.slice(0, -1) + key;
    else if (value && value !== '-') value += key;
  } else if (/^\d$/.test(key)) {
    const segment = lastSegment();
    if (segment === '0') value = value.slice(0, -1) + key;
    else value += key;
  }
  input.value = value;
}

let budgetTouchState = null;
let lastBudgetTap = null;

document.addEventListener('touchstart', event => {
  const card = event.target.closest('.budget-card[data-budget-category]');
  if (!card || event.target.closest('button')) return;
  const touch = event.touches[0];
  if (!touch) return;
  budgetTouchState = { card, startX: touch.clientX, startY: touch.clientY, moved: false };
}, { passive: true });

document.addEventListener('touchmove', event => {
  if (!budgetTouchState) return;
  const touch = event.touches[0];
  if (!touch) return;
  const deltaX = touch.clientX - budgetTouchState.startX;
  const deltaY = touch.clientY - budgetTouchState.startY;
  if (Math.abs(deltaX) < 8 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
  budgetTouchState.moved = true;
  if (deltaX < 0) {
    document.querySelectorAll('.budget-card.swiped').forEach(card => { if (card !== budgetTouchState.card) card.classList.remove('swiped'); });
    budgetTouchState.card.classList.add('swiped');
  } else {
    budgetTouchState.card.classList.remove('swiped');
  }
  event.preventDefault();
}, { passive: false });

document.addEventListener('touchend', event => {
  if (!budgetTouchState) return;
  const { card, moved } = budgetTouchState;
  budgetTouchState = null;
  if (moved || event.target.closest('button')) return;
  if (card.classList.contains('swiped')) {
    card.classList.remove('swiped');
    lastBudgetTap = null;
    return;
  }
  const now = Date.now();
  if (lastBudgetTap && lastBudgetTap.card === card && now - lastBudgetTap.time < 380) {
    lastBudgetTap = null;
    openBudgetEditor(card.dataset.budgetCategory);
  } else {
    lastBudgetTap = { card, time: now };
  }
}, { passive: true });

document.addEventListener('dblclick', event => {
  const card = event.target.closest('.budget-card[data-budget-category]');
  if (!card || event.target.closest('button')) return;
  openBudgetEditor(card.dataset.budgetCategory);
});

let trendTooltipTimer = null;
function showTrendTooltip(bar) {
  document.querySelectorAll('.bar.show-tooltip').forEach(item => { if (item !== bar) item.classList.remove('show-tooltip'); });
  bar.classList.add('show-tooltip');
  clearTimeout(trendTooltipTimer);
  trendTooltipTimer = setTimeout(() => bar.classList.remove('show-tooltip'), 2600);
}
document.addEventListener('pointerover', event => {
  const bar = event.target.closest('.bar[data-tooltip]');
  if (bar) showTrendTooltip(bar);
});
document.addEventListener('focusin', event => {
  const bar = event.target.closest('.bar[data-tooltip]');
  if (bar) showTrendTooltip(bar);
});
document.addEventListener('touchstart', event => {
  const bar = event.target.closest('.bar[data-tooltip]');
  if (bar) showTrendTooltip(bar);
}, { passive: true });

document.addEventListener('click', event => {
  const action = event.target.closest('[data-action]');
  if (action) handleAction(action);
  const budgetIconChoice = event.target.closest('[data-budget-icon]');
  if (budgetIconChoice) handleAction({ dataset: { action: 'select-budget-icon', icon: budgetIconChoice.dataset.budgetIcon } });
  const quick = event.target.closest('[data-amount]');
  if (quick) document.querySelector('#transactionForm [name="amount"]').value = quick.dataset.amount;
  const categoryChoice = event.target.closest('.category-choice[data-category]');
  if (categoryChoice) renderTransactionCategories(categoryChoice.dataset.category);
  const padButton = event.target.closest('[data-key]');
  if (padButton) handlePadKey(padButton.dataset.key);
  if (event.target.classList.contains('modal-layer')) closeModals();
  const editorTab = event.target.closest('.category-editor-tab');
  if (editorTab) { categoryEditorType = editorTab.dataset.categoryType; renderCategoryEditor(); }
  const typeButton = event.target.closest('.type-option');
  if (typeButton) { transactionType = typeButton.dataset.type; fillTransactionForm(); }
});

document.getElementById('mobileMenuBtn').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModals(); });
document.getElementById('transactionForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const amount = evaluateAmountExpression(form.elements.amount.value);
  if (!Number.isFinite(amount) || amount <= 0) return showToast('请输入正确的金额或算式');
  form.elements.amount.value = amount.toFixed(2);
  const category = form.elements.category.value;
  const accountName = form.elements.account.value || state.accounts[0]?.name || '';
  const nextRecord = { type: transactionType, amount, category, account: accountName, date: form.elements.date.value, note: form.elements.note.value.trim() || category };
  if (editingRecordId) {
    const existing = state.records.find(record => record.id === editingRecordId);
    if (!existing) return showToast('这笔账已不存在');
    const oldAccount = state.accounts.find(account => account.name === existing.account);
    if (oldAccount && existing.type !== 'transfer') oldAccount.balance += existing.type === 'income' ? -Number(existing.amount) : Number(existing.amount);
    const newAccount = state.accounts.find(account => account.name === accountName);
    if (newAccount && nextRecord.type !== 'transfer') newAccount.balance += nextRecord.type === 'income' ? amount : -amount;
    Object.assign(existing, nextRecord);
    saveState();
    closeModals();
    renderAll();
    showToast('账目已更新');
    return;
  }
  const record = { id: `r-${Date.now()}`, createdAt: new Date().toISOString(), ...nextRecord };
  state.records.push(record);
  const account = state.accounts.find(a => a.name === accountName);
  if (account && transactionType !== 'transfer') account.balance += transactionType === 'income' ? amount : -amount;
  saveState();
  closeModals();
  renderAll();
  showToast('账目已保存');
});
document.getElementById('accountForm').addEventListener('submit', event => { event.preventDefault(); const form = event.currentTarget; const name = form.elements.name.value.trim(); if (!name) return; if (state.accounts.some(a => a.name === name)) return showToast('账户名称已存在'); state.accounts.push({ id: `a-${Date.now()}`, name, type: form.elements.type.value, balance: Number(form.elements.balance.value) || 0 }); saveState(); closeModals(); renderAll(); showToast('账户已创建'); });
document.getElementById('categoryForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.elements.name.value.trim();
  if (!name) return;
  if (state.categories[categoryEditorType].includes(name)) return showToast('分类名称已存在');
  const selectedIcon = form.elements.icon?.value || '✦';
  state.categories[categoryEditorType].push(name);
  state.categoryIcons[name] = selectedIcon;
  saveState();
  form.reset();
  if (form.elements.icon) form.elements.icon.value = '✦';
  const addIcon = document.getElementById('categoryAddIcon');
  if (addIcon) addIcon.textContent = '✦';
  form.querySelector('.icon-picker')?.classList.remove('open');
  renderCategoryEditor();
  renderTransactionCategories(name);
  renderAll();
  showToast('分类已添加');
});

document.getElementById('budgetForm').addEventListener('submit', event => { event.preventDefault(); saveBudget(event.currentTarget); });
document.getElementById('budgetCategory').addEventListener('change', event => {
  const form = document.getElementById('budgetForm');
  const selectedIcon = state.categoryIcons?.[event.target.value] || meta(event.target.value).icon;
  form.elements.icon.value = selectedIcon;
  renderBudgetIconPicker(selectedIcon);
});

document.getElementById('importInput').addEventListener('change', event => { const file = event.target.files?.[0]; if (file) importData(file); event.target.value = ''; });
renderAll();

initCloud();

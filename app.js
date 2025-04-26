// DOM要素の取得
const memoInput = document.getElementById('memo-input');
const saveButton = document.getElementById('save-button');
const memoList = document.getElementById('memo-list');
const searchInput = document.getElementById('search-input');
const themeToggle = document.getElementById('theme-toggle');

// メモを保存するための配列
let memos = JSON.parse(localStorage.getItem('memos')) || [];

// 編集中のメモのインデックス
let editingIndex = -1;

// 初期表示時にメモを表示
renderMemos();

// ダークモードの初期設定
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
}

// メモを保存するイベントリスナー
saveButton.addEventListener('click', () => {
    saveMemo();
});

// テーマ切り替えのイベントリスナー
themeToggle.addEventListener('click', () => {
    toggleTheme();
});

// Enterキーでもメモを保存できるようにする
memoInput.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'Enter') {
        saveMemo();
    }
});

// 検索機能
searchInput.addEventListener('input', () => {
    renderMemos();
});

// テーマ切り替え関数
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

// メモの保存・更新関数
function saveMemo() {
    const content = memoInput.value.trim();
    
    if (!content) return; // 空のメモは保存しない
    
    if (editingIndex >= 0) {
        // 既存のメモを更新
        memos[editingIndex].content = content;
        memos[editingIndex].updatedAt = new Date().toISOString();
    } else {
        // 新しいメモを作成
        const newMemo = {
            id: Date.now().toString(),
            content: content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        memos.unshift(newMemo); // 新しいメモを先頭に追加
    }
    
    // ローカルストレージに保存
    saveToLocalStorage();
    
    // 入力欄をクリア
    memoInput.value = '';
    
    // 編集状態をリセット
    editingIndex = -1;
    saveButton.textContent = '保存';
    
    // メモリストを更新
    renderMemos();
}

// メモリストの表示を更新
function renderMemos() {
    // 検索フィルタリング
    const searchTerm = searchInput.value.toLowerCase();
    const filteredMemos = memos.filter(memo => 
        memo.content.toLowerCase().includes(searchTerm)
    );
    
    // メモリストをクリア
    memoList.innerHTML = '';
    
    // メモがない場合のメッセージ
    if (filteredMemos.length === 0) {
        memoList.innerHTML = '<p class="no-memos">メモがありません</p>';
        return;
    }
    
    // メモを表示
    filteredMemos.forEach((memo, index) => {
        const memoItem = document.createElement('div');
        memoItem.className = 'memo-item';
        
        // 日付のフォーマット
        const createdDate = new Date(memo.createdAt);
        const formattedDate = `${createdDate.getFullYear()}/${(createdDate.getMonth()+1).toString().padStart(2, '0')}/${createdDate.getDate().toString().padStart(2, '0')} ${createdDate.getHours().toString().padStart(2, '0')}:${createdDate.getMinutes().toString().padStart(2, '0')}`;
        
        memoItem.innerHTML = `
            <div class="memo-content">${memo.content}</div>
            <div class="memo-footer">
                <span class="memo-date">${formattedDate}</span>
                <div class="memo-buttons">
                    <button class="edit-button" title="編集">✏️</button>
                    <button class="delete-button" title="削除">🗑️</button>
                </div>
            </div>
        `;
        
        // 編集ボタンのイベントリスナー
        const editButton = memoItem.querySelector('.edit-button');
        editButton.addEventListener('click', () => {
            const originalIndex = memos.findIndex(m => m.id === memo.id);
            editMemo(originalIndex);
        });
        
        // 削除ボタンのイベントリスナー
        const deleteButton = memoItem.querySelector('.delete-button');
        deleteButton.addEventListener('click', () => {
            const originalIndex = memos.findIndex(m => m.id === memo.id);
            deleteMemo(originalIndex);
        });
        
        memoList.appendChild(memoItem);
    });
}

// メモの編集
function editMemo(index) {
    const memo = memos[index];
    memoInput.value = memo.content;
    editingIndex = index;
    saveButton.textContent = '更新';
    memoInput.focus();
}

// メモの削除
function deleteMemo(index) {
    if (confirm('このメモを削除しますか？')) {
        memos.splice(index, 1);
        saveToLocalStorage();
        renderMemos();
        
        // 編集中だった場合はリセット
        if (editingIndex === index) {
            memoInput.value = '';
            editingIndex = -1;
            saveButton.textContent = '保存';
        }
    }
}

// ローカルストレージにメモを保存
function saveToLocalStorage() {
    localStorage.setItem('memos', JSON.stringify(memos));
}
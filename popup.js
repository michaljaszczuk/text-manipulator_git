document.addEventListener('DOMContentLoaded', () => {
    const mainTextarea = document.getElementById('main-textarea');
    const tabs = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const applyButtons = document.querySelectorAll('.apply-btn');
    const clearButton = document.getElementById('clear-text-btn');
    const copyButton = document.getElementById('copy-text-btn');
    const copyTooltip = document.getElementById('copy-tooltip');
    const undoButton = document.getElementById('undo-btn');
    const themeSwitcher = document.getElementById('theme-switcher');
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');

    let saveStateTimeout = null;
    const debouncedSaveState = () => {
        clearTimeout(saveStateTimeout);
        saveStateTimeout = setTimeout(() => {
            saveState();
        }, 300);
    };

    const saveState = () => {
        const activeTab = document.querySelector('.tab-link.active').dataset.tab;
        const state = {
            text: mainTextarea.value,
            prefix: document.getElementById('prefix-input').value,
            suffix: document.getElementById('suffix-input').value,
            joinSeparator: document.getElementById('join-separator-input').value,
            extractDelimiter: document.getElementById('extract-delimiter-input').value,
            extractIndex: document.getElementById('extract-index-input').value,
            findText: document.getElementById('find-input').value,
            replaceText: document.getElementById('replace-input').value,
            isRegex: document.getElementById('regex-checkbox').checked,
            isCaseSensitive: document.getElementById('case-sensitive-checkbox').checked,
            activeTab: activeTab,
        };
        chrome.storage.local.set({ savedState: state });
    };

    const loadState = () => {
        chrome.storage.local.get(['savedState'], (result) => {
            if (result.savedState) {
                const state = result.savedState;
                mainTextarea.value = state.text || '';
                document.getElementById('prefix-input').value = state.prefix || '';
                document.getElementById('suffix-input').value = state.suffix || '';
                document.getElementById('join-separator-input').value = state.joinSeparator || '';
                document.getElementById('extract-delimiter-input').value = state.extractDelimiter || ',';
                document.getElementById('extract-index-input').value = state.extractIndex || '0';
                document.getElementById('find-input').value = state.findText || '';
                document.getElementById('replace-input').value = state.replaceText || '';
                document.getElementById('regex-checkbox').checked = state.isRegex || false;
                document.getElementById('case-sensitive-checkbox').checked = state.isCaseSensitive || false;

                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                const tabToActivate = document.querySelector(`.tab-link[data-tab="${state.activeTab}"]`) || document.querySelector('.tab-link');
                tabToActivate.classList.add('active');
                document.getElementById(tabToActivate.dataset.tab).classList.add('active');

                updateStats();
                saveUndoState();
            }
        });
    };

    let textHistory = [];
    const MAX_HISTORY_SIZE = 5;

    const saveUndoState = () => {
        const currentText = mainTextarea.value;
        if (textHistory.length === 0 || textHistory[textHistory.length - 1] !== currentText) {
            textHistory.push(currentText);
            if (textHistory.length > MAX_HISTORY_SIZE) {
                textHistory.shift();
            }
        }
        updateUndoButton();
    };

    const undoLastChange = () => {
        if (textHistory.length > 1) {
            textHistory.pop();
            mainTextarea.value = textHistory[textHistory.length - 1];
            updateStats();
            saveState();
            updateUndoButton();
        }
    };

    const updateUndoButton = () => {
        undoButton.disabled = textHistory.length <= 1;
    };

    const showError = (message) => {
        const errorTooltip = document.createElement('div');
        errorTooltip.className = 'error-tooltip';
        errorTooltip.textContent = message;
        errorTooltip.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #f44336; color: white; padding: 12px 20px; border-radius: 4px; z-index: 10000; box-shadow: 0 2px 8px rgba(0,0,0,0.2);';
        document.body.appendChild(errorTooltip);
        setTimeout(() => {
            errorTooltip.remove();
        }, 3000);
    };

    const setTheme = (theme) => {
        document.body.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'block';
        } else {
            moonIcon.style.display = 'block';
            sunIcon.style.display = 'none';
        }
        chrome.storage.local.set({ theme: theme });
    };

    const toggleTheme = () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };

    const loadTheme = () => {
        chrome.storage.local.get(['theme'], (result) => {
            const savedTheme = result.theme || 'dark';
            setTheme(savedTheme);
        });
    };

    const stats = {
        chars: document.getElementById('stat-chars'),
        words: document.getElementById('stat-words'),
        lines: document.getElementById('stat-lines'),
        sentences: document.getElementById('stat-sentences'),
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tab.dataset.tab).classList.add('active');
            saveState();
        });
    });

    const updateStats = () => {
        const text = mainTextarea.value;
        const calculatedStats = Utils.calculateStats(text);
        stats.chars.textContent = calculatedStats.chars;
        stats.words.textContent = calculatedStats.words;
        stats.lines.textContent = calculatedStats.lines;
        stats.sentences.textContent = calculatedStats.sentences;
    };

    const applyTransformation = (featureName) => {
        saveUndoState();
        const text = mainTextarea.value;
        let newText = text;

        try {
            switch (featureName) {
                case 'addPrefixSuffix':
                    const prefix = document.getElementById('prefix-input').value;
                    const suffix = document.getElementById('suffix-input').value;
                    newText = Features.addPrefixSuffix(text, prefix, suffix);
                    break;
                case 'joinLines':
                    const separator = document.getElementById('join-separator-input').value;
                    newText = Features.joinLines(text, separator);
                    break;
                case 'extractColumn':
                     const delimiter = document.getElementById('extract-delimiter-input').value;
                     const index = parseInt(document.getElementById('extract-index-input').value, 10);
                     newText = Features.extractColumn(text, delimiter, index);
                    break;
                case 'removeDuplicateLines':
                    newText = Features.removeDuplicateLines(text);
                    break;
                case 'removeEmptyLines':
                    newText = Features.removeEmptyLines(text);
                    break;
                case 'trimLines':
                    newText = Features.trimLines(text);
                    break;
                case 'removeExtraWhitespace':
                    newText = Features.removeExtraWhitespace(text);
                    break;
                case 'sortAlphaAsc':
                    newText = Features.sortAlphabetical(text);
                    break;
                case 'sortAlphaDesc':
                    newText = Features.sortAlphabetical(text, true);
                    break;
                case 'sortNumAsc':
                    newText = Features.sortNumerical(text);
                    break;
                case 'sortNumDesc':
                    newText = Features.sortNumerical(text, true);
                    break;
                case 'sortLengthAsc':
                    newText = Features.sortbyLength(text);
                    break;
                case 'sortLengthDesc':
                    newText = Features.sortbyLength(text, true);
                    break;
                case 'findAndReplace':
                    const find = document.getElementById('find-input').value;
                    const replace = document.getElementById('replace-input').value;
                    const isRegex = document.getElementById('regex-checkbox').checked;
                    const isCaseSensitive = document.getElementById('case-sensitive-checkbox').checked;
                    newText = Features.findAndReplace(text, find, replace, isRegex, isCaseSensitive);
                    break;
            }
            mainTextarea.value = newText;
            updateStats();
            saveState();
        } catch(error) {
            console.error(`Error during transformation "${featureName}":`, error);
            showError(`Error: ${error.message || 'Transformation failed'}`);
        }
    };

    mainTextarea.addEventListener('input', () => {
        updateStats();
        debouncedSaveState();
    });

    const inputsToSave = [
        'prefix-input', 'suffix-input', 'join-separator-input',
        'extract-delimiter-input', 'extract-index-input', 'find-input', 'replace-input'
    ];
    inputsToSave.forEach(id => {
        document.getElementById(id).addEventListener('input', debouncedSaveState);
    });
    const checkboxesToSave = ['regex-checkbox', 'case-sensitive-checkbox'];
    checkboxesToSave.forEach(id => {
        document.getElementById(id).addEventListener('change', saveState);
    });

    themeSwitcher.addEventListener('click', toggleTheme);
    undoButton.addEventListener('click', undoLastChange);
    
    applyButtons.forEach(button => {
        button.addEventListener('click', () => {
            applyTransformation(button.dataset.feature);
        });
    });

    clearButton.addEventListener('click', () => {
        saveUndoState();
        mainTextarea.value = '';
        updateStats();
        saveState();
    });
    
    copyButton.addEventListener('click', () => {
        const textToCopy = mainTextarea.value;
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                copyTooltip.classList.add('show');
                setTimeout(() => {
                    copyTooltip.classList.remove('show');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                showError('Failed to copy text to clipboard');
            });
        }
    });

    loadTheme();
    loadState();
});
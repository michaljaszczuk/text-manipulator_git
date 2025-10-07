document.addEventListener('DOMContentLoaded', () => {
    // Referencje do elementów DOM
    const mainTextarea = document.getElementById('main-textarea');
    const tabs = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const applyButtons = document.querySelectorAll('.apply-btn');
    const clearButton = document.getElementById('clear-text-btn');
    const copyButton = document.getElementById('copy-text-btn'); // Zmieniono z saveButton
    const undoButton = document.getElementById('undo-btn');
    const themeSwitcher = document.getElementById('theme-switcher');
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    const copyTooltip = document.getElementById('copy-tooltip');

    // Historia zmian dla funkcji undo
    let textHistory = [];
    const MAX_HISTORY_SIZE = 5;

    const stats = {
        chars: document.getElementById('stat-chars'),
        words: document.getElementById('stat-words'),
        lines: document.getElementById('stat-lines'),
        sentences: document.getElementById('stat-sentences'),
    };

    // --- Zarządzanie historią (Undo) ---
    const saveState = () => {
        const currentText = mainTextarea.value;
        // Zapisz tylko jeśli tekst się zmienił
        if (textHistory.length === 0 || textHistory[textHistory.length - 1] !== currentText) {
            textHistory.push(currentText);
            if (textHistory.length > MAX_HISTORY_SIZE) {
                textHistory.shift(); // Usuń najstarszy element
            }
        }
        updateUndoButton();
    };

    const undoLastChange = () => {
        if (textHistory.length > 0) {
            // Zapisz bieżący stan, aby można go było cofnąć
            saveState();
            // Usuń bieżący stan z historii, aby wrócić do poprzedniego
            textHistory.pop();

            const previousText = textHistory.length > 0 ? textHistory[textHistory.length - 1] : '';
            mainTextarea.value = previousText;
            updateStats();
        }
        updateUndoButton();
    };

    const updateUndoButton = () => {
        undoButton.disabled = textHistory.length === 0;
    };


    // --- Zarządzanie motywem ---
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
            const savedTheme = result.theme || 'dark'; // Domyślnie ciemny
            setTheme(savedTheme);
        });
    };

    // --- Zarządzanie tekstem ---
    const loadText = () => {
        chrome.storage.local.get(['savedText'], (result) => {
            if (result.savedText) {
                mainTextarea.value = result.savedText;
                updateStats();
                // Po załadowaniu tekstu zapisz stan początkowy
                saveState();
            }
        });
    };

    // --- Nowa funkcja kopiowania ---
    const copyTextToClipboard = () => {
        const textToCopy = mainTextarea.value;
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                showTooltip();
            }).catch(err => {
                console.error('Błąd podczas kopiowania tekstu: ', err);
            });
        } else {
            // Fallback dla starszych przeglądarek
            const textArea = document.createElement("textarea");
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                showTooltip();
            } catch (err) {
                console.error('Błąd podczas kopiowania tekstu (fallback): ', err);
            }
            document.body.removeChild(textArea);
        }
    };

    const showTooltip = () => {
        copyTooltip.classList.add('show');
        setTimeout(() => {
            copyTooltip.classList.remove('show');
        }, 1500); // Tooltip zniknie po 1.5 sekundy
    };


    // --- Zarządzanie stanem UI ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tab.dataset.tab).classList.add('active');
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

    // --- Logika Funkcji ---
    const applyTransformation = (featureName) => {
        // Zapisz stan przed transformacją
        saveState();
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
            // Zapisz stan po transformacji
            saveState();
        } catch(error) {
            console.error(`Błąd podczas transformacji "${featureName}":`, error);
        }
    };

    // --- Nasłuchiwacze zdarzeń ---
    mainTextarea.addEventListener('input', updateStats);
    themeSwitcher.addEventListener('click', toggleTheme);
    undoButton.addEventListener('click', undoLastChange);

    applyButtons.forEach(button => {
        button.addEventListener('click', () => {
            applyTransformation(button.dataset.feature);
        });
    });

    clearButton.addEventListener('click', () => {
        saveState();
        mainTextarea.value = '';
        updateStats();
        chrome.storage.local.set({ savedText: mainTextarea.value }); // Czyścimy zapisany tekst
        saveState();
    });

    copyButton.addEventListener('click', copyTextToClipboard); // Nowy event listener

    // --- Inicjalizacja ---
    loadTheme();
    loadText();
    updateUndoButton(); // Ustaw stan przycisku na starcie
});
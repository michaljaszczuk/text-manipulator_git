document.addEventListener('DOMContentLoaded', () => {
    // Referencje do elementów DOM
    const mainTextarea = document.getElementById('main-textarea');
    const tabs = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const applyButtons = document.querySelectorAll('.apply-btn');
    const clearButton = document.getElementById('clear-text-btn');
    const saveButton = document.getElementById('save-text-btn');
    const themeSwitcher = document.getElementById('theme-switcher');
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');

    const stats = {
        chars: document.getElementById('stat-chars'),
        words: document.getElementById('stat-words'),
        lines: document.getElementById('stat-lines'),
        sentences: document.getElementById('stat-sentences'),
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
            }
        });
    };

    const saveText = () => {
        chrome.storage.local.set({ savedText: mainTextarea.value });
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
        } catch(error) {
            console.error(`Error during transformation "${featureName}":`, error);
        }
    };

    // --- Nasłuchiwacze zdarzeń ---
    mainTextarea.addEventListener('input', updateStats);
    themeSwitcher.addEventListener('click', toggleTheme);
    
    applyButtons.forEach(button => {
        button.addEventListener('click', () => {
            applyTransformation(button.dataset.feature);
        });
    });

    clearButton.addEventListener('click', () => {
        mainTextarea.value = '';
        updateStats();
        saveText();
    });
    
    saveButton.addEventListener('click', saveText);

    // --- Inicjalizacja ---
    loadTheme();
    loadText();
});


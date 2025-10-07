const Features = {
    /**
     * Dodaje prefix i/lub suffix do każdej linii.
     */
    addPrefixSuffix(text, prefix = '', suffix = '') {
        if (!text) return '';
        return text.split('\n')
            .map(line => `${prefix}${line}${suffix}`)
            .join('\n');
    },

    /**
     * Łączy wszystkie linie w jedną, używając separatora.
     */
    joinLines(text, separator = ' ') {
        if (!text) return '';
        return text.split('\n').join(separator);
    },

    /**
     * Wyodrębnia określoną kolumnę z tekstu delimitowanego.
     */
    extractColumn(text, delimiter = ',', columnIndex = 0) {
        if (!text || isNaN(columnIndex) || columnIndex < 0) return '';
        return text.split('\n')
            .map(line => (line.split(delimiter)[columnIndex] || '').trim())
            .join('\n');
    },

    /**
     * Usuwa zduplikowane linie.
     */
    removeDuplicateLines(text) {
        if (!text) return '';
        const lines = text.split('\n');
        return [...new Set(lines)].join('\n');
    },

    /**
     * Usuwa wszystkie puste linie.
     */
    removeEmptyLines(text) {
        if (!text) return '';
        return text.split('\n')
            .filter(line => line.trim() !== '')
            .join('\n');
    },

    /**
     * Usuwa białe znaki z początku i końca każdej linii.
     */
    trimLines(text) {
        if (!text) return '';
        return text.split('\n')
            .map(line => line.trim())
            .join('\n');
    },
    
    /**
     * Usuwa nadmiarowe spacje, zostawiając pojedyncze.
     */
    removeExtraWhitespace(text) {
        if (!text) return '';
        return text.replace(/\s{2,}/g, ' ');
    },

    /**
     * Znajduje i zastępuje tekst.
     */
    findAndReplace(text, find, replace, isRegex, isCaseSensitive) {
        if (!text || !find) return text;
        
        let searchTerm = find;
        if (!isRegex) {
            // Zamienia znaki specjalne regex na ich literalne odpowiedniki
            searchTerm = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        const flags = 'g' + (isCaseSensitive ? '' : 'i');
        const regex = new RegExp(searchTerm, flags);
        
        return text.replace(regex, replace);
    }
};

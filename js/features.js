const Features = {
    _sortLines(text, compareFunction) {
        if (!text) return '';
        return text.split('\n').sort(compareFunction).join('\n');
    },

    sortAlphabetical(text, descending = false) {
        return this._sortLines(text, (a, b) => {
            const comparison = a.localeCompare(b);
            return descending ? -comparison : comparison;
        });
    },

    sortNumerical(text, descending = false) {
        return this._sortLines(text, (a, b) => {
            const numA = parseFloat(a) || 0;
            const numB = parseFloat(b) || 0;
            const comparison = numA - numB;
            return descending ? -comparison : comparison;
        });
    },

    sortbyLength(text, descending = false) {
        return this._sortLines(text, (a, b) => {
            const comparison = a.length - b.length;
            return descending ? -comparison : comparison;
        });
    },

    addPrefixSuffix(text, prefix = '', suffix = '') {
        if (!text) return '';
        return text.split('\n')
            .map(line => `${prefix}${line}${suffix}`)
            .join('\n');
    },

    joinLines(text, separator = ' ') {
        if (!text) return '';
        return text.split('\n').join(separator);
    },

    extractColumn(text, delimiter = ',', columnIndex = 0) {
        if (!text) return '';
        if (isNaN(columnIndex) || columnIndex < 0) {
            throw new Error(`Invalid column index: ${columnIndex}. Must be a non-negative number.`);
        }
        return text.split('\n')
            .map(line => (line.split(delimiter)[columnIndex] || '').trim())
            .join('\n');
    },

    removeDuplicateLines(text) {
        if (!text) return '';
        const lines = text.split('\n');
        return [...new Set(lines)].join('\n');
    },

    removeEmptyLines(text) {
        if (!text) return '';
        return text.split('\n')
            .filter(line => line.trim() !== '')
            .join('\n');
    },

    trimLines(text) {
        if (!text) return '';
        return text.split('\n')
            .map(line => line.trim())
            .join('\n');
    },
    
    removeExtraWhitespace(text) {
        if (!text) return '';
        return text.replace(/\s{2,}/g, ' ');
    },

    findAndReplace(text, find, replace, isRegex, isCaseSensitive) {
        if (!text || !find) return text;
        
        let searchTerm = find;
        if (!isRegex) {
            searchTerm = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        const flags = 'g' + (isCaseSensitive ? '' : 'i');
        
        try {
            const regex = new RegExp(searchTerm, flags);
            return text.replace(regex, replace);
        } catch (error) {
            throw new Error(`Invalid regular expression: ${error.message}`);
        }
    }
};
const Utils = {
    /**
     * Oblicza statystyki dla podanego tekstu.
     * @param {string} text - Tekst wejściowy.
     * @returns {object} Obiekt zawierający liczbę znaków, słów, linii i zdań.
     */
    calculateStats(text) {
        if (!text) {
            return { chars: 0, words: 0, lines: 1, sentences: 0 };
        }

        const chars = text.length;
        
        // Słowa: filtrujemy puste stringi, które mogą powstać po wielokrotnych spacjach
        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;

        // Linie: pusty tekst ma jedną linię
        const lines = text.split('\n').length;
        
        // Zdania: dzielimy po kropkach, wykrzyknikach, znakach zapytania, z opcjonalnym whitespace
        // Filtrujemy puste elementy, które mogą powstać na końcu tekstu
        const sentences = text.split(/[.!?]+\s*/).filter(s => s.trim().length > 0).length;

        return { chars, words, lines, sentences };
    }
};

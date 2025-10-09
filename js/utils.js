const Utils = {
    calculateStats(text) {
        if (!text) {
            return { chars: 0, words: 0, lines: 0, sentences: 0 };
        }

        const chars = text.length;
        
        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;

        const lines = text.split('\n').length;
        
        const sentences = text.split(/[.!?]+\s*/).filter(s => s.trim().length > 0).length;

        return { chars, words, lines, sentences };
    }
};
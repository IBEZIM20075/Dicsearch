document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const resultContainer = document.getElementById('resultContainer');
    const loading = document.getElementById('loading');

    let isSearching = false;

    async function searchWord(word) {
        if (isSearching) return;

        try {
            isSearching = true;
            loading.style.display = 'flex';
            resultContainer.style.display = 'none';
            resultContainer.innerHTML = '';

            await new Promise(resolve => setTimeout(resolve, 300));

            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Word not found,try another word');
            }

            displayResults(data[0]);
        } catch (error) {
            showError(error.message);
        } finally {
            loading.style.display = 'none';
            resultContainer.style.display = 'block';
            isSearching = false;
        }
    }

    function displayResults(data) {
        if (!data) {
            showError('No data received');
            return;
        }

        let html = `<h2 class="word">${data.word}</h2>`;
        
        if (data.phonetic) {
            html += `<p class="phonetic">${data.phonetic}</p>`;
        }

        if (data.meanings && data.meanings.length > 0) {
            data.meanings.forEach(meaning => {
                html += `
                    <div class="meaning">
                        <h3 class="part-of-speech">${meaning.partOfSpeech}</h3>
                        <ul>
                            ${meaning.definitions.map(def => `
                                <li class="definition">
                                    <p><strong>Definition:</strong> ${escapeHtml(def.definition)}</p>
                                    ${def.example ? `<p class="example"><em>Example:</em> ${escapeHtml(def.example)}</p>` : ''}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            });
        }

        resultContainer.innerHTML = html;
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function showError(message) {
        resultContainer.innerHTML = `
            <div class="error">
                <p>${escapeHtml(message)}</p>
                
            </div>
        `;
    }

    function handleSearch() {
        const word = searchInput.value.trim();
        if (word) {
            searchWord(word);
        } else {
            showError('Please enter a word to search');
            resultContainer.style.display = 'block';
        }
    }

    searchBtn.addEventListener('click', handleSearch);

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    searchInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-Z\s-]/g, '');
    });
});
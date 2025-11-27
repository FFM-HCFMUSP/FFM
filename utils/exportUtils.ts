interface CandidateData {
    [key: string]: any;
}

const convertToCSV = (data: CandidateData[], headers: { key: string, label: string }[]): string => {
    const headerRow = headers.map(h => h.label).join(';');
    const rows = data.map(row => {
        return headers.map(header => {
            const value = row[header.key] || '';
            const escaped = ('' + value).replace(/"/g, '""');
            return `"${escaped}"`;
        }).join(';');
    });
    return [headerRow, ...rows].join('\n');
};

export const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob(['\uFEFF' + content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const exportData = (format: 'csv' | 'json', data: CandidateData[], headers: { key: string, label: string }[]) => {
    if (!data || data.length === 0) {
        alert("Não há dados para exportar.");
        return;
    }

    if (format === 'csv') {
        const csvContent = convertToCSV(data, headers);
        downloadFile(csvContent, 'exportacao_candidatos.csv', 'text/csv;charset=utf-8;');
    } else if (format === 'json') {
        const jsonContent = JSON.stringify(data, null, 2);
        downloadFile(jsonContent, 'exportacao_candidatos.json', 'application/json;charset=utf-8;');
    }
};
